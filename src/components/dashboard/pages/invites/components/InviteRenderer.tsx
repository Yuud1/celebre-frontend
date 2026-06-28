import { useMemo } from 'react'
import '@/styles/convites.css'
import { parseISO, format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { computeThemeVars } from '@/lib/themeColors'
import type { EventTypeId } from './inviteTemplates'
import { TEMPLATES } from './inviteTemplates'
import { InviteBody, InviteFooter, InviteHeaderOverlay, InviteHeaderArch } from './InviteLayout'

function parseEventDate(iso: string | undefined): Date | null {
  if (!iso) return null
  const d = parseISO(iso)
  return isValid(d) ? d : null
}

export interface InviteRendererProps {
  event: {
    slug: string
    eventDate?: string
    data: {
      eventType?: EventTypeId
      hosts?: string
      name?: string
      location?: string
      message?: string
      coverUrl?: string
      theme?: { accent?: string }
    }
  }
  qrDataUrl: string
}

export function InviteRenderer({ event, qrDataUrl }: InviteRendererProps) {
  const eventType: EventTypeId = (event.data.eventType as EventTypeId) ?? 'casamento'
  const tpl = TEMPLATES[eventType] ?? TEMPLATES['casamento']
  const accent = event.data.theme?.accent ?? tpl.defaultAccent

  const names = event.data.hosts || event.data.name || 'Evento'
  const location = event.data.location || 'A confirmar'
  const link = `celebre.fun/p/${event.slug}`

  const themeVars = useMemo(() => computeThemeVars(accent), [accent])

  const date = useMemo(() => {
    const d = parseEventDate(event.eventDate)
    if (!d) return 'Em breve'
    return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  }, [event.eventDate])

  const dateLabel = useMemo(() => {
    const d = parseEventDate(event.eventDate)
    if (!d) return ''
    return format(d, 'dd/MM/yyyy')
  }, [event.eventDate])

  const useOverlay = eventType === 'casamento' || eventType === 'cha-panela'
  const coverUrl = event.data.coverUrl

  return (
    <div className="cv-invite" style={themeVars as React.CSSProperties}>
      {useOverlay
        ? <InviteHeaderOverlay icon={tpl.icon} headline={tpl.headline} headCls={tpl.headCls} headSize={tpl.headSize} mark={tpl.mark} label={tpl.label} coverUrl={coverUrl} />
        : <InviteHeaderArch   icon={tpl.icon} headline={tpl.headline} headCls={tpl.headCls} headSize={tpl.headSize} label={tpl.label} coverUrl={coverUrl} />
      }
      <InviteBody
        message={tpl.defaultMessage}
        message2={tpl.defaultMessage2}
        date={date}
        location={location}
        link={link}
        qrDataUrl={qrDataUrl}
        thanks={tpl.defaultThanks}
        thanksSub={tpl.defaultThanksSub}
      />
      <InviteFooter names={names} dateLabel={dateLabel} nameCls={tpl.nameCls} nameSize={tpl.nameSize} mark={tpl.mark} />
    </div>
  )
}

export function MiniInvite({ children, w = 280 }: { children: React.ReactNode; w?: number }) {
  const scale = w / 1080
  return (
    <div style={{ width: w, height: 1920 * scale, overflow: 'hidden', position: 'relative', borderRadius: 8 }}>
      <div style={{ width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}

export function InviteWhatsAppPreview({ event, accent, children }: {
  event: InviteRendererProps['event']
  accent: string
  children: React.ReactNode
}) {
  const names = event.data.hosts || event.data.name || 'Evento'
  const initials = names.split('&').map((p: string) => p.trim()[0] ?? '').join('').slice(0, 2)
  const link = `celebre.com.br/p/${event.slug}`
  const tpl = TEMPLATES[(event.data.eventType as EventTypeId) ?? 'casamento']
  const themeVars = useMemo(() => computeThemeVars(accent), [accent])

  return (
    <div className="cv-wa" style={themeVars as React.CSSProperties}>
      <div className="cv-wa__screen">
        <div className="cv-wa__bar">
          <div className="cv-wa__avatar">{initials || 'C'}</div>
          <div style={{ flex: 1 }}>
            <div className="cv-wa__name">{names}</div>
            <div className="cv-wa__status">online agora</div>
          </div>
        </div>
        <div className="cv-wa__chat">
          <div className="cv-wa__bubble">
            <div className="cv-wa__img">{children}</div>
            <div className="cv-wa__meta">agora</div>
          </div>
          <div className="cv-wa__msg">
            <div className="cv-wa__preview-card">
              <div className="cv-wa__msg-title">{tpl.label} · {names}</div>
              <div className="cv-wa__msg-body">Acesse nosso evento e confira a lista de presentes 💛</div>
            </div>
            <div className="cv-wa__msg-link">{link}</div>
            <div className="cv-wa__meta">agora</div>
          </div>
        </div>
      </div>
    </div>
  )
}
