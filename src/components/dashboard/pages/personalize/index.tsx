import { useEffect, useState } from "react";
import { PageHead, type ActivePage } from "@/pages/DashboardPage";
import { api } from "@/lib/api";
import { ImagePicker } from "@/components/builder/ImagePicker";
import { Icon } from "@/components/auth/AuthIcons";
import { DashBtn } from '../../DashBtn'
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PALETTES, FONT_OPTIONS, getFontById, getPaletteById, createThemeFromPalette } from "@/lib/themeCatalog";

const inputCls = 'w-full px-2.5 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-indigo-400 box-border'
const labelTextCls = 'text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500'

interface PersonalizeProps { event: any | null; onReload: () => void; onNavigate: (p: ActivePage) => void }

export function Personalize({ event, onReload }: PersonalizeProps) {
  const { user } = useAuth()
  const isEssencial = user?.plan?.name === 'essencial'
  const [tab, setTab] = useState<'general' | 'media' | 'appearance'>('general')
  const [saving, setSaving] = useState(false)
  const [coverPreview, setCoverPreview] = useState('')
  const [form, setForm] = useState({ name: '', message: '', eventDate: '', hosts: '', subtitle: '' })
  const [paletteId, setPaletteId] = useState(PALETTES[0].id)
  const [fontId, setFontId] = useState('space-grotesk')
  const [fontScale, setFontScale] = useState(1)
  const [darkMode, setDarkMode] = useState(false)

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
    const matchedPalette = getPaletteById(d.theme?.paletteId) ?? PALETTES.find(p => p.primary === d.theme?.primary)
    setPaletteId(matchedPalette?.id ?? PALETTES[0].id)
    const matchedFont = FONT_OPTIONS.find(f => f.family === d.theme?.fontFamily)
    setFontId(matchedFont?.id ?? 'space-grotesk')
    setFontScale(d.theme?.fontScale ?? 1)
    setDarkMode(d.theme?.darkMode ?? false)
  }

  useEffect(() => { resetFromEvent(event) }, [event])

  const selectedPalette = getPaletteById(paletteId) ?? PALETTES[0]
  const selectedFont = getFontById(fontId) ?? FONT_OPTIONS[0]
  const effectiveFontScale = isEssencial ? 1 : fontScale
  const effectiveDarkMode = isEssencial ? false : darkMode

  const handleSave = async () => {
    if (!event?.id || saving) return
    setSaving(true)
    try {
      await api.updateEvent(event.id, {
        data: {
          name:        form.name,
          description: form.message,
          message:     form.message,
          hosts:       form.hosts,
          subtitle:    form.subtitle,
          coverUrl:    coverPreview,
          theme: {
            ...(event.data?.theme ?? {}),
            ...createThemeFromPalette(paletteId),
            fontFamily: selectedFont.family,
            fontScale:  isEssencial ? 1 : fontScale,
            darkMode:   isEssencial ? false : darkMode,
          },
        },
        coverUrl:  coverPreview,
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
    { id: 'general'    as const, label: 'Geral',     icon: <Icon.Doc     style={{ width: 14, height: 14 }} /> },
    { id: 'media'      as const, label: 'Mídia',     icon: <Icon.Camera  style={{ width: 14, height: 14 }} /> },
    { id: 'appearance' as const, label: 'Aparência', icon: <Icon.Sparkle style={{ width: 14, height: 14 }} /> },
  ]

  return (
    <>
      <PageHead
        eyebrow="Personalização"
        title="Sua página, do seu jeito"
        sub="Edite informações, foto de capa e aparência. As mudanças ficam visíveis ao salvar."
        actions={
          <>
            <DashBtn variant="ghost" onClick={() => resetFromEvent(event)} disabled={saving}>
              Descartar alterações
            </DashBtn>
            <DashBtn variant="primary" onClick={handleSave} disabled={saving}>
              <Icon.Check style={{ width: 15, height: 15 }} />{saving ? 'Salvando…' : 'Publicar mudanças'}
            </DashBtn>
          </>
        }
      />

      <div className="grid grid-cols-1 nav:grid-cols-[minmax(280px,340px)_1fr] gap-5">
        {/* Form panel */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-fit">
          {/* Tab bar */}
          <div className="flex border-b border-slate-100">
            {tabDefs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-2 py-3.5 text-[13px] font-medium cursor-pointer bg-transparent border-0 border-b-2 transition-colors',
                  tab === t.id
                    ? 'text-slate-900 border-indigo-500 bg-white'
                    : 'text-slate-500 border-transparent hover:text-slate-900',
                )}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-[18px] p-[22px]">
            {tab === 'general' && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className={labelTextCls}>Nome do evento</span>
                  <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Casamento Júlia & Marcos" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelTextCls}>Anfitriões</span>
                  <input className={inputCls} value={form.hosts} onChange={e => setForm(f => ({ ...f, hosts: e.target.value }))} placeholder="Ex: Júlia & Marcos" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelTextCls}>Subtítulo</span>
                  <input className={inputCls} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Ex: Florianópolis · 18 Out 2026" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelTextCls}>Data do evento</span>
                  <input className={inputCls} type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelTextCls}>Mensagem</span>
                  <textarea className={cn(inputCls, 'resize-y min-h-[90px] leading-[1.55]')} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Uma mensagem para os convidados…" />
                </label>
              </>
            )}

            {tab === 'media' && (
              <ImagePicker
                label="Foto de capa"
                value={coverPreview}
                onChange={setCoverPreview}
                uploadFn={(file) => api.uploadImage(file, 'event')}
                hint="JPG, PNG ou WebP · até 5 MB"
              />
            )}

            {tab === 'appearance' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Paleta</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PALETTES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPaletteId(p.id)}
                        title={p.name}
                        className={cn(
                          'relative w-9 h-9 rounded-[10px] border-2 overflow-hidden flex cursor-pointer transition-transform hover:scale-105',
                          paletteId === p.id ? 'border-slate-900 shadow-[0_0_0_2px_#fff_inset]' : 'border-transparent',
                        )}
                      >
                        <span className="flex-1" style={{ background: p.primary }} />
                        <span className="flex-1" style={{ background: p.secondary }} />
                        <span className="flex-1" style={{ background: p.background }} />
                        <span className="flex-1" style={{ background: p.accent }} />
                        <span className="flex-1" style={{ background: p.ink }} />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 mt-3 px-3 py-2.5 bg-slate-50 rounded-[10px] flex-wrap">
                    <span className="text-[12px] font-semibold text-slate-700">{selectedPalette.name}</span>
                    {(['primary', 'secondary', 'background', 'accent', 'ink'] as const).map((key) => (
                      <span key={key} className="inline-flex items-center gap-1">
                        <span className="w-[16px] h-[16px] rounded-md shrink-0 border border-slate-200" style={{ background: selectedPalette[key] }} />
                        <span className="font-mono text-[10px] text-slate-500">{selectedPalette[key]}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-2.5">Tipografia</div>
                  <div className="flex flex-col gap-1.5">
                    {FONT_OPTIONS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFontId(f.id)}
                        className={cn(
                          'relative w-full p-3 rounded-[10px] border-[1.5px] cursor-pointer text-left transition-all bg-white',
                          fontId === f.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        {fontId === f.id && (
                          <span className="absolute top-2.5 right-2.5 w-[18px] h-[18px] rounded-full bg-indigo-500 text-white inline-flex items-center justify-center">
                            <Icon.Check style={{ width: 10, height: 10 }} />
                          </span>
                        )}
                        <div className="text-left">
                          <div style={{ fontFamily: f.family, fontSize: 18, letterSpacing: '-0.02em', fontWeight: f.weight }}>{form.hosts || 'Anfitriões'}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{f.label} · {f.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={cn('relative', isEssencial && 'opacity-40')}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">
                      Tamanho do texto ({Math.round(fontScale * 100)}%)
                    </span>
                    {isEssencial && <Icon.Lock style={{ width: 11, height: 11 }} className="text-slate-400" />}
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.3}
                    step={0.05}
                    value={fontScale}
                    disabled={isEssencial}
                    onChange={e => setFontScale(Number(e.target.value))}
                    className={cn('w-full', isEssencial && 'cursor-not-allowed')}
                  />
                </div>

                <label className={cn('flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 rounded-[10px]', isEssencial ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer')}>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    disabled={isEssencial}
                    onChange={e => setDarkMode(e.target.checked)}
                  />
                  <span className="text-[13px] text-slate-700 font-medium">Modo escuro</span>
                  {isEssencial && <Icon.Lock style={{ width: 11, height: 11 }} className="ml-auto text-slate-400" />}
                </label>

                {isEssencial && (
                  <div className="text-[12px] text-indigo-600 bg-indigo-50 rounded-[10px] px-3 py-2.5">
                    Tamanho do texto e modo escuro são recursos do plano Pro.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ background: 'linear-gradient(180deg, #F1F5F9, #F8FAFC)', minHeight: 'clamp(280px, 50vh, 600px)' }}>
          <div className="flex items-center justify-between px-[18px] py-3.5 bg-white border-b border-slate-100">
            <div className="inline-flex gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="flex items-center gap-1 px-3.5 py-[7px] rounded-lg text-[13px] font-semibold text-slate-900 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <Icon.Globe style={{ width: 12, height: 12, marginRight: 4 }} />Preview
              </span>
            </div>
            {event?.slug && (
              <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-slate-500">
                <span className="w-[7px] h-[7px] rounded-full bg-emerald-500" />
                celebre.app/{event.slug}
              </div>
            )}
          </div>

          <div className="flex justify-center p-7">
            <div
              className="w-full max-w-[540px] rounded-[14px] overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.10)] border border-slate-200 transition-colors"
              style={{ background: effectiveDarkMode ? '#0F172A' : '#FFFFFF' }}
            >
              <div className="relative overflow-hidden" style={{ height: 'clamp(140px, 20vh, 240px)', background: `linear-gradient(135deg, ${selectedPalette.primary} 0%, ${selectedPalette.accent} 100%)` }}>
                {coverPreview && (
                  <img src={coverPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }} />
                <div className="absolute bottom-5 left-6 right-6 text-white">
                  {form.subtitle && <div style={{ fontSize: 11 * effectiveFontScale }} className="opacity-70 tracking-[0.16em] uppercase">{form.subtitle}</div>}
                  <div className="mt-1 leading-none tracking-[-0.02em]" style={{ fontFamily: selectedFont.family, fontSize: `calc(clamp(22px, 4vw, 36px) * ${effectiveFontScale})`, fontWeight: selectedFont.weight }}>
                    {form.hosts || form.name || '—'}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {form.message && (
                  <>
                    <div style={{ fontSize: 11 * effectiveFontScale }} className={cn('tracking-[0.12em] uppercase', effectiveDarkMode ? 'text-slate-400' : 'text-slate-500')}>Mensagem</div>
                    <p style={{ fontSize: 14 * effectiveFontScale }} className={cn('leading-[1.65] mt-2', effectiveDarkMode ? 'text-slate-300' : 'text-slate-600')}>{form.message}</p>
                  </>
                )}
                <button style={{ background: selectedPalette.accent, fontSize: 14 * effectiveFontScale }} className="mt-4 w-full h-11 rounded-xl text-white font-semibold border-0 cursor-pointer">
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
