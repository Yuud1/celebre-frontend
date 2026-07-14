import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'

import {
  DashHome,
  DashGifts,
  DashContributions,
  DashWithdrawals,
  Personalize,
  Settings,
  DashInvites,
  DashGallery,
  DashReports,
} from '../components/dashboard/pages'
import { Sidebar } from '../components/dashboard/Sidebar'
import { Topbar } from '../components/dashboard/Topbar'

import { cn } from '@/lib/utils'
import { Bottombar } from '@/components/dashboard/Bottombar'

export type ActivePage = 'dashboard' | 'gifts' | 'contrib' | 'payouts' | 'customize' | 'settings' | 'convites' | 'gallery' | 'reports'

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
          {activePage !== 'payouts'
            ? <Topbar eventSlug={event?.slug} onMenuToggle={() => setMenuOpen(v => !v)} onNavigateSettings={() => setActivePage('settings')} />
            : <div className="hidden nav:block"><Topbar eventSlug={event?.slug} onMenuToggle={() => setMenuOpen(v => !v)} onNavigateSettings={() => setActivePage('settings')} /></div>}
          <div className={cn(
            'flex-1 overflow-auto',
            activePage !== 'payouts'
              ? 'px-8 py-7 pb-10 max-[899px]:px-5 max-[899px]:py-5 max-[899px]:pb-8 max-sm:px-4 max-sm:py-4 max-sm:pb-[calc(64px+16px)]'
              : 'px-8 py-7 pb-10 max-[899px]:px-0 max-[899px]:py-0 max-sm:pb-[calc(64px+16px)]',
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
                {activePage === 'payouts'   && <DashWithdrawals eventId={event?.id} onBack={() => setActivePage('dashboard')} />}
                {activePage === 'customize' && <Personalize event={event} onReload={loadData} onNavigate={setActivePage} />}
                {activePage === 'settings'  && <Settings />}
                {activePage === 'convites'  && <DashInvites event={event} />}
                {activePage === 'gallery'   && <DashGallery event={event} onReload={loadData} />}
                {activePage === 'reports'   && <DashReports event={event} />}
              </>
            )}
          </div>
          {/* Bottom nav — mobile only */}
          <Bottombar activePage={activePage} setActivePage={setActivePage} />
        </div>
      </div>
    </div>
  )
}
