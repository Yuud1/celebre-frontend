import { useEffect, useState } from "react";
import { PageHead, type ActivePage } from "../../pages/DashboardPage";
import { api } from "../../lib/api";
import { ImagePicker } from "../builder/ImagePicker";
import { Icon } from "../auth/AuthIcons";

// ─── Personalize Page ─────────────────────────────────────────
const PALETTES = [
  ['#0F172A', '#6366F1'], ['#3F2A1D', '#B8543A'],
  ['#1F3D2C', '#5B8C5E'], ['#1E1B4B', '#A855F7'],
  ['#0C4A6E', '#0EA5E9'], ['#831843', '#EC4899'],
]
const FONTS = [
  { id: 'grotesk' as const, label: 'Geometric', sub: 'Space Grotesk',   family: 'Space Grotesk, sans-serif',      weight: 600 },
  { id: 'serif'   as const, label: 'Editorial', sub: 'Instrument Serif', family: 'Instrument Serif, Georgia, serif', weight: 400 },
  { id: 'sans'    as const, label: 'Modern',    sub: 'Inter',            family: 'Inter, sans-serif',               weight: 600 },
]

interface PersonalizeProps { event: any | null; onReload: () => void; onNavigate: (p: ActivePage) => void }

export function Personalize({ event, onReload }: PersonalizeProps) {
  const [tab, setTab] = useState<'geral' | 'media' | 'aparencia'>('geral')
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [form, setForm] = useState({ name: '', message: '', eventDate: '', hosts: '', subtitle: '' })
  const [colorIdx, setColorIdx] = useState(0)
  const [font, setFont] = useState<'grotesk' | 'serif' | 'sans'>('grotesk')

  const resetFromEvent = (ev: any) => {
    if (!ev) return
    const d = ev.data ?? {}
    setForm({
      name:      d.name        ?? '',
      message:   d.description ?? d.message ?? '',
      eventDate: ev.eventDate  ? ev.eventDate.slice(0, 10) : '',
      hosts:     d.hosts       ?? '',
      subtitle:  d.subtitle    ?? '',
    })
    setCoverPreview(ev.coverUrl ?? d.coverUrl ?? '')
    setCoverFile(null)
    const pi = PALETTES.findIndex(p => p[0] === d.theme?.primary)
    setColorIdx(pi >= 0 ? pi : 0)
    const matchedFont = FONTS.find(f => f.family === d.theme?.fontFamily)
    setFont(matchedFont?.id ?? 'grotesk')
  }

  useEffect(() => { resetFromEvent(event) }, [event])

  const selectedFont = FONTS.find(f => f.id === font)!

  const handleSave = async () => {
    if (!event?.id || saving) return
    setSaving(true)
    try {
      let finalCoverUrl = coverPreview
      if (coverFile) {
        const { url } = await api.uploadEventCover(event.id, coverFile)
        finalCoverUrl = url
      }
      await api.updateEvent(event.id, {
        data: {
          name:        form.name,
          description: form.message,
          message:     form.message,
          hosts:       form.hosts,
          subtitle:    form.subtitle,
          coverUrl:    finalCoverUrl,
          theme: {
            ...(event.data?.theme ?? {}),
            primary:    PALETTES[colorIdx][0],
            secondary:  PALETTES[colorIdx][1],
            fontFamily: selectedFont.family,
          },
        },
        coverUrl:  finalCoverUrl,
        eventDate: form.eventDate || null,
      })
      onReload()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const tabDefs = [
    { id: 'geral'    as const, label: 'Geral',     icon: <Icon.Doc     style={{ width: 14, height: 14 }} /> },
    { id: 'media'    as const, label: 'Mídia',     icon: <Icon.Camera  style={{ width: 14, height: 14 }} /> },
    { id: 'aparencia'as const, label: 'Aparência', icon: <Icon.Sparkle style={{ width: 14, height: 14 }} /> },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--ca-line)',
    fontSize: 13, color: 'var(--ca-ink)', background: '#fff', boxSizing: 'border-box',
  }

  return (
    <>
      <PageHead
        eyebrow="Personalização"
        title="Sua página, do seu jeito"
        sub="Edite informações, foto de capa e aparência. As mudanças ficam visíveis ao salvar."
        actions={
          <>
            <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }} onClick={() => resetFromEvent(event)} disabled={saving}>
              Descartar alterações
            </button>
            <button className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13 }} onClick={handleSave} disabled={saving}>
              <Icon.Check style={{ width: 15, height: 15 }} />{saving ? 'Salvando…' : 'Publicar mudanças'}
            </button>
          </>
        }
      />

      <div className="cd-grid-personalize" style={{ gap: 20 }}>
        <div className="ca-card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--ca-line-soft)' }}>
            {tabDefs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: tab === t.id ? 'var(--ca-ink)' : 'var(--ca-muted)', background: tab === t.id ? '#fff' : 'transparent', borderBottom: tab === t.id ? '2px solid var(--ca-indigo)' : '2px solid transparent', border: 'none', cursor: 'pointer' }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {tab === 'geral' && (
              <>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ca-muted)' }}>Nome do evento</span>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Casamento Júlia & Marcos" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ca-muted)' }}>Anfitriões</span>
                  <input style={inputStyle} value={form.hosts} onChange={e => setForm(f => ({ ...f, hosts: e.target.value }))} placeholder="Ex: Júlia & Marcos" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ca-muted)' }}>Subtítulo</span>
                  <input style={inputStyle} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Ex: Florianópolis · 18 Out 2026" />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ca-muted)' }}>Data do evento</span>
                  <input style={inputStyle} type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ca-muted)' }}>Mensagem</span>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90, lineHeight: 1.55 }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Uma mensagem para os convidados…" />
                </label>
              </>
            )}

            {tab === 'media' && (
              <ImagePicker
                label="Foto de capa"
                value={coverPreview}
                onChange={(dataUrl, file) => { setCoverPreview(dataUrl); setCoverFile(file ?? null) }}
                hint="JPG, PNG ou WebP · até 5 MB"
              />
            )}

            {tab === 'aparencia' && (
              <>
                <div>
                  <div className="ca-row ca-row--between" style={{ marginBottom: 10 }}>
                    <span className="ca-eyebrow">Paleta</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                    {PALETTES.map((p, i) => (
                      <button key={i} onClick={() => setColorIdx(i)} className={'cd-swatch' + (colorIdx === i ? ' cd-swatch--on' : '')} style={{ background: `linear-gradient(135deg, ${p[0]} 50%, ${p[1]} 50%)` }} />
                    ))}
                  </div>
                  <div className="ca-row" style={{ gap: 10, marginTop: 12, padding: '10px 12px', background: 'var(--ca-bg-soft)', borderRadius: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: PALETTES[colorIdx][0] }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ca-ink-3)' }}>{PALETTES[colorIdx][0]}</span>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: PALETTES[colorIdx][1], marginLeft: 'auto' }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ca-ink-3)' }}>{PALETTES[colorIdx][1]}</span>
                  </div>
                </div>

                <div>
                  <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Tipografia</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => setFont(f.id)} className={'ca-pick' + (font === f.id ? ' ca-pick--on' : '')} style={{ padding: 12, borderRadius: 10 }}>
                        {font === f.id && <span className="ca-pick__check" style={{ top: 10, right: 10, width: 18, height: 18 }}><Icon.Check style={{ width: 10, height: 10 }} /></span>}
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontFamily: f.family, fontSize: 18, letterSpacing: '-0.02em', fontWeight: f.weight }}>{form.hosts || 'Anfitriões'}</div>
                          <div style={{ fontSize: 11, color: 'var(--ca-muted)', marginTop: 2 }}>{f.label} · {f.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="ca-card" style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(180deg, #F1F5F9, #F8FAFC)', minHeight: 600 }}>
          <div className="ca-row ca-row--between" style={{ padding: '14px 18px', background: '#fff', borderBottom: '1px solid var(--ca-line-soft)' }}>
            <div className="cd-tabs">
              <span className="cd-tab cd-tab--on"><Icon.Globe style={{ width: 12, height: 12, marginRight: 4 }} />Preview</span>
            </div>
            {event?.slug && (
              <div className="ca-row ca-row--gap-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--ca-muted)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: '#10B981' }} />
                celebre.app/{event.slug}
              </div>
            )}
          </div>

          <div style={{ padding: 28, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 540, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 50px rgba(15,23,42,0.10)', border: '1px solid var(--ca-line)' }}>
              <div style={{ height: 240, position: 'relative', background: `linear-gradient(135deg, ${PALETTES[colorIdx][0]} 0%, ${PALETTES[colorIdx][1]} 100%)`, overflow: 'hidden' }}>
                {coverPreview && (
                  <img src={coverPreview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, color: '#fff' }}>
                  {form.subtitle && <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{form.subtitle}</div>}
                  <div style={{ fontFamily: selectedFont.family, fontSize: 36, marginTop: 4, fontWeight: selectedFont.weight, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {form.hosts || form.name || '—'}
                  </div>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                {form.message && (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mensagem</div>
                    <p style={{ fontSize: 14, color: 'var(--ca-ink-3)', lineHeight: 1.65, marginTop: 8 }}>{form.message}</p>
                  </>
                )}
                <button style={{ marginTop: 16, width: '100%', height: 44, borderRadius: 12, background: PALETTES[colorIdx][1], color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                  Contribuir com um presente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}