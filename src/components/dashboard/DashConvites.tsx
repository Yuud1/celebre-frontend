import { useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { PageHead } from '../../pages/DashboardPage'
import { ConviteRenderer, ConviteWaPreview, CvMiniInvite } from '../convites/ConviteRenderer'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

interface DashConvitesProps {
  event: any
}

const ACCENTS: Record<string, string> = {
  casamento: '#74865f',
  'cha-panela': '#8b79c2',
  'cha-bebe': '#d18a86',
  'cha-revelacao': '#c98a3f',
}

// Google Fonts URL used both in index.html and here for embedding
const GFONTS_URL =
  'https://fonts.googleapis.com/css2?family=Allura&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Pinyon+Script&family=Yellowtail&display=swap'

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

// Pre-fetch Google Fonts CSS + font files and return a self-contained CSS string.
// html-to-image cannot read cross-origin <link> stylesheet rules, so we bypass
// its own font-embedding and provide the CSS directly via the fontEmbedCSS option.
async function buildFontEmbedCSS(): Promise<string> {
  const cssRes = await fetch(GFONTS_URL)
  let css = await cssRes.text()

  const fontUrls = [...css.matchAll(/url\((https?:\/\/[^)]+)\)/g)].map(m => m[1])

  await Promise.all(
    fontUrls.map(async url => {
      try {
        const res = await fetch(url)
        const buf = await res.arrayBuffer()
        const b64 = arrayBufferToBase64(buf)
        const mime = url.includes('.woff2') ? 'font/woff2' : url.includes('.woff') ? 'font/woff' : 'font/truetype'
        css = css.replace(url, `data:${mime};base64,${b64}`)
      } catch {
        // leave the URL as-is if fetch fails; font may still render from browser cache
      }
    })
  )
  return css
}

// Try to fetch an image URL as a base64 data URL so html-to-image can embed it
// even when the server doesn't send CORS headers. Falls back to undefined.
async function fetchAsDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { mode: 'cors' })
    const blob = await res.blob()
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(blob)
    })
  } catch {
    return undefined
  }
}

export function DashConvites({ event }: DashConvitesProps) {
  const hiddenRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [fontEmbedCSS, setFontEmbedCSS] = useState('')
  const [coverDataUrl, setCoverDataUrl] = useState<string | undefined>()
  const [capturing, setCapturing] = useState(false)

  const eventType = event?.data?.eventType ?? 'casamento'
  const accent = event?.data?.theme?.accent ?? ACCENTS[eventType] ?? '#74865f'
  const slug = event?.slug ?? ''

  // QR code (real, scannable)
  useEffect(() => {
    if (!slug) return
    QRCode.toDataURL(`https://celebre.com.br/p/${slug}`, {
      width: 320, margin: 1,
      color: { dark: '#34302e', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {})
  }, [slug])

  // Pre-fetch and embed Google Fonts as base64 (one-time per page load)
  useEffect(() => {
    buildFontEmbedCSS().then(setFontEmbedCSS).catch(() => {})
  }, [])

  // Pre-fetch cover image through the backend proxy so the browser can get
  // it with CORS (R2 public URLs don't send CORS headers by default).
  useEffect(() => {
    const url = event?.data?.coverUrl
    if (!url) return
    const proxyUrl = `${API_BASE}/upload/proxy-image?url=${encodeURIComponent(url)}`
    fetchAsDataUrl(proxyUrl).then(setCoverDataUrl)
  }, [event?.data?.coverUrl])

  // Capture the hidden full-res element as PNG
  const capture = async (): Promise<string> => {
    if (!hiddenRef.current) throw new Error('no ref')
    await document.fonts.ready
    return toPng(hiddenRef.current, {
      width: 1080,
      height: 1920,
      pixelRatio: 1,
      // Bypass cross-origin stylesheet rule access — we supply embedded fonts directly
      fontEmbedCSS: fontEmbedCSS || undefined,
      // Skip re-fetching images; they're already embedded as data URLs in the hidden render
      skipAutoScale: false,
    })
  }

  const download = async () => {
    if (capturing) return
    setCapturing(true)
    try {
      const dataUrl = await capture()
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `convite-${slug || 'evento'}.png`
      a.click()
    } catch(error: unknown) {
      console.error(error)
      alert('Não foi possível gerar a imagem. Tente novamente.')
    } finally {
      setCapturing(false)
    }
  }

  const share = async () => {
    if (capturing) return
    if (!navigator.share) { await download(); return }
    setCapturing(true)
    try {
      const dataUrl = await capture()
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `convite-${slug || 'evento'}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Convite — ${event?.data?.name ?? 'Evento'}` })
      } else {
        await download()
      }
    } catch {
    } finally {
      setCapturing(false)
    }
  }

  if (!event) return null

  const PREVIEW_W = 320
  const previewScale = PREVIEW_W / 1080
  const previewH = Math.round(1920 * previewScale)

  const WA_SCALE = 0.62
  const waW = Math.round(460 * WA_SCALE)
  const waH = Math.round(940 * WA_SCALE)

  // captureEvent uses the proxied data URL so html-to-image can embed the image
  // without any CORS fetch. Falls back to '' (no image) if the proxy prefetch
  // hasn't completed — never passes the raw R2 URL, which would cause CORS errors
  // because html-to-image scans all <img> elements in the document.
  const captureEvent = { ...event, data: { ...event.data, coverUrl: coverDataUrl ?? '' } }

  const hasCover = !!event?.data?.coverUrl
  const ready = !!qrDataUrl && !!fontEmbedCSS && (!hasCover || !!coverDataUrl)

  return (
    <div className="cd-convites">
      <PageHead
        eyebrow="Compartilhamento"
        title="Convite Digital"
        sub="Gere e compartilhe o convite do seu evento como imagem para Story ou WhatsApp."
      />

      <div className="cd-convites__panels">
        {/* ── invite preview ── */}
        <div className="cd-convites__preview-wrap">
          <div className="cd-convites__preview-box" style={{ height: previewH + 48 }}>
            <div style={{ width: PREVIEW_W, height: previewH, overflow: 'hidden', borderRadius: 12, boxShadow: '0 4px 24px rgba(30,24,30,0.12)' }}>
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 1080, height: 1920 }}>
                <ConviteRenderer event={event} qrDataUrl={qrDataUrl} />
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ca-muted)', textAlign: 'center' }}>
            Formato Story · 1080 × 1920 px
          </p>
        </div>

        {/* ── WA preview + actions ── */}
        <div className="cd-convites__actions">
          <div className="cd-convites__wa-wrap">
            <div style={{ width: waW, height: waH, overflow: 'hidden', borderRadius: 24, boxShadow: '0 8px 32px rgba(30,24,30,0.14)' }}>
              <div style={{ transform: `scale(${WA_SCALE})`, transformOrigin: 'top left', width: 460, height: 940 }}>
                <ConviteWaPreview event={event} accent={accent}>
                  <CvMiniInvite w={330}>
                    <ConviteRenderer event={event} qrDataUrl={qrDataUrl} />
                  </CvMiniInvite>
                </ConviteWaPreview>
              </div>
            </div>
          </div>

          <div className="cd-convites__btn-group">
            <button
              className="ca-btn ca-btn--primary"
              style={{ height: 44, fontSize: 14, justifyContent: 'center' }}
              onClick={download}
              disabled={capturing || !ready}
            >
              {capturing ? 'Gerando…' : !ready ? 'Preparando…' : '↓ Baixar PNG'}
            </button>

            <button
              className="ca-btn ca-btn--secondary"
              style={{ height: 44, fontSize: 14, justifyContent: 'center' }}
              onClick={share}
              disabled={capturing || !ready}
            >
              Compartilhar via WhatsApp / Stories
            </button>
          </div>

          <div className="cd-convites__hint">
            <b>Instagram Stories:</b> baixe o PNG e faça upload no Stories. O formato 1080×1920 já é o ideal.
          </div>

          <div className="cd-convites__hint">
            Link do evento:<br />
            <a href={`https://celebre.com.br/p/${slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--ca-indigo)', fontWeight: 500, wordBreak: 'break-all' }}>
              celebre.com.br/p/{slug}
            </a>
          </div>
        </div>
      </div>

      {/* hidden 1080×1920 render used only for PNG capture */}
      <div aria-hidden="true" style={{ position: 'fixed', left: -9999, top: -9999, pointerEvents: 'none', zIndex: -1 }}>
        <div ref={hiddenRef} style={{ width: 1080, height: 1920 }}>
          <ConviteRenderer event={captureEvent} qrDataUrl={qrDataUrl} />
        </div>
      </div>
    </div>
  )
}
