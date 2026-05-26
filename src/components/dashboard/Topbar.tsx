import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { nameInitials } from './DashWidgets'

interface TopbarProps {
  eventSlug?: string
}

export function Topbar({ eventSlug }: TopbarProps) {
  const { user } = useAuth()
  const userInitials = nameInitials(user?.name)

  return (
    <div className="cd-top">
      <div className="cd-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" strokeLinecap="round" />
        </svg>
        Buscar presentes, contribuições, pessoas…
        <span className="cd-search__kbd">⌘K</span>
      </div>
      <div style={{ flex: 1 }} />
      {eventSlug && (
        <a
          href={`http://localhost:5173/p/${eventSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ca-row ca-row--gap-sm"
          style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--ca-bg-soft)', border: '1px solid var(--ca-line)', fontSize: 12.5, color: 'var(--ca-ink-3)', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', textDecoration: 'none' }}
        >
          <Icon.Globe style={{ width: 14, height: 14, color: 'var(--ca-muted)' }} />
          localhost:5173/{eventSlug}
          <Icon.Link style={{ width: 13, height: 13, color: 'var(--ca-muted-2)', marginLeft: 4 }} />
        </a>
      )}
      <button className="cd-top__icon-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 17, height: 17 }}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" strokeLinejoin="round" />
          <path d="M10 21h4" strokeLinecap="round" />
        </svg>
        <span className="cd-top__dot" />
      </button>
      <button className="cd-top__icon-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v3M12 20v3M4 12H1M23 12h-3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
        </svg>
      </button>
      <span style={{ width: 1, height: 26, background: 'var(--ca-line)' }} />
      <span className="cd-user__avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{userInitials}</span>
    </div>
  )
}
