import type { ActivePage } from "@/pages/DashboardPage";
import { HomeIcon, Mail } from "lucide-react";
import { Icon } from "../auth/AuthIcons";
import { cn } from "@/lib/utils";

const BOTTOM_NAV: Array<{ id: ActivePage; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Início',    icon: <HomeIcon /> },
  { id: 'gifts',     label: 'Presentes', icon: <Icon.Sparkle style={{ width: 22, height: 22 }} /> },
  { id: 'payouts',   label: 'Saldo',     icon: <Icon.Bank   style={{ width: 22, height: 22 }} /> },
  { id: 'contrib',   label: 'Feed',      icon: <Icon.Pix    style={{ width: 22, height: 22 }} /> },
  { id: 'convites',  label: 'Convites',  icon: <Mail style={{ width: 22, height: 22 }} /> },
]


export function Bottombar({ activePage, onNav, setActivePage }: { activePage: ActivePage; onNav: (p: ActivePage) => void; setActivePage: (p: ActivePage) => void }) {
    return (
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
    )
}