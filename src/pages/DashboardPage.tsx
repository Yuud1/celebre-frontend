import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import { DashHome } from '../components/dashboard/DashHome'
import { DashGifts } from '../components/dashboard/DashGifts'
import { DashContributions } from '../components/dashboard/DashContributions'
import { Saques } from '../components/dashboard/Saques'
import { Personalize } from '../components/dashboard/Personalize'
import { Settings } from '../components/dashboard/Settings'
import { Sidebar } from '../components/dashboard/Sidebar'
import { Topbar } from '../components/dashboard/Topbar'
import { DashConvites } from '../components/dashboard/DashConvites'
import { cn } from '@/lib/utils'

export type ActivePage = 'dashboard' | 'gifts' | 'contrib' | 'payouts' | 'customize' | 'settings' | 'convites'

// ─── PageHead ──────────────────────────────────────────────────────

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
    closed:    { c: '#475569', bg: '#F8FAFC',               dot: '#94A3B8', label: 'Encerrado' },
  }
  const s = status ? statuses[status] : null
  return (
    <div className="flex items-end justify-between gap-5 mb-6 flex-wrap max-sm:flex-col max-sm:items-start">
      <div>
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 m-0">{eyebrow}</p>}
        <div className="flex items-center gap-2.5 mt-2">
          <h1 className="font-display text-[30px] font-semibold tracking-[-0.025em] text-slate-950 m-0 leading-none">{title}</h1>
          {s && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold self-center ml-1" style={{ background: s.bg, color: s.c }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
              {s.label}
            </span>
          )}
        </div>
        {sub && <p className="text-sm text-slate-500 mt-1.5 max-w-[540px] m-0 mt-1.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  )
}

// ─── Bottom nav icon ────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 22, height: 22 }}>
      <path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const BOTTOM_NAV: Array<{ id: ActivePage; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Início',    icon: <HomeIcon /> },
  { id: 'gifts',     label: 'Presentes', icon: <Icon.Sparkle style={{ width: 22, height: 22 }} /> },
  { id: 'contrib',   label: 'Feed',      icon: <Icon.Pix    style={{ width: 22, height: 22 }} /> },
  { id: 'payouts',   label: 'Saldo',     icon: <Icon.Bank   style={{ width: 22, height: 22 }} /> },
  { id: 'settings',  label: 'Perfil',    icon: <Icon.User   style={{ width: 22, height: 22 }} /> },
]

// ─── Empty state ────────────────────────────────────────────────────

function NoEventState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
      <span className="w-16 h-16 rounded-2xl bg-violet-100 text-indigo-500 inline-flex items-center justify-center mb-5">
        <Icon.Sparkle style={{ width: 28, height: 28 }} />
      </span>
      <h2 className="font-display text-[22px] font-semibold text-slate-900 mb-2">
        Você ainda não tem nenhum evento publicado
      </h2>
      <p className="text-[14px] text-slate-500 max-w-[380px] mb-6">
        Crie seu evento, adicione presentes e compartilhe com seus convidados.
      </p>
      <Link
        to="/criar"
        className="inline-flex items-center h-11 px-6 text-[14px] font-semibold text-white rounded-xl bg-ca-grad hover:brightness-105 transition-all no-underline"
      >
        Criar meu primeiro evento
      </Link>
    </div>
  )
}

// ─── DashboardPage ──────────────────────────────────────────────────

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
    <div className="fixed inset-0 font-sans antialiased text-slate-900 bg-slate-50">
      {/* Sidebar overlay (mobile) */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/45 z-[49]"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="grid h-full nav:grid-cols-[252px_1fr]">
        <Sidebar
          activePage={activePage}
          onNav={setActivePage}
          event={event}
          contribCount={confirmedContrib.length}
          giftCount={event?.gifts?.length ?? 0}
          menuOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <div className="flex flex-col overflow-hidden min-w-0">
          <Topbar eventSlug={event?.slug} onMenuToggle={() => setMenuOpen(v => !v)} />
          <div className={cn(
            'flex-1 overflow-auto px-8 py-7 pb-10',
            'max-[899px]:px-5 max-[899px]:py-5 max-[899px]:pb-8',
            'max-sm:px-4 max-sm:py-4 max-sm:pb-[calc(64px+16px)]',
            activePage === 'payouts' && 'max-sm:px-0 max-sm:py-0',
          )}>
            {loading && (
              <div className="flex items-center justify-center flex-1 text-slate-500 text-[14px] h-40">
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
          {/* Bottom nav — mobile only */}
          <nav className="hidden max-sm:flex fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 pb-[env(safe-area-inset-bottom)]">
            {BOTTOM_NAV.map(item => (
              <button
                key={item.id}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors border-none bg-transparent cursor-pointer py-1.5',
                  activePage === item.id ? 'text-indigo-500' : 'text-slate-500',
                )}
                onClick={() => setActivePage(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
