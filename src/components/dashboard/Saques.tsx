import { useEffect, useState, useMemo } from 'react'
import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import { Money, Sparkline } from './DashWidgets'
import { api } from '../../lib/api'

type Summary = {
  availableBalance: number
  pendingBalance: number
  pendingCount: number
  totalNetReceived: number
  confirmedCount: number
  pixKey: string | null
  lastConfirmedAt: string | null
}

type Transaction = {
  id: string
  date: string
  desc: string
  method: string
  amount: number
  netAmount: number
  status: 'confirmed' | 'pending'
}

function fmtDateShort(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function fmtLastDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function maskPixKey(key: string | null) {
  if (!key) return '—'
  if (key.includes('@')) {
    const [local, domain] = key.split('@')
    return local.slice(0, 2) + '···@' + domain
  }
  if (key.replace(/\D/g, '').length >= 11) {
    return '···.' + key.slice(-4)
  }
  return key.slice(0, 3) + '···' + key.slice(-2)
}

function buildSparkData(transactions: Transaction[]): number[] {
  if (!Array.isArray(transactions)) return Array(10).fill(0)
  const now = Date.now()
  const buckets: number[] = Array(10).fill(0)
  for (const t of transactions) {
    if (t.status !== 'confirmed') continue
    const diffDays = (now - new Date(t.date).getTime()) / (24 * 60 * 60 * 1000)
    const bucket = 9 - Math.min(9, Math.floor(diffDays))
    buckets[bucket] += t.netAmount
  }
  return buckets
}

interface SaquesProps {
  eventId?: string | null
}

export function Saques({ eventId: _eventId }: SaquesProps) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in' | 'pending'>('all')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([api.getWalletSummary(), api.getWalletTransactions()])
      .then(([s, t]) => {
        if (cancelled) return
        setSummary(s)
        setTransactions(Array.isArray(t) ? t : [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const sparkData = useMemo(() => buildSparkData(transactions), [transactions])

  const txList = Array.isArray(transactions) ? transactions : []
  const filtered = filter === 'all' ? txList
    : filter === 'in' ? txList.filter((t) => t.status === 'confirmed')
    : txList.filter((t) => t.status === 'pending')

  const pixMasked = maskPixKey(summary?.pixKey ?? null)

  return (
    <>
      <PageHead
        eyebrow="Conta de pagamento"
        title="Saques e saldo"
        sub="Acompanhe seu dinheiro em tempo real. Transferências processadas com segurança pela infraestrutura Celebre."
        actions={
          <>
            <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Doc style={{ width: 15, height: 15 }} />Extrato completo
            </button>
            <button className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Pix style={{ width: 16, height: 16 }} />Sacar via PIX
            </button>
          </>
        }
      />

      <div className="cd-grid-saques" style={{ gap: 16 }}>
        <div className="ca-card" style={{ padding: 28, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)', borderColor: '#1E1B4B', color: '#fff' }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', top: -100, right: -80, background: 'radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', bottom: -80, left: -40, background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'relative' }}>
            <div className="ca-row ca-row--gap-sm" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5 }}>
              <Icon.Pix style={{ width: 14, height: 14, color: '#A5B4FC' }} />
              Saldo disponível para saque
            </div>
            {loading ? (
              <div style={{ height: 60, marginTop: 10, opacity: 0.4, background: 'rgba(255,255,255,0.2)', borderRadius: 8 }} />
            ) : (
              <div className="cd-money" style={{ fontSize: 44, color: '#fff', marginTop: 10 }}>
                <span className="cd-money__currency">R$</span>
                <span>{Math.floor(summary?.availableBalance ?? 0).toLocaleString('pt-BR')}</span>
                <span className="cd-money__cents">,{String(Math.round(((summary?.availableBalance ?? 0) % 1) * 100)).padStart(2, '0')}</span>
              </div>
            )}
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
              Chave PIX <strong style={{ color: '#fff' }}>{pixMasked}</strong>
            </div>
            <div className="ca-row ca-row--gap" style={{ marginTop: 22 }}>
              <button className="ca-btn ca-btn--primary ca-btn--lg" style={{ minWidth: 200 }}>
                Sacar para minha conta <Icon.ArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <button style={{ height: 56, padding: '0 22px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 500, fontSize: 14.5, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer' }}>
                Agendar saque
              </button>
            </div>
            <div className="ca-row" style={{ gap: 18, marginTop: 24, fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
              <span className="ca-row ca-row--gap-sm"><Icon.ShieldCheck style={{ width: 13, height: 13, color: '#A5B4FC' }} />Custódia em conta segregada</span>
              <span className="ca-row ca-row--gap-sm"><Icon.Pix style={{ width: 13, height: 13, color: '#A5B4FC' }} />PIX em até 30s</span>
              <span className="ca-row ca-row--gap-sm"><Icon.Lock style={{ width: 13, height: 13, color: '#A5B4FC' }} />Auditado · BACEN</span>
            </div>
          </div>
        </div>

        <div className="ca-card" style={{ padding: 22 }}>
          <div className="ca-row ca-row--between">
            <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
              <Icon.Loader style={{ width: 14, height: 14, color: '#F59E0B' }} />Saldo em análise
            </div>
            {!loading && (summary?.pendingCount ?? 0) > 0 && (
              <span className="ca-badge ca-badge--warn">{summary!.pendingCount} {summary!.pendingCount === 1 ? 'contribuição' : 'contribuições'}</span>
            )}
          </div>
          {loading ? (
            <div style={{ height: 36, marginTop: 8, background: 'var(--ca-bg-soft)', borderRadius: 6 }} />
          ) : (
            <Money value={summary?.pendingBalance ?? 0} size={28} />
          )}
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 6, lineHeight: 1.5 }}>
            Análise antifraude · disponível em até <strong style={{ color: 'var(--ca-ink)' }}>48h</strong>.
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '14px 0' }} />
          <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12, color: 'var(--ca-muted)' }}>
            <Icon.Info style={{ width: 13, height: 13 }} />
            Contribuições acima de R$ 500 passam por revisão automática.
          </div>
        </div>

        <div className="ca-card" style={{ padding: 22 }}>
          <div className="ca-row ca-row--between">
            <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
              <Icon.Check style={{ width: 14, height: 14, color: '#10B981' }} />Total recebido
            </div>
          </div>
          {loading ? (
            <div style={{ height: 36, marginTop: 8, background: 'var(--ca-bg-soft)', borderRadius: 6 }} />
          ) : (
            <Money value={summary?.totalNetReceived ?? 0} size={28} />
          )}
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 6 }}>
            {summary?.confirmedCount ?? 0} {(summary?.confirmedCount ?? 0) === 1 ? 'contribuição' : 'contribuições'} confirmadas
            {summary?.lastConfirmedAt ? ` · último em ${fmtLastDate(summary.lastConfirmedAt)}` : ''}
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '14px 0' }} />
          <div style={{ height: 36 }}><Sparkline data={sparkData} /></div>
        </div>
      </div>

      <div className="cd-table-scroll" style={{ marginTop: 16 }}>
      <div className="ca-card" style={{ padding: 0, overflow: 'hidden', minWidth: 640 }}>
        <div className="ca-row ca-row--between" style={{ padding: '18px 22px 14px' }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600 }}>Histórico de recebimentos</div>
            <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 2 }}>Todas as contribuições recebidas na sua conta</div>
          </div>
          <div className="cd-tabs">
            <span className={`cd-tab${filter === 'all' ? ' cd-tab--on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter('all')}>Todos</span>
            <span className={`cd-tab${filter === 'in' ? ' cd-tab--on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter('in')}>Confirmados</span>
            <span className={`cd-tab${filter === 'pending' ? ' cd-tab--on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter('pending')}>Em análise</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--ca-line-soft)' }}>
          <div style={{ padding: '10px 22px', fontSize: 11, color: 'var(--ca-muted-2)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ca-bg-soft)', borderBottom: '1px solid var(--ca-line-soft)', display: 'grid', gridTemplateColumns: '160px 1fr 1fr 140px 120px' }}>
            <span>Data</span><span>Descrição</span><span>Método</span><span style={{ textAlign: 'right' }}>Valor</span><span>Status</span>
          </div>
          {loading && (
            <div style={{ padding: '24px 22px', textAlign: 'center', color: 'var(--ca-muted)', fontSize: 13 }}>
              Carregando…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: '24px 22px', textAlign: 'center', color: 'var(--ca-muted)', fontSize: 13 }}>
              Nenhuma movimentação encontrada.
            </div>
          )}
          {!loading && filtered.map((t) => (
            <div key={t.id} style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '160px 1fr 1fr 140px 120px', borderBottom: '1px solid var(--ca-line-soft)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{fmtDateShort(t.date)}</span>
              <span style={{ fontWeight: 500 }}>{t.desc}</span>
              <span style={{ color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{t.method}</span>
              <span style={{ textAlign: 'right', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: '#047857' }}>
                + R$ {t.netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span>
                {t.status === 'confirmed' && <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 10, height: 10 }} />Confirmado</span>}
                {t.status === 'pending'   && <span className="ca-badge ca-badge--warn"><Icon.Loader style={{ width: 10, height: 10 }} />Em análise</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>

      <div style={{ marginTop: 16, padding: '14px 18px', background: '#fff', border: '1px solid var(--ca-line)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ca-violet-50)', color: 'var(--ca-indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.ShieldCheck style={{ width: 18, height: 18 }} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>Transferências processadas com segurança</div>
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
            Seu dinheiro fica em conta segregada auditada pelo BACEN. Todas as transferências passam por análise antifraude antes do envio.
          </div>
        </div>
        <a style={{ fontSize: 12.5, color: 'var(--ca-indigo)', fontWeight: 600 }}>Saiba mais →</a>
      </div>
    </>
  )
}
