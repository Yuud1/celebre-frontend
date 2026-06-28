import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { nameInitials } from './DashWidgets'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface TopbarProps {
  eventSlug?: string
  onMenuToggle?: () => void
  onNavigateSettings?: () => void
}

export function Topbar({ eventSlug, onMenuToggle, onNavigateSettings }: TopbarProps) {
  const { user, logout } = useAuth()
  const userInitials = nameInitials(user?.name)

  return (
    <div className="flex items-center gap-3.5 px-7 py-3.5 bg-white/70 backdrop-blur-[14px] border-b border-slate-200 shrink-0 max-sm:px-4 max-sm:py-3 max-sm:gap-2.5">
      {/* Menu toggle — tablet only (640–899px) */}
      <button
        className="hidden sm:inline-flex nav:!hidden w-[38px] h-[38px] rounded-[10px] items-center justify-center border border-slate-200 bg-white text-slate-600 cursor-pointer shrink-0 transition-all hover:border-slate-300 hover:bg-slate-50"
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[18px] h-[18px]">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Search bar — desktop only */}
      <div className="flex-1 max-w-[380px] hidden nav:flex items-center gap-2.5 h-[38px] px-3.5 bg-slate-50 border border-slate-200 rounded-[10px] text-slate-500 text-[13px] cursor-text transition-all hover:border-slate-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 shrink-0">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" strokeLinecap="round" />
        </svg>
        Buscar presentes, contribuições, pessoas…
        <span className="ml-auto font-mono text-[11px] px-1.5 py-0.5 rounded-[5px] bg-white border border-slate-200 text-slate-500">⌘K</span>
      </div>

      <div className="flex-1" />

      {/* Event link */}
      {eventSlug && (
        <a
          href={`/p/${eventSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-slate-50 border border-slate-200 text-[12.5px] text-slate-600 font-mono cursor-pointer no-underline transition-all hover:border-slate-300 hover:bg-slate-100"
        >
          <Icon.Globe style={{ width: 14, height: 14, color: '#94A3B8' }} />
          {eventSlug}
          <Icon.Link style={{ width: 13, height: 13, color: '#94A3B8', marginLeft: 4 }} />
        </a>
      )}

      {/* Notifications */}
      <button className="relative w-[38px] h-[38px] rounded-[10px] inline-flex items-center justify-center border border-slate-200 bg-white text-slate-600 cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[17px] h-[17px]">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" strokeLinejoin="round" />
          <path d="M10 21h4" strokeLinecap="round" />
        </svg>
        <span className="absolute top-2 right-[9px] w-[7px] h-[7px] rounded-full bg-pink-500 border-[1.5px] border-white" />
      </button>

      {/* Settings */}
      <button className="w-[38px] h-[38px] rounded-[10px] inline-flex items-center justify-center border border-slate-200 bg-white text-slate-600 cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v3M12 20v3M4 12H1M23 12h-3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
        </svg>
      </button>

      <span className="w-px h-6 bg-slate-200" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 inline-flex items-center justify-center text-white font-semibold text-[13px] shrink-0 cursor-pointer outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-pink-400">
            {userInitials}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-slate-800 truncate">{user?.name}</span>
            <span className="text-[11px] font-normal text-slate-500 truncate">{user?.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-slate-700"
            onClick={onNavigateSettings}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 shrink-0 text-slate-500">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v3M12 20v3M4 12H1M23 12h-3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
            </svg>
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={logout}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
              <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
            </svg>
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
