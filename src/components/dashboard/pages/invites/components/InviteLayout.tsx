import type { IconName, MarkName } from './inviteTemplates'
import { InviteIcon, InviteRule, InviteScatter, InviteWave, InvitePlaceholder } from './InvitePrimitives'

export function InviteDetails({ date, location }: { date: string; location: string }) {
  return (
    <div className="cv-details">
      <div className="cv-detail">
        <span className="cv-detail__ic"><InviteIcon name="cal" size={28} /></span>
        <span><b style={{ color: 'var(--ink)' }}>{date}</b></span>
      </div>
      <div className="cv-detail">
        <span className="cv-detail__ic"><InviteIcon name="pin" size={28} /></span>
        <span>{location}</span>
      </div>
    </div>
  )
}

export function InviteQrBlock({ link, qrDataUrl }: { link: string; qrDataUrl: string }) {
  return (
    <div className="cv-qr">
      <div className="cv-qr__code">
        {qrDataUrl && <img src={qrDataUrl} alt="QR Code" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cv-qr__title"><InviteIcon name="gift" size={28} /> Acesse nosso evento</div>
        <div className="cv-qr__desc">Escaneie o QR Code ou acesse o link para ver a lista de presentes e contribuir.</div>
        <div className="cv-link"><InviteIcon name="link" size={22} /> {link}</div>
      </div>
    </div>
  )
}

export function InviteThanks({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="cv-thanks">
      <div className="cv-thanks__ic"><InviteIcon name="heart" size={36} /></div>
      <div>
        <div className="cv-thanks__t">{title}</div>
        <div className="cv-thanks__s">{sub}</div>
      </div>
    </div>
  )
}

export function InviteBadge({ icon, size = 122 }: { icon: IconName; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: 'linear-gradient(150deg, var(--accent-mid), var(--accent-deep))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', margin: '0 auto',
      boxShadow: '0 14px 34px var(--cv-badge-shadow), inset 0 1px 0 rgba(255,255,255,0.35)',
    }}>
      <InviteIcon name={icon} size={size * 0.46} sw={1.7} />
    </div>
  )
}

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

export function InviteBody({ message, message2, date, location, link, qrDataUrl, thanks, thanksSub }: BodyProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '38px 88px 38px', minHeight: 0 }}>
      <div style={{ textAlign: 'center' }}>
        <p className="cv-body" style={{ fontSize: 32 }}>{message}</p>
        <p className="cv-serif" style={{ marginTop: 24, fontSize: 37, fontStyle: 'italic', fontWeight: 500, color: 'var(--accent-deep)', lineHeight: 1.32, textWrap: 'pretty' }}>
          {message2}
        </p>
      </div>
      <InviteDetails date={date} location={location} />
      <InviteQrBlock link={link} qrDataUrl={qrDataUrl} />
      <InviteThanks title={thanks} sub={thanksSub} />
    </div>
  )
}

interface FooterProps { names: string; dateLabel: string; nameCls: string; nameSize: number; mark: MarkName; wave?: boolean }

export function InviteFooter({ names, dateLabel, nameCls, nameSize, mark, wave = true }: FooterProps) {
  return (
    <div style={{ position: 'relative', background: 'var(--paper-2)', flex: '0 0 auto' }}>
      {wave && <InviteWave height={70} color="var(--paper-2)" style={{ position: 'absolute', left: 0, bottom: '100%' }} />}
      <div style={{ padding: '24px 90px 36px', textAlign: 'center', position: 'relative' }}>
        <div className={nameCls} style={{ fontSize: nameSize, color: 'var(--accent-deep)', fontStyle: nameCls === 'cv-serif' ? 'italic' : undefined, fontWeight: nameCls === 'cv-serif' ? 600 : undefined }}>{names}</div>
        <div style={{ width: 280, margin: '6px auto 16px' }}><InviteRule mark={mark} /></div>
        <div className="cv-mono" style={{ color: 'var(--ink-soft)' }}>{dateLabel}</div>
      </div>
    </div>
  )
}

export function InviteHeaderOverlay({ icon, headline, headCls, headSize, mark, label, coverUrl }: {
  icon: IconName; headline: string; headCls: string; headSize: number; mark: MarkName; label: string; coverUrl?: string
}) {
  return (
    <div style={{ position: 'relative', height: 700, flex: '0 0 auto' }}>
      <InvitePlaceholder style={{ position: 'absolute', inset: 0 }} coverUrl={coverUrl} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(178deg, var(--cv-overlay-top) 0%, transparent 26%, transparent 48%, var(--cv-overlay-bottom) 100%)' }} />
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0 }}>
        <InviteBadge icon={icon} />
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, bottom: 132, textAlign: 'center', color: '#fff' }}>
        <div className="cv-eyebrow" style={{ color: 'rgba(255,255,255,0.94)' }}>{label}</div>
        <h1 className={headCls} style={{ marginTop: 26, fontSize: headSize, color: '#fff', lineHeight: 1.04, whiteSpace: 'pre-line', textShadow: '0 2px 24px rgba(20,12,24,0.3)', fontStyle: headCls === 'cv-serif' ? 'italic' : undefined, fontWeight: headCls === 'cv-serif' ? 600 : undefined }}>
          {headline}
        </h1>
        <div style={{ width: 220, margin: '20px auto 0', filter: 'brightness(2.4)' }}><InviteRule mark={mark} /></div>
      </div>
      <InviteWave height={108} color="var(--paper)" style={{ position: 'absolute', left: 0, bottom: 0 }} />
    </div>
  )
}

export function InviteHeaderArch({ icon, headline, headCls, headSize, label, coverUrl }: {
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
      <InviteScatter items={dots} />
      <div className="cv-eyebrow" style={{ marginBottom: 24 }}>{label}</div>
      <InviteBadge icon={icon} size={100} />
      <div style={{ marginTop: 28, height: 344, borderRadius: '180px 180px 38px 38px', overflow: 'hidden', position: 'relative', boxShadow: '0 24px 60px var(--cv-arch-shadow)' }}>
        <InvitePlaceholder style={{ position: 'absolute', inset: 0, height: '100%' }} coverUrl={coverUrl} />
      </div>
      <h1 className={headCls} style={{ marginTop: 26, fontSize: headSize, color: 'var(--accent-deep)', lineHeight: 1.0, whiteSpace: 'pre-line' }}>
        {headline}
      </h1>
    </div>
  )
}
