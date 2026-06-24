import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import '../styles/dash.css'
import { DashHome } from '../components/dashboard/DashHome'
import { DashGifts } from '../components/dashboard/DashGifts'
import { DashContributions } from '../components/dashboard/DashContributions'
import { Saques } from '../components/dashboard/Saques'
import { Personalize } from '../components/dashboard/Personalize'
import { Settings } from '../components/dashboard/Settings'
import { Sidebar } from '../components/dashboard/Sidebar'
import { Topbar } from '../components/dashboard/Topbar'
import { DashConvites } from '../components/dashboard/DashConvites'

export type ActivePage = 'dashboard' | 'gifts' | 'contrib' | 'payouts' | 'customize' | 'settings' | 'convites'

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

export function DashboardPage() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [event, setEvent] = useState<any | null>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [noEvent, setNoEvent] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [walletAvailable, setWalletAvailable] = useState<number | null>(null)

  const loadData = async () => {
    try {
      document.title = 'Dashboard — Celebre'
      const events = await api.listEvents()
      if (events.length === 0) {
        setNoEvent(true)
        setLoading(false)
        return
      }
      const firstId = events[0].id
      const [ev, contrib, wallet] = await Promise.all([
        api.getEvent(firstId),
        api.getEventContributions(firstId),
        api.getWalletSummary().catch(() => null),
      ])
      setEvent(ev)
      setContributions(contrib)
      setWalletAvailable(wallet?.availableBalance ?? null)
      setNoEvent(false)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const confirmedContrib = contributions.filter((c: any) => c.status === 'confirmed')

  return (
    <div style={{ position: 'fixed', inset: 0 }} className="ca-root">
      <div className={`cd-shell${menuOpen ? ' cd-shell--menu-open' : ''}`}>
        {menuOpen && <div className="cd-side__overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        <Sidebar
          activePage={activePage}
          onNav={setActivePage}
          event={event}
          contribCount={confirmedContrib.length}
          giftCount={event?.gifts?.length ?? 0}
          menuOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <div className="cd-main">
          <Topbar eventSlug={event?.slug} onMenuToggle={() => setMenuOpen(v => !v)} />
          <div className="cd-page">
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--ca-muted)', fontSize: 14 }}>
                Carregando…
              </div>
            )}
            {!loading && noEvent && <NoEventState />}
            {!loading && !noEvent && (
              <>
                {activePage === 'dashboard' && <DashHome event={event} contributions={contributions} onNavigate={setActivePage} availableBalance={walletAvailable} />}
                {activePage === 'gifts'     && <DashGifts event={event} onReload={loadData} />}
                {activePage === 'contrib'   && <DashContributions contributions={contributions} />}
                {activePage === 'payouts'   && <Saques eventId={event?.id} />}
                {activePage === 'customize' && <Personalize event={event} onReload={loadData} onNavigate={setActivePage} />}
                {activePage === 'settings'  && <Settings />}
                {activePage === 'convites'  && <DashConvites event={event} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
