import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import '../styles/dash.css'
import { fmtDate, nameInitials } from '../components/dashboard/DashWidgets'
import { DashHome } from '../components/dashboard/DashHome'
import { DashGifts } from '../components/dashboard/DashGifts'
import { DashContributions } from '../components/dashboard/DashContributions'
import { Saques } from '../components/dashboard/Saques'
import { Personalize } from '../components/dashboard/Personalize'

export type ActivePage = 'dashboard' | 'gifts' | 'contrib' | 'payouts' | 'customize'

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Casamento',
  baby_shower: 'Chá de Bebê',
  housewarming: 'Chá de Casa Nova',
  birthday: 'Aniversário',
}

// ─── Page Head ────────────────────────────────────────────────
interface PageHeadProps {
  eyebrow?: string
  title: string
  status?: 'published' | 'pending' | 'closed'
  sub?: string
  actions?: React.ReactNode
}
export function PageHead({ eyebrow, title, status, sub, actions }: PageHeadProps) {
  const statuses = {
    published: { c: '#047857', bg: 'rgba(16,185,129,0.10)', dot: '#10B981', label: 'Publicado' },
    pending:   { c: '#B45309', bg: 'rgba(245,158,11,0.10)', dot: '#F59E0B', label: 'Aguardando verificação' },
    closed:    { c: '#475569', bg: 'var(--ca-bg-soft)',     dot: '#94A3B8', label: 'Encerrado' },
  }
  const s = status ? statuses[status] : null
  return (
    <div className="cd-page__head">
      <div>
        {eyebrow && <span className="ca-eyebrow">{eyebrow}</span>}
        <div className="ca-row ca-row--gap" style={{ marginTop: 8 }}>
          <h1 className="ca-display" style={{ fontSize: 30, margin: 0, letterSpacing: '-0.025em' }}>{title}</h1>
          {s && (
            <span className="ca-badge" style={{ background: s.bg, color: s.c, borderColor: s.bg, marginLeft: 4, alignSelf: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
              {s.label}
            </span>
          )}
        </div>
        {sub && <p style={{ color: 'var(--ca-muted)', fontSize: 14, margin: '6px 0 0', maxWidth: 540 }}>{sub}</p>}
      </div>
      {actions && <div className="ca-row ca-row--gap">{actions}</div>}
    </div>
  )
}

// ─── KYC Sidebar Widget ───────────────────────────────────────
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

// ─── Sidebar ──────────────────────────────────────────────────
interface SidebarProps {
  activePage: ActivePage
  onNav: (p: ActivePage) => void
  event: any | null
  contribCount: number
  giftCount: number
}
function Sidebar({ activePage, onNav, event, contribCount, giftCount }: SidebarProps) {
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

// ─── Topbar ───────────────────────────────────────────────────
function Topbar() {
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
      <a className="ca-row ca-row--gap-sm" style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--ca-bg-soft)', border: '1px solid var(--ca-line)', fontSize: 12.5, color: 'var(--ca-ink-3)', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}>
        <Icon.Globe style={{ width: 14, height: 14, color: 'var(--ca-muted)' }} />
        celebre.app/julia-e-marcos
        <Icon.Link style={{ width: 13, height: 13, color: 'var(--ca-muted-2)', marginLeft: 4 }} />
      </a>
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
      <span className="cd-user__avatar" style={{ width: 32, height: 32, fontSize: 13 }}>JM</span>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────
function NoEventState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 48, textAlign: 'center' }}>
      <span style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--ca-violet-100)', color: 'var(--ca-indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon.Sparkle style={{ width: 28, height: 28 }} />
      </span>
      <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>
        Você ainda não tem nenhum evento publicado
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ca-muted)', maxWidth: 380, marginBottom: 24 }}>
        Crie seu evento, adicione presentes e compartilhe com seus convidados.
      </p>
      <Link to="/criar" className="ca-btn ca-btn--primary" style={{ height: 44, padding: '0 24px', fontSize: 14 }}>
        Criar meu primeiro evento
      </Link>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────
export function DashboardPage() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [event, setEvent] = useState<any | null>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [noEvent, setNoEvent] = useState(false)

  const loadData = async () => {
    try {
      const events = await api.listEvents()
      if (events.length === 0) {
        setNoEvent(true)
        setLoading(false)
        return
      }
      const firstId = events[0].id
      const [ev, contrib] = await Promise.all([
        api.getEvent(firstId),
        api.getEventContributions(firstId),
      ])
      setEvent(ev)
      setContributions(contrib)
      setNoEvent(false)
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const confirmedContrib = contributions.filter((c: any) => c.status === 'confirmed')

  return (
    <div style={{ position: 'fixed', inset: 0 }} className="ca-root">
      <div className="cd-shell">
        <Sidebar
          activePage={activePage}
          onNav={setActivePage}
          event={event}
          contribCount={confirmedContrib.length}
          giftCount={event?.gifts?.length ?? 0}
        />
        <div className="cd-main">
          <Topbar />
          <div className="cd-page">
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--ca-muted)', fontSize: 14 }}>
                Carregando…
              </div>
            )}
            {!loading && noEvent && <NoEventState />}
            {!loading && !noEvent && (
              <>
                {activePage === 'dashboard' && <DashHome event={event} contributions={contributions} onNavigate={setActivePage} />}
                {activePage === 'gifts'     && <DashGifts event={event} onReload={loadData} />}
                {activePage === 'contrib'   && <DashContributions contributions={contributions} />}
                {activePage === 'payouts'   && <Saques />}
                {activePage === 'customize' && <Personalize event={event} onReload={loadData} onNavigate={setActivePage} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
