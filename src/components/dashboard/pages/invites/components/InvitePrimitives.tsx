import type { IconName, MarkName } from './inviteTemplates'

interface IconProps { name: IconName; size?: number; sw?: number }

export function InviteIcon({ name, size = 30, sw = 2 }: IconProps) {
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

export function InviteDot({ s = 8, color = 'var(--gold)' }: { s?: number; color?: string }) {
  return <span style={{ display: 'inline-block', width: s, height: s, background: color, transform: 'rotate(45deg)', borderRadius: 1 }} />
}

export function InviteRule({ mark }: { mark: MarkName }) {
  return (
    <div className="cv-rule">
      <span className="cv-rule__mark">
        {mark === 'dot' ? <InviteDot s={10} /> : <InviteIcon name={mark as IconName} size={26} sw={1.8} />}
      </span>
    </div>
  )
}

export function InviteScatter({ items }: { items: Array<{ x: number; y: number; s: number; c: string; r?: boolean; rot?: number; o?: number }> }) {
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

export function InviteWave({ height = 120, color = 'var(--paper)', flip = false, style }: { height?: number; color?: string; flip?: boolean; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 1080 120" preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height, transform: flip ? 'scaleY(-1)' : 'none', ...style }}>
      <path d="M0 52 C 220 110, 420 6, 620 44 S 940 96, 1080 40 L1080 120 L0 120 Z" fill={color} />
    </svg>
  )
}

export function InvitePlaceholder({ style, coverUrl }: { style?: React.CSSProperties; coverUrl?: string }) {
  return (
    <div className="cv-ph" style={style}>
      {coverUrl
        ? <img className="cv-ph__img" src={coverUrl} alt="" />
        : <span className="cv-ph__tag">foto do evento</span>
      }
    </div>
  )
}
