import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import { StatCard, nameInitials, AVATAR_COLORS } from './DashWidgets'

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

      <div className="cd-grid-stats-3" style={{ gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={total} currency />
        <StatCard icon={<Icon.Check style={{ color: '#10B981' }} />} label="Confirmadas" value={confirmed.length} />
        <StatCard icon={<Icon.Loader style={{ color: '#F59E0B' }} />} label="Pendentes" value={pending.length} />
      </div>

      <div className="ca-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 12px' }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600 }}>Todas as contribuições</div>
        </div>
        {contributions.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ca-muted)', fontSize: 13 }}>
            Nenhuma contribuição ainda.
          </div>
        )}
        {contributions.map((c: any, i: number) => {
          const initials = nameInitials(c.guestName ?? 'A')
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const isConfirmed = c.status === 'confirmed'
          const isFailed = c.status === 'failed'
          const date = fmtDayMonth(c.createdAt)
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderTop: '1px solid var(--ca-line-soft)' }}>
              <span style={{ width: 38, height: 38, borderRadius: 999, background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontWeight: 600, fontSize: 13 }}>
                {initials}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.guestName ?? 'Anônimo'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ca-muted)', marginTop: 1 }}>
                  {c.gift?.name ?? '—'}{date ? ` · ${date}` : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: isConfirmed ? '#047857' : 'var(--ca-muted)' }}>
                  {isConfirmed ? '+ ' : ''}R$ {(Number(c.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: 11, marginTop: 1 }}>
                  {isConfirmed
                    ? <span style={{ color: '#10B981', fontWeight: 500 }}>Confirmado</span>
                    : isFailed
                      ? <span style={{ color: '#BE123C', fontWeight: 500 }}>Falhou</span>
                      : <span style={{ color: '#F59E0B', fontWeight: 500 }}>Pendente</span>
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
