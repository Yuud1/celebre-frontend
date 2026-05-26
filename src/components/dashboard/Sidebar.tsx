import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { fmtDate, nameInitials } from './DashWidgets'
import type { ActivePage } from '../../pages/DashboardPage'

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Casamento',
  baby_shower: 'Chá de Bebê',
  housewarming: 'Chá de Casa Nova',
  birthday: 'Aniversário',
}

function KycSidebarWidget() {
  const { user } = useAuth()
  if (user?.kycStatus === 'pix_configured') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
        <Icon.ShieldCheck style={{ width: 15, height: 15, color: '#10B981' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#047857' }}>Conta verificada</span>
      </div>
    )
  }
  return (
    <div className="cd-kyc">
      <div className="ca-row" style={{ gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(245,158,11,0.14)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon.Shield style={{ width: 16, height: 16 }} />
        </span>
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ca-ink)' }}>Falta a Chave PIX</div>
          <div style={{ fontSize: 11, color: 'var(--ca-muted)' }}>Configurar recebimento</div>
        </div>
      </div>
      <Link to="/verificacao" style={{ display: 'block', marginTop: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#fff', background: '#F59E0B', padding: '6px', borderRadius: 6, textDecoration: 'none' }}>
        Configurar agora
      </Link>
    </div>
  )
}

interface SidebarProps {
  activePage: ActivePage
  onNav: (p: ActivePage) => void
  event: any | null
  contribCount: number
  giftCount: number
}

export function Sidebar({ activePage, onNav, event, contribCount, giftCount }: SidebarProps) {
  const { user } = useAuth()
  type NavId = ActivePage | 'event' | 'settings'
  const main: Array<{ id: NavId; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'dashboard', label: 'Dashboard',     icon: <Icon.Globe   style={{ width: 17, height: 17 }} /> },
    { id: 'event',     label: 'Meu evento',    icon: <Icon.Heart   style={{ width: 17, height: 17 }} /> },
    { id: 'gifts',     label: 'Presentes',     icon: <Icon.Sparkle style={{ width: 17, height: 17 }} />, count: giftCount || undefined },
    { id: 'contrib',   label: 'Contribuições', icon: <Icon.Pix     style={{ width: 17, height: 17 }} />, count: contribCount || undefined },
    { id: 'payouts',   label: 'Saques',        icon: <Icon.Bank    style={{ width: 17, height: 17 }} /> },
  ]
  const account: Array<{ id: NavId; label: string; icon: React.ReactNode }> = [
    { id: 'customize', label: 'Personalização', icon: <Icon.Camera style={{ width: 17, height: 17 }} /> },
    { id: 'settings',  label: 'Configurações',  icon: <Icon.User   style={{ width: 17, height: 17 }} /> },
  ]
  const navCls = (id: NavId) => 'cd-nav__item' + (id === activePage ? ' cd-nav__item--on' : '')
  const go = (id: NavId) => {
    if (id === 'dashboard' || id === 'gifts' || id === 'contrib' || id === 'payouts' || id === 'customize') {
      onNav(id)
    }
  }

  const eventName = event?.data?.name ?? '—'
  const eventTypeLabel = EVENT_TYPE_LABELS[event?.data?.eventType] ?? event?.data?.eventType ?? '—'
  const eventDate = fmtDate(event?.eventDate)
  const userInitials = nameInitials(user?.name)

  return (
    <aside className="cd-side">
      <div className="cd-side__brand">
        <span className="ca-logo">
          <span className="ca-logo__mark" />
          celebre
        </span>
      </div>

      <div className="cd-switcher">
        <span className="cd-switcher__avatar">{userInitials}</span>
        <div className="cd-switcher__meta">
          <b>{eventName}</b>
          <small>{eventTypeLabel} · {eventDate}</small>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14, color: 'var(--ca-muted-2)', flexShrink: 0 }}>
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="cd-section">
        <div className="cd-section__label">Geral</div>
        <nav className="cd-nav">
          {main.map(it => (
            <a key={it.id} className={navCls(it.id)} onClick={() => go(it.id)}>
              {it.icon}
              <span>{it.label}</span>
              {it.count != null && <span className="cd-nav__count">{it.count}</span>}
            </a>
          ))}
        </nav>
      </div>

      <div className="cd-section">
        <div className="cd-section__label">Conta</div>
        <nav className="cd-nav">
          {account.map(it => (
            <a key={it.id} className={navCls(it.id)} onClick={() => go(it.id)}>
              {it.icon}
              <span>{it.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="cd-side__footer">
        <KycSidebarWidget />
        <div className="cd-user" style={{ marginTop: 10 }}>
          <span className="cd-user__avatar">{userInitials}</span>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ca-ink)' }}>{user?.name ?? '—'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ca-muted)' }}>{user?.email ?? '—'}</div>
          </div>
          <Icon.ArrowRight style={{ width: 14, height: 14, color: 'var(--ca-muted-2)' }} />
        </div>
      </div>
    </aside>
  )
}
