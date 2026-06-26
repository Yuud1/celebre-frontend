import { useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { PageHead } from '../../../pages/DashboardPage'
import { ConviteRenderer, ConviteWaPreview, CvMiniInvite } from '../../convites/ConviteRenderer'
import { DashBtn } from '../DashBtn'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

interface DashConvitesProps { event: any }

const ACCENTS: Record<string, string> = {
  casamento: '#74865f',
  'cha-panela': '#8b79c2',
  'cha-bebe': '#d18a86',
  'cha-revelacao': '#c98a3f',
}

const GFONTS_URL =
  'https://fonts.googleapis.com/css2?family=Allura&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Pinyon+Script&family=Yellowtail&display=swap'

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

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
      } catch { /* leave URL as-is */ }
    })
  )
  return css
}

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
  const [pregenFile, setPregenFile] = useState<File | null>(null)

  const eventType = event?.data?.eventType ?? 'casamento'
  const accent = event?.data?.theme?.accent ?? ACCENTS[eventType] ?? '#74865f'
  const slug = event?.slug ?? ''

  const hasCover = !!event?.data?.coverUrl
  const ready = !!event && !!qrDataUrl && !!fontEmbedCSS && (!hasCover || !!coverDataUrl)

  useEffect(() => {
    if (!slug) return
    QRCode.toDataURL(`https://celebre.com.br/p/${slug}`, {
      width: 320, margin: 1,
      color: { dark: '#34302e', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {})
  }, [slug])

  useEffect(() => {
    buildFontEmbedCSS().then(setFontEmbedCSS).catch(() => {})
  }, [])

  useEffect(() => {
    const url = event?.data?.coverUrl
    if (!url) return
    const proxyUrl = `${API_BASE}/upload/proxy-image?url=${encodeURIComponent(url)}`
    fetchAsDataUrl(proxyUrl).then(setCoverDataUrl)
  }, [event?.data?.coverUrl])

  useEffect(() => {
    if (!ready) { setPregenFile(null); return }
    let cancelled = false
    let raf1: number, raf2: number
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(async () => {
        if (cancelled) return
        try {
          await document.fonts.ready
          const dataUrl = await capture()
          const res = await fetch(dataUrl)
          const blob = await res.blob()
          if (!cancelled) setPregenFile(new File([blob], `convite-${slug || 'evento'}.png`, { type: 'image/png' }))
        } catch (e) {
          console.error('[DashConvites] pregen failed:', e)
        }
      })
    })
    return () => { cancelled = true; cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [ready, slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const capture = async (): Promise<string> => {
    if (!hiddenRef.current) throw new Error('no ref')
    await document.fonts.ready
    const opts = { width: 1080, height: 1920, pixelRatio: 1, fontEmbedCSS: fontEmbedCSS || undefined }
    await toPng(hiddenRef.current, opts).catch(() => {})
    const dataUrl = await toPng(hiddenRef.current, opts)
    console.log('[capture] dataUrl length:', dataUrl.length, dataUrl.length < 5000 ? '⚠️ blank?' : '✓')
    if (dataUrl.length < 5000) throw new Error(`blank image (${dataUrl.length} bytes)`)
    return dataUrl
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
    } catch (error: unknown) {
      console.error(error)
      alert('Não foi possível gerar a imagem. Tente novamente.')
    } finally {
      setCapturing(false)
    }
  }

  const share = async () => {
    if (capturing) return
    if (!navigator.share) { await download(); return }
    if (pregenFile) {
      try {
        if (navigator.canShare?.({ files: [pregenFile] })) {
          await navigator.share({ files: [pregenFile], title: `Convite — ${event?.data?.name ?? 'Evento'}` })
        } else {
          await download()
        }
      } catch { /* user cancelled */ }
      return
    }
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
    } catch (error: unknown) {
      console.error(error)
      alert('Não foi possível compartilhar. Tente baixar o PNG.')
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

  const captureEvent = { ...event, data: { ...event.data, coverUrl: coverDataUrl ?? '' } }

  return (
    <div>
      <PageHead
        eyebrow="Compartilhamento"
        title="Convite Digital"
        sub="Gere e compartilhe o convite do seu evento como imagem para Story ou WhatsApp."
      />

      {/* Two-panel layout */}
      <div className="flex flex-col nav:flex-row gap-8 items-start">
        {/* Story preview */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col items-center" style={{ height: previewH + 48 }}>
            <div style={{ width: PREVIEW_W, height: previewH, overflow: 'hidden', borderRadius: 12, boxShadow: '0 4px 24px rgba(30,24,30,0.12)' }}>
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 1080, height: 1920 }}>
                <ConviteRenderer event={event} qrDataUrl={qrDataUrl} />
              </div>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 text-center">Formato Story · 1080 × 1920 px</p>
        </div>

        {/* WA preview + actions */}
        <div className="flex flex-col items-center gap-5 flex-1">
          <div style={{ width: waW, height: waH, overflow: 'hidden', borderRadius: 24, boxShadow: '0 8px 32px rgba(30,24,30,0.14)' }}>
            <div style={{ transform: `scale(${WA_SCALE})`, transformOrigin: 'top left', width: 460, height: 940 }}>
              <ConviteWaPreview event={event} accent={accent}>
                <CvMiniInvite w={330}>
                  <ConviteRenderer event={event} qrDataUrl={qrDataUrl} />
                </CvMiniInvite>
              </ConviteWaPreview>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
            <DashBtn
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={download}
              disabled={capturing || !ready}
            >
              {capturing ? 'Gerando…' : !ready ? 'Preparando…' : '↓ Baixar PNG'}
            </DashBtn>

            <DashBtn
              variant="ghost"
              size="lg"
              className="w-full justify-center"
              onClick={share}
              disabled={capturing || !ready}
            >
              Compartilhar via WhatsApp / Stories
            </DashBtn>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12.5px] text-slate-600 max-w-[280px] leading-relaxed">
            <strong>Instagram Stories:</strong> baixe o PNG e faça upload no Stories. O formato 1080×1920 já é o ideal.
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12.5px] text-slate-600 max-w-[280px]">
            Link do evento:<br />
            <a href={`https://celebre.com.br/p/${slug}`} target="_blank" rel="noreferrer" className="text-indigo-500 font-medium break-all">
              celebre.com.br/p/{slug}
            </a>
          </div>
        </div>
      </div>

      {/* Hidden 1080×1920 render for PNG capture */}
      <div aria-hidden="true" className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1] overflow-hidden" style={{ width: 1080, height: 1920 }}>
        <div ref={hiddenRef} style={{ width: 1080, height: 1920 }}>
          <ConviteRenderer event={captureEvent} qrDataUrl={qrDataUrl} />
        </div>
      </div>
    </div>
  )
}
