import { useEffect, useState } from "react";
import { PageHead, type ActivePage } from "../../pages/DashboardPage";
import { api } from "../../lib/api";
import { ImagePicker } from "../builder/ImagePicker";
import { Icon } from "../auth/AuthIcons";
import { DashBtn } from "./DashShared";
import { cn } from "@/lib/utils";

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

const inputCls = 'w-full px-2.5 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-indigo-400 box-border'
const labelTextCls = 'text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500'

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
    { id: 'geral'     as const, label: 'Geral',     icon: <Icon.Doc     style={{ width: 14, height: 14 }} /> },
    { id: 'media'     as const, label: 'Mídia',     icon: <Icon.Camera  style={{ width: 14, height: 14 }} /> },
    { id: 'aparencia' as const, label: 'Aparência', icon: <Icon.Sparkle style={{ width: 14, height: 14 }} /> },
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
            {tab === 'geral' && (
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
                onChange={(dataUrl) => { setCoverPreview(dataUrl); setCoverFile(null) }}
                hint="JPG, PNG ou WebP · até 5 MB"
              />
            )}

            {tab === 'aparencia' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400">Paleta</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {PALETTES.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setColorIdx(i)}
                        className={cn(
                          'w-9 h-9 rounded-[10px] border-2 cursor-pointer transition-transform hover:scale-105',
                          colorIdx === i ? 'border-slate-900 shadow-[0_0_0_2px_#fff_inset]' : 'border-transparent',
                        )}
                        style={{ background: `linear-gradient(135deg, ${p[0]} 50%, ${p[1]} 50%)` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 mt-3 px-3 py-2.5 bg-slate-50 rounded-[10px]">
                    <span className="w-[22px] h-[22px] rounded-md shrink-0" style={{ background: PALETTES[colorIdx][0] }} />
                    <span className="font-mono text-[11px] text-slate-500">{PALETTES[colorIdx][0]}</span>
                    <span className="w-[22px] h-[22px] rounded-md ml-auto shrink-0" style={{ background: PALETTES[colorIdx][1] }} />
                    <span className="font-mono text-[11px] text-slate-500">{PALETTES[colorIdx][1]}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 mb-2.5">Tipografia</div>
                  <div className="flex flex-col gap-1.5">
                    {FONTS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFont(f.id)}
                        className={cn(
                          'relative w-full p-3 rounded-[10px] border-[1.5px] cursor-pointer text-left transition-all bg-white',
                          font === f.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        {font === f.id && (
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
            <div className="w-full max-w-[540px] bg-white rounded-[14px] overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.10)] border border-slate-200">
              <div className="relative overflow-hidden" style={{ height: 'clamp(140px, 20vh, 240px)', background: `linear-gradient(135deg, ${PALETTES[colorIdx][0]} 0%, ${PALETTES[colorIdx][1]} 100%)` }}>
                {coverPreview && (
                  <img src={coverPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }} />
                <div className="absolute bottom-5 left-6 right-6 text-white">
                  {form.subtitle && <div className="text-[11px] opacity-70 tracking-[0.16em] uppercase">{form.subtitle}</div>}
                  <div className="mt-1 leading-none tracking-[-0.02em]" style={{ fontFamily: selectedFont.family, fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: selectedFont.weight }}>
                    {form.hosts || form.name || '—'}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {form.message && (
                  <>
                    <div className="text-[11px] text-slate-500 tracking-[0.12em] uppercase">Mensagem</div>
                    <p className="text-[14px] text-slate-600 leading-[1.65] mt-2">{form.message}</p>
                  </>
                )}
                <button className="mt-4 w-full h-11 rounded-xl text-white font-semibold text-[14px] border-0 cursor-pointer" style={{ background: PALETTES[colorIdx][1] }}>
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
