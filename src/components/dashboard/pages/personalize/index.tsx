import { useEffect, useState } from "react";
import { PageHead, type ActivePage } from "@/pages/DashboardPage";
import { api } from "@/lib/api";
import { Icon } from "@/components/auth/AuthIcons";
import { cn } from "@/lib/utils";
import { EventEditor } from "@/components/shared/EventEditor";
import { useAutoSave } from "@/hooks/useAutoSave";
import { createThemeFromPalette, getPaletteById } from "@/lib/themeCatalog";
import { usePaletteCatalog, FALLBACK_PALETTE } from "@/contexts/PaletteCatalogContext";
import type { EventContent, EventTheme, EventTypeId } from "@/types/event";

interface PersonalizeProps { event: any | null; onReload: () => void; onNavigate: (p: ActivePage) => void }

const emptyContent: EventContent = {
  name: '',
  subtitle: '',
  hosts: '',
  eventDate: '',
  location: '',
  message: '',
  signature: '',
  coverUrl: '',
  gifts: [],
}

export function Personalize({ event }: PersonalizeProps) {
  const { palettes } = usePaletteCatalog()
  const [eventType, setEventType] = useState<EventTypeId>('casamento')
  const [content, setContent] = useState<EventContent>(emptyContent)
  const [theme, setTheme] = useState<EventTheme>(() => createThemeFromPalette(FALLBACK_PALETTE.id, [FALLBACK_PALETTE]))

  const resetFromEvent = (ev: any) => {
    if (!ev) return
    const d = ev.data ?? {}
    setEventType(d.eventType ?? 'casamento')
    setContent({
      name:      d.name        ?? '',
      subtitle:  d.subtitle    ?? '',
      hosts:     d.hosts       ?? '',
      eventDate: ev.eventDate  ? ev.eventDate.slice(0, 10) : '',
      location:  d.location    ?? '',
      message:   d.description ?? d.message ?? '',
      signature: d.signature   ?? '',
      coverUrl:  ev.coverUrl   ?? d.coverUrl ?? '',
      gifts:     [],
      sections:  d.sections,
    })
    const matchedPalette = getPaletteById(d.theme?.paletteId, palettes) ?? palettes.find(p => p.primary === d.theme?.primary)
    setTheme({
      ...createThemeFromPalette(matchedPalette?.id ?? FALLBACK_PALETTE.id, palettes.length ? palettes : [FALLBACK_PALETTE]),
      fontFamily: d.theme?.fontFamily ?? '',
      fontScale:  d.theme?.fontScale ?? 1,
      darkMode:   d.theme?.darkMode ?? false,
    })
  }

  useEffect(() => { resetFromEvent(event) }, [event, palettes])

  const handleContent = (patch: Partial<EventContent>) => setContent((c) => ({ ...c, ...patch }))
  const handleTheme = (patch: Partial<EventTheme>) => setTheme((t) => ({ ...t, ...patch }))
  const noopGift = () => {}
  const noopAddGift = () => {}

  // Mesmo mecanismo de auto-save debounced do Builder (ver BuilderPage.tsx).
  const { saving } = useAutoSave(
    () => api.updateEvent(event.id, {
      data: {
        name:        content.name,
        description: content.message,
        message:     content.message,
        hosts:       content.hosts,
        subtitle:    content.subtitle,
        location:    content.location,
        signature:   content.signature,
        sections:    content.sections,
        coverUrl:    content.coverUrl,
        theme,
      },
      coverUrl:  content.coverUrl,
      eventDate: content.eventDate || null,
    }),
    [content, theme],
    { enabled: !!event?.id },
  )

  return (
    <>
      <PageHead
        eyebrow="Personalização"
        title="Sua página, do seu jeito"
        sub="Edite informações, foto de capa e aparência. As mudanças salvam automaticamente."
        actions={
          <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
            {saving ? (
              <>Salvando…</>
            ) : (
              <><Icon.Check style={{ width: 14, height: 14 }} className="text-emerald-500" />Salvo</>
            )}
          </span>
        }
      />

      <div className="grid grid-cols-1 nav:grid-cols-[minmax(280px,340px)_1fr] gap-5">
        {/* Form panel */}
        <EventEditor
          eventType={eventType}
          content={content}
          theme={theme}
          onContent={handleContent}
          onTheme={handleTheme}
          onGift={noopGift}
          onAddGift={noopAddGift}
          onRemoveGift={noopGift}
          hideGifts
        />

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
              style={{ background: theme.darkMode ? '#0F172A' : '#FFFFFF' }}
            >
              <div className="relative overflow-hidden" style={{ height: 'clamp(140px, 20vh, 240px)', background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)` }}>
                {content.coverUrl && (
                  <img src={content.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }} />
                <div className="absolute bottom-5 left-6 right-6 text-white">
                  {content.subtitle && <div style={{ fontSize: 11 * theme.fontScale }} className="opacity-70 tracking-[0.16em] uppercase">{content.subtitle}</div>}
                  <div className="mt-1 leading-none tracking-[-0.02em]" style={{ fontFamily: theme.fontFamily || undefined, fontSize: `calc(clamp(22px, 4vw, 36px) * ${theme.fontScale})` }}>
                    {content.hosts || content.name || '—'}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {content.message && (
                  <>
                    <div style={{ fontSize: 11 * theme.fontScale }} className={cn('tracking-[0.12em] uppercase', theme.darkMode ? 'text-slate-400' : 'text-slate-500')}>Mensagem</div>
                    <p style={{ fontSize: 14 * theme.fontScale }} className={cn('leading-[1.65] mt-2', theme.darkMode ? 'text-slate-300' : 'text-slate-600')}>{content.message}</p>
                  </>
                )}
                <button style={{ background: theme.accent, fontSize: 14 * theme.fontScale }} className="mt-4 w-full h-11 rounded-xl text-white font-semibold border-0 cursor-pointer">
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
