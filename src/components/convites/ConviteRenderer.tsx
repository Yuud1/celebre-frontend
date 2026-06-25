import { useMemo } from 'react'
import '../../styles/convites.css'
import { computeThemeVars } from '../../lib/themeColors'

// ── event type config ────────────────────────────────────────────
type EventTypeId = 'casamento' | 'cha-bebe' | 'cha-revelacao' | 'cha-panela'

interface TemplateConfig {
  label: string
  icon: IconName
  headCls: string
  nameCls: string
  headSize: number
  nameSize: number
  headline: string
  defaultAccent: string
  defaultMessage: string
  defaultMessage2: string
  defaultThanks: string
  defaultThanksSub: string
  mark: MarkName
}

const TEMPLATES: Record<EventTypeId, TemplateConfig> = {
  casamento: {
    label: 'Casamento', icon: 'rings',
    headCls: 'cv-serif', nameCls: 'cv-serif',
    headSize: 108, nameSize: 92,
    headline: 'Vai ser\npara sempre',
    defaultAccent: '#74865f',
    defaultMessage: 'Depois de tantas histórias juntos, escolhemos transformar o nosso amor em um para sempre.',
    defaultMessage2: 'E não há ninguém com quem a gente queira dividir esse dia além de você.',
    defaultThanks: 'Sua presença transforma.',
    defaultThanksSub: 'Obrigado por caminhar com a gente.',
    mark: 'rings',
  },
  'cha-panela': {
    label: 'Chá de Casa Nova', icon: 'house',
    headCls: 'cv-script', nameCls: 'cv-script',
    headSize: 124, nameSize: 116,
    headline: 'Estamos realizando\num sonho!',
    defaultAccent: '#8b79c2',
    defaultMessage: 'Cada detalhe da nossa nova casa está sendo feito com muito amor e carinho.',
    defaultMessage2: 'Se quiser fazer parte desse momento, ficaremos imensamente felizes com a sua contribuição.',
    defaultThanks: 'Sua presença transforma.',
    defaultThanksSub: 'Obrigado por fazer parte dessa história!',
    mark: 'heart',
  },
  'cha-bebe': {
    label: 'Chá de Bebê', icon: 'spark',
    headCls: 'cv-script-a', nameCls: 'cv-script-a',
    headSize: 124, nameSize: 138,
    headline: 'A espera\nmais doce',
    defaultAccent: '#d18a86',
    defaultMessage: 'Um coração pequenininho já enche a nossa casa de planos e o nosso peito de amor.',
    defaultMessage2: 'Venha celebrar a chegada que vai mudar tudo — e encher de carinho desde o primeiro dia.',
    defaultThanks: 'Sua presença é o presente.',
    defaultThanksSub: 'Obrigado por fazer parte dessa história.',
    mark: 'dot',
  },
  'cha-revelacao': {
    label: 'Chá de Revelação', icon: 'spark',
    headCls: 'cv-script-a', nameCls: 'cv-script-a',
    headSize: 124, nameSize: 138,
    headline: 'O segredo\nestá quase\nchegando!',
    defaultAccent: '#c98a3f',
    defaultMessage: 'Vamos revelar juntos o grande mistério que está enchendo nossos corações de alegria.',
    defaultMessage2: 'Você é especial demais para ficar de fora desse momento mágico.',
    defaultThanks: 'Sua presença é o presente.',
    defaultThanksSub: 'Obrigado por celebrar com a gente!',
    mark: 'dot',
  },
}

// ── icon primitives ──────────────────────────────────────────────
type IconName = 'rings' | 'house' | 'spark' | 'balloon' | 'cal' | 'clock' | 'pin' | 'gift' | 'heart' | 'link'
type MarkName = 'rings' | 'house' | 'spark' | 'heart' | 'dot'

interface IconProps { name: IconName; size?: number; sw?: number }

function CvIcon({ name, size = 30, sw = 2 }: IconProps) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'rings':   return <svg {...p}><circle cx="9" cy="14" r="6" /><circle cx="15" cy="14" r="6" /></svg>
    case 'house':   return <svg {...p}><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /></svg>
    case 'spark':   return <svg {...p}><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" /></svg>
    case 'balloon': return <svg {...p}><circle cx="12" cy="9" r="6" /><path d="M12 15v5" /></svg>
    case 'cal':     return <svg {...p}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9h16M9 3v4M15 3v4" /></svg>
    case 'clock':   return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
    case 'pin':     return <svg {...p}><path d="M12 21c4-4 7-7.2 7-11a7 7 0 10-14 0c0 3.8 3 7 7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>
    case 'gift':    return <svg {...p}><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M4 13h16M12 9v11M8.5 9a2.5 2.5 0 110-5C11 4 12 9 12 9M15.5 9a2.5 2.5 0 100-5C13 4 12 9 12 9" /></svg>
    case 'heart':   return <svg {...p}><path d="M12 20s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.4-7 10-7 10z" /></svg>
    case 'link':    return <svg {...p}><path d="M9 15l6-6M8 13l-1.5 1.5a3 3 0 104.2 4.2L12 18M16 11l1.5-1.5a3 3 0 10-4.2-4.2L12 6" /></svg>
    default:        return null
  }
}

function CvDot({ s = 8, color = 'var(--gold)' }: { s?: number; color?: string }) {
  return <span style={{ display: 'inline-block', width: s, height: s, background: color, transform: 'rotate(45deg)', borderRadius: 1 }} />
}

function CvRule({ mark }: { mark: MarkName }) {
  return (
    <div className="cv-rule">
      <span className="cv-rule__mark">
        {mark === 'dot' ? <CvDot s={10} /> : <CvIcon name={mark as IconName} size={26} sw={1.8} />}
      </span>
    </div>
  )
}

function CvScatter({ items }: { items: Array<{ x: number; y: number; s: number; c: string; r?: boolean; rot?: number; o?: number }> }) {
  return (
    <>
      {items.map((it, i) => (
        <span key={i} style={{
          position: 'absolute', left: it.x, top: it.y,
          width: it.s, height: it.s,
          background: it.c,
          borderRadius: it.r ? '999px' : 2,
          transform: `rotate(${it.rot || 0}deg)`,
          opacity: it.o ?? 1,
        }} />
      ))}
    </>
  )
}

function CvWave({ height = 120, color = 'var(--paper)', flip = false, style }: { height?: number; color?: string; flip?: boolean; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 1080 120" preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height, transform: flip ? 'scaleY(-1)' : 'none', ...style }}>
      <path d="M0 52 C 220 110, 420 6, 620 44 S 940 96, 1080 40 L1080 120 L0 120 Z" fill={color} />
    </svg>
  )
}

function CvPlaceholder({ style, coverUrl }: { style?: React.CSSProperties; coverUrl?: string }) {
  return (
    <div className="cv-ph" style={style}>
      {coverUrl
        ? <img className="cv-ph__img" src={coverUrl} alt="" />
        : <span className="cv-ph__tag">foto do evento</span>
      }
    </div>
  )
}

function CvDetails({ date, location }: { date: string; location: string }) {
  return (
    <div className="cv-details">
      <div className="cv-detail">
        <span className="cv-detail__ic"><CvIcon name="cal" size={28} /></span>
        <span><b style={{ color: 'var(--ink)' }}>{date}</b></span>
      </div>
      <div className="cv-detail">
        <span className="cv-detail__ic"><CvIcon name="pin" size={28} /></span>
        <span>{location}</span>
      </div>
    </div>
  )
}

function CvQrBlock({ link, qrDataUrl }: { link: string; qrDataUrl: string }) {
  return (
    <div className="cv-qr">
      <div className="cv-qr__code">
        {qrDataUrl && <img src={qrDataUrl} alt="QR Code" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cv-qr__title"><CvIcon name="gift" size={28} /> Acesse nosso evento</div>
        <div className="cv-qr__desc">Escaneie o QR Code ou acesse o link para ver a lista de presentes e contribuir.</div>
        <div className="cv-link"><CvIcon name="link" size={22} /> {link}</div>
      </div>
    </div>
  )
}

function CvThanks({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="cv-thanks">
      <div className="cv-thanks__ic"><CvIcon name="heart" size={36} /></div>
      <div>
        <div className="cv-thanks__t">{title}</div>
        <div className="cv-thanks__s">{sub}</div>
      </div>
    </div>
  )
}

// ── badge ────────────────────────────────────────────────────────
function CvBadge({ icon, size = 122 }: { icon: IconName; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: 'linear-gradient(150deg, var(--accent-mid), var(--accent-deep))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', margin: '0 auto',
      boxShadow: '0 14px 34px var(--cv-badge-shadow), inset 0 1px 0 rgba(255,255,255,0.35)',
    }}>
      <CvIcon name={icon} size={size * 0.46} sw={1.7} />
    </div>
  )
}

// ── shared body & footer ─────────────────────────────────────────
interface BodyProps {
  message: string
  message2: string
  date: string
  location: string
  link: string
  qrDataUrl: string
  thanks: string
  thanksSub: string
}

function CvBody({ message, message2, date, location, link, qrDataUrl, thanks, thanksSub }: BodyProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '38px 88px 38px', minHeight: 0 }}>
      <div style={{ textAlign: 'center' }}>
        <p className="cv-body" style={{ fontSize: 32 }}>{message}</p>
        <p className="cv-serif" style={{ marginTop: 24, fontSize: 37, fontStyle: 'italic', fontWeight: 500, color: 'var(--accent-deep)', lineHeight: 1.32, textWrap: 'pretty' }}>
          {message2}
        </p>
      </div>
      <CvDetails date={date} location={location} />
      <CvQrBlock link={link} qrDataUrl={qrDataUrl} />
      <CvThanks title={thanks} sub={thanksSub} />
    </div>
  )
}

interface FooterProps { names: string; dateLabel: string; nameCls: string; nameSize: number; mark: MarkName; wave?: boolean }

function CvFooter({ names, dateLabel, nameCls, nameSize, mark, wave = true }: FooterProps) {
  return (
    <div style={{ position: 'relative', background: 'var(--paper-2)', flex: '0 0 auto' }}>
      {wave && <CvWave height={70} color="var(--paper-2)" style={{ position: 'absolute', left: 0, bottom: '100%' }} />}
      <div style={{ padding: '24px 90px 36px', textAlign: 'center', position: 'relative' }}>
        <div className={nameCls} style={{ fontSize: nameSize, color: 'var(--accent-deep)', fontStyle: nameCls === 'cv-serif' ? 'italic' : undefined, fontWeight: nameCls === 'cv-serif' ? 600 : undefined }}>{names}</div>
        <div style={{ width: 280, margin: '6px auto 16px' }}><CvRule mark={mark} /></div>
        <div className="cv-mono" style={{ color: 'var(--ink-soft)' }}>{dateLabel}</div>
      </div>
    </div>
  )
}

// ── headers ──────────────────────────────────────────────────────
function CvHeaderOverlay({ icon, headline, headCls, headSize, mark, label, coverUrl }: {
  icon: IconName; headline: string; headCls: string; headSize: number; mark: MarkName; label: string; coverUrl?: string
}) {
  return (
    <div style={{ position: 'relative', height: 700, flex: '0 0 auto' }}>
      <CvPlaceholder style={{ position: 'absolute', inset: 0 }} coverUrl={coverUrl} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(178deg, var(--cv-overlay-top) 0%, transparent 26%, transparent 48%, var(--cv-overlay-bottom) 100%)' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0 }}>
        <CvBadge icon={icon} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, bottom: 132, textAlign: 'center', color: '#fff' }}>
        <div className="cv-eyebrow" style={{ color: 'rgba(255,255,255,0.94)' }}>{label}</div>
        <h1 className={headCls} style={{ marginTop: 26, fontSize: headSize, color: '#fff', lineHeight: 1.04, whiteSpace: 'pre-line', textShadow: '0 2px 24px rgba(20,12,24,0.3)', fontStyle: headCls === 'cv-serif' ? 'italic' : undefined, fontWeight: headCls === 'cv-serif' ? 600 : undefined }}>
          {headline}
        </h1>
        <div style={{ width: 220, margin: '20px auto 0', filter: 'brightness(2.4)' }}><CvRule mark={mark} /></div>
      </div>
      <CvWave height={108} color="var(--paper)" style={{ position: 'absolute', left: 0, bottom: 0 }} />
    </div>
  )
}

function CvHeaderArch({ icon, headline, headCls, headSize, label, coverUrl }: {
  icon: IconName; headline: string; headCls: string; headSize: number; label: string; coverUrl?: string
}) {
  const dots = [
    { x: 70,  y: 120, s: 12, c: 'var(--accent-soft)', r: true },
    { x: 150, y: 300, s: 8,  c: 'var(--gold)', rot: 45 },
    { x: 940, y: 150, s: 14, c: 'var(--accent-soft)', r: true },
    { x: 1000,y: 360, s: 9,  c: 'var(--gold)', rot: 45 },
    { x: 60,  y: 560, s: 9,  c: 'var(--gold)', rot: 45 },
    { x: 1004,y: 600, s: 12, c: 'var(--accent-soft)', r: true },
  ]
  return (
    <div style={{ position: 'relative', padding: '44px 88px 0', textAlign: 'center', flex: '0 0 auto' }}>
      <CvScatter items={dots} />
      <div className="cv-eyebrow" style={{ marginBottom: 24 }}>{label}</div>
      <CvBadge icon={icon} size={100} />
      <div style={{ marginTop: 28, height: 344, borderRadius: '180px 180px 38px 38px', overflow: 'hidden', position: 'relative', boxShadow: '0 24px 60px var(--cv-arch-shadow)' }}>
        <CvPlaceholder style={{ position: 'absolute', inset: 0, height: '100%' }} coverUrl={coverUrl} />
      </div>
      <h1 className={headCls} style={{ marginTop: 26, fontSize: headSize, color: 'var(--accent-deep)', lineHeight: 1.0, whiteSpace: 'pre-line' }}>
        {headline}
      </h1>
    </div>
  )
}

// ── main component ───────────────────────────────────────────────
export interface ConviteRendererProps {
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

export function ConviteRenderer({ event, qrDataUrl }: ConviteRendererProps) {
  const eventType: EventTypeId = (event.data.eventType as EventTypeId) ?? 'casamento'
  const tpl = TEMPLATES[eventType] ?? TEMPLATES['casamento']
  const accent = event.data.theme?.accent ?? tpl.defaultAccent

  const names = event.data.hosts || event.data.name || 'Evento'
  const location = event.data.location || 'A confirmar'
  const link = `celebre.com.br/p/${event.slug}`

  const themeVars = useMemo(() => computeThemeVars(accent), [accent])

  const date = useMemo(() => {
    if (!event.eventDate) return 'Em breve'
    try {
      const d = new Date(event.eventDate + 'T12:00:00')
      return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return event.eventDate }
  }, [event.eventDate])

  const dateLabel = useMemo(() => {
    if (!event.eventDate) return ''
    try {
      const d = new Date(event.eventDate + 'T12:00:00')
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return event.eventDate }
  }, [event.eventDate])

  const useOverlay = eventType === 'casamento' || eventType === 'cha-panela'
  const coverUrl = event.data.coverUrl

  return (
    <div className="cv-invite" style={themeVars as React.CSSProperties}>
      {useOverlay
        ? <CvHeaderOverlay icon={tpl.icon} headline={tpl.headline} headCls={tpl.headCls} headSize={tpl.headSize} mark={tpl.mark} label={tpl.label} coverUrl={coverUrl} />
        : <CvHeaderArch icon={tpl.icon} headline={tpl.headline} headCls={tpl.headCls} headSize={tpl.headSize} label={tpl.label} coverUrl={coverUrl} />
      }
      <CvBody
        message={tpl.defaultMessage}
        message2={tpl.defaultMessage2}
        date={date}
        location={location}
        link={link}
        qrDataUrl={qrDataUrl}
        thanks={tpl.defaultThanks}
        thanksSub={tpl.defaultThanksSub}
      />
      <CvFooter names={names} dateLabel={dateLabel} nameCls={tpl.nameCls} nameSize={tpl.nameSize} mark={tpl.mark} wave={true} />
    </div>
  )
}

// ── mini invite (for WA preview) ─────────────────────────────────
export function CvMiniInvite({ children, w = 280 }: { children: React.ReactNode; w?: number }) {
  const scale = w / 1080
  return (
    <div style={{ width: w, height: 1920 * scale, overflow: 'hidden', position: 'relative', borderRadius: 8 }}>
      <div style={{ width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}

// ── WA preview ───────────────────────────────────────────────────
export function ConviteWaPreview({ event, accent, children }: {
  event: ConviteRendererProps['event']
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
