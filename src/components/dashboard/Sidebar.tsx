import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { AuthLogo } from '../auth/AuthShared'
import { fmtDate, nameInitials } from './DashWidgets'
import { cn } from '@/lib/utils'
import type { ActivePage } from '../../pages/DashboardPage'

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding:     'Casamento',
  baby_shower: 'Chá de Bebê',
  housewarming:'Chá de Casa Nova',
  birthday:    'Aniversário',
}

function KycSidebarWidget() {
  const { user } = useAuth()
  if (user?.kycStatus === 'bank_configured') {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 rounded-[10px] border border-emerald-100">
        <Icon.ShieldCheck style={{ width: 15, height: 15, color: '#10B981', flexShrink: 0 }} />
        <span className="text-xs font-semibold text-emerald-700">Conta verificada</span>
      </div>
    )
  }
  return (
    <div className="relative overflow-hidden p-3.5 bg-gradient-to-br from-[#FDFCFF] to-[#F5F3FF] border border-violet-100 rounded-[14px]">
      <div className="absolute w-[100px] h-[100px] rounded-full -top-10 -right-7 bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_70%)] pointer-events-none" />
      <div className="relative flex items-center gap-2.5 mb-3">
        <span className="w-[30px] h-[30px] rounded-lg bg-amber-100 text-amber-500 inline-flex items-center justify-center shrink-0">
          <Icon.Shield style={{ width: 16, height: 16 }} />
        </span>
        <div className="leading-[1.25]">
          <div className="text-[12.5px] font-semibold text-slate-900">Falta a Chave PIX</div>
          <div className="text-[11px] text-slate-500">Configurar recebimento</div>
        </div>
      </div>
      <Link to="/verificacao" className="block text-center text-xs font-semibold text-white bg-amber-400 px-2 py-1.5 rounded-md no-underline hover:bg-amber-500 transition-colors">
        Configurar agora
      </Link>
    </div>
  )
}

function NavSection({
  label,
  items,
  activePage,
  onGo,
}: {
  label: string
  items: Array<{ id: string; label: string; icon: React.ReactNode; count?: number }>
  activePage: string
  onGo: (id: any) => void
}) {
  return (
    <div className="px-2 mt-5">
      <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-[0.12em] px-3 pb-2">{label}</div>
      <nav className="flex flex-col gap-px">
        {items.map(it => {
          const isOn = it.id === activePage
          return (
            <a
              key={it.id}
              role="button"
              tabIndex={0}
              onClick={() => onGo(it.id)}
              onKeyDown={e => e.key === 'Enter' && onGo(it.id)}
              className={cn(
                'flex items-center gap-[11px] px-3 py-[9px] rounded-[10px] text-[13.5px] font-medium cursor-pointer relative transition-all no-underline select-none',
                isOn
                  ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/[0.06] text-slate-900 [&_svg]:text-indigo-500'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 [&_svg]:text-slate-400',
              )}
            >
              {isOn && (
                <span className="absolute -left-3.5 top-1.5 bottom-1.5 w-0.5 rounded-r-[3px] bg-ca-grad" />
              )}
              {it.icon}
              <span>{it.label}</span>
              {it.count != null && (
                <span className={cn(
                  'ml-auto text-[11px] font-semibold px-[7px] py-px rounded-full',
                  isOn ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-500',
                )}>
                  {it.count}
                </span>
              )}
            </a>
          )
        })}
      </nav>
    </div>
  )
}

interface SidebarProps {
  activePage: ActivePage
  onNav: (p: ActivePage) => void
  event: any | null
  contribCount: number
  giftCount: number
  menuOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ activePage, onNav, event, contribCount, giftCount, menuOpen, onClose }: SidebarProps) {
  const { user } = useAuth()

  const main: Array<{ id: string; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'dashboard', label: 'Dashboard',     icon: <Icon.Globe   style={{ width: 17, height: 17 }} /> },
    { id: 'customize', label: 'Meu Evento',    icon: <Icon.Heart   style={{ width: 17, height: 17 }} /> },
    { id: 'convites',  label: 'Convite',       icon: <Icon.Mail    style={{ width: 17, height: 17 }} /> },
    { id: 'gifts',     label: 'Presentes',     icon: <Icon.Sparkle style={{ width: 17, height: 17 }} />, count: giftCount || undefined },
    { id: 'contrib',   label: 'Contribuições', icon: <Icon.Pix     style={{ width: 17, height: 17 }} />, count: contribCount || undefined },
    { id: 'payouts',   label: 'Saques',        icon: <Icon.Bank    style={{ width: 17, height: 17 }} /> },
  ]
  const account: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: 'settings', label: 'Configurações', icon: <Icon.User style={{ width: 17, height: 17 }} /> },
  ]

  const go = (id: string) => {
    const validPages: ActivePage[] = ['dashboard', 'gifts', 'contrib', 'payouts', 'customize', 'settings', 'convites']
    if (validPages.includes(id as ActivePage)) {
      onClose?.()
      onNav(id as ActivePage)
    }
  }

  const eventName      = event?.data?.name ?? '—'
  const eventTypeLabel = EVENT_TYPE_LABELS[event?.data?.eventType] ?? event?.data?.eventType ?? '—'
  const eventDate      = fmtDate(event?.eventDate)
  const userInitials   = nameInitials(user?.name)

  return (
    <aside className={cn(
      'bg-white border-r border-slate-200 flex flex-col px-3.5 pt-5 pb-3.5 relative',
      'max-[899px]:fixed max-[899px]:top-0 max-[899px]:left-0 max-[899px]:bottom-0 max-[899px]:w-[280px] max-[899px]:z-50 max-[899px]:border-r-0',
      'max-[899px]:transition-transform max-[899px]:duration-[280ms] max-[899px]:ease-[cubic-bezier(0.22,1,0.36,1)]',
      menuOpen
        ? 'max-[899px]:translate-x-0 max-[899px]:shadow-[4px_0_32px_rgba(15,23,42,0.16)]'
        : 'max-[899px]:-translate-x-full',
    )}>
      {/* Brand */}
      <div className="px-2 pb-[18px]">
        <AuthLogo size={17} />
      </div>

      {/* Event switcher */}
      <div className="flex items-center gap-3 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer transition-all hover:bg-slate-100 hover:border-slate-300">
        <span className="w-8 h-8 rounded-lg bg-ca-grad inline-flex items-center justify-center text-white font-display font-semibold text-[13px] shadow-[0_3px_8px_rgba(99,102,241,0.28)] shrink-0">
          {userInitials}
        </span>
        <div className="flex-1 min-w-0 leading-[1.2]">
          <b className="font-display font-semibold text-[13.5px] text-slate-900 block truncate tracking-[-0.01em]">{eventName}</b>
          <small className="text-[11.5px] text-slate-500">{eventTypeLabel} · {eventDate}</small>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5 text-slate-400 shrink-0">
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <NavSection label="Geral"  items={main}    activePage={activePage} onGo={go} />
      <NavSection label="Conta"  items={account} activePage={activePage} onGo={go} />

      {/* Footer */}
      <div className="mt-auto px-2 pt-3">
        <KycSidebarWidget />
        <button
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] cursor-pointer transition-all hover:bg-slate-50 bg-transparent border-0 mt-2.5"
          onClick={() => go('settings')}
        >
          <span className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-pink-400 to-purple-500 inline-flex items-center justify-center text-white font-semibold text-xs shrink-0">
            {userInitials}
          </span>
          <div className="flex-1 min-w-0 leading-[1.2] text-left">
            <div className="font-semibold text-[13px] text-slate-900 truncate">{user?.name ?? '—'}</div>
            <div className="text-[11.5px] text-slate-500 truncate">{user?.email ?? '—'}</div>
          </div>
          <Icon.ArrowRight style={{ width: 14, height: 14, color: '#94A3B8' }} />
        </button>
      </div>
    </aside>
  )
}
