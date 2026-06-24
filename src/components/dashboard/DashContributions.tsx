import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import { StatCard } from './DashWidgets'

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

      <div className="cd-table-scroll">
      <div className="ca-card" style={{ padding: 0, overflow: 'hidden', minWidth: 520 }}>
        <div style={{ padding: '10px 22px', fontSize: 11, color: 'var(--ca-muted-2)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ca-bg-soft)', borderBottom: '1px solid var(--ca-line-soft)', display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 120px' }}>
          <span>Convidado</span><span>Presente</span><span style={{ textAlign: 'right' }}>Valor</span><span>Método</span><span>Status</span>
        </div>
        {contributions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ca-muted)', fontSize: 13 }}>
            Nenhuma contribuição ainda.
          </div>
        )}
        {contributions.map((c: any, i: number) => {
          return (
            <div key={c.id} style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 120px', borderBottom: i < contributions.length - 1 ? '1px solid var(--ca-line-soft)' : 'none', alignItems: 'center', fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{c.guestName ?? 'Anônimo'}</span>
              <span style={{ color: 'var(--ca-muted)' }}>{c.gift?.name ?? '—'}</span>
              <span style={{ textAlign: 'right', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                R$ {(Number(c.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {c.paymentMethod === 'pix' ? 'PIX' : c.paymentMethod === 'credit_card' ? 'Cartão' : c.paymentMethod ?? '—'}
              </span>
              <span>
                {c.status === 'confirmed'
                  ? <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 10, height: 10 }} />Confirmado</span>
                  : c.status === 'failed'
                    ? <span className="ca-badge ca-badge--error"><Icon.X style={{ width: 10, height: 10 }} />Falhou</span>
                    : <span className="ca-badge ca-badge--warn"><Icon.Loader style={{ width: 10, height: 10 }} />Pendente</span>}
              </span>
            </div>
          )
        })}
      </div>
      </div>
    </>
  )
}
