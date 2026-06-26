import { Icon } from '../../auth/AuthIcons'
import { PageHead } from '../../../pages/DashboardPage'
import { StatCard, nameInitials, AVATAR_COLORS } from '../DashWidgets'

function fmtDayMonth(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')
}

interface DashContributionsProps { contributions: any[] }

export function DashContributions({ contributions }: DashContributionsProps) {
  const confirmed = contributions.filter((c: any) => c.status === 'confirmed')
  const pending = contributions.filter((c: any) => c.status === 'pending')
  const total = confirmed.reduce((s: number, c: any) => s + Number(c.amount), 0)

  return (
    <>
      <PageHead
        eyebrow="Pagamentos"
        title="Contribuições"
        sub={`${contributions.length} contribuição${contributions.length !== 1 ? 'ões' : ''} · ${confirmed.length} confirmada${confirmed.length !== 1 ? 's' : ''}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 nav:grid-cols-3 gap-4 mb-5">
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={total} currency />
        <StatCard icon={<Icon.Check style={{ color: '#10B981' }} />} label="Confirmadas" value={confirmed.length} />
        <StatCard icon={<Icon.Loader style={{ color: '#F59E0B' }} />} label="Pendentes" value={pending.length} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 pt-[18px] pb-3">
          <div className="font-display text-[15px] font-semibold text-slate-900">Todas as contribuições</div>
        </div>
        {contributions.length === 0 && (
          <div className="py-5 text-center text-slate-500 text-[13px]">Nenhuma contribuição ainda.</div>
        )}
        {contributions.map((c: any, i: number) => {
          const initials = nameInitials(c.guestName ?? 'A')
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const isConfirmed = c.status === 'confirmed'
          const isFailed = c.status === 'failed'
          const date = fmtDayMonth(c.createdAt)
          return (
            <div key={c.id} className="flex items-center gap-3.5 px-5 py-[13px] border-t border-slate-100">
              <span className="w-[38px] h-[38px] rounded-full inline-flex items-center justify-center text-white font-semibold text-[13px] shrink-0" style={{ background: color }}>
                {initials}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[13.5px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {c.guestName ?? 'Anônimo'}
                </div>
                <div className="text-[12px] text-slate-500 mt-px">
                  {c.gift?.name ?? '—'}{date ? ` · ${date}` : ''}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`font-semibold text-[14px] tabular-nums ${isConfirmed ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {isConfirmed ? '+ ' : ''}R$ {(Number(c.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] mt-px">
                  {isConfirmed
                    ? <span className="text-emerald-500 font-medium">Confirmado</span>
                    : isFailed
                      ? <span className="text-rose-700 font-medium">Falhou</span>
                      : <span className="text-amber-500 font-medium">Pendente</span>
                  }
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
