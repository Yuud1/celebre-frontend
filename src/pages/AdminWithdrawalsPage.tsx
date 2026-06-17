import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

interface WithdrawalEvent {
  id: string
  slug: string
  data: { title?: string } | null
}

interface Withdrawal {
  id: string
  amount: string | number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED'
  rejectionReason?: string
  pagarmeError?: string
  createdAt: string
  user: {
    name: string
    email: string
    cpfCnpj: string
    bankCode?: string
    accountNumber?: string
    events: WithdrawalEvent[]
  }
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function fmtCpf(raw: string | null) {
  if (!raw) return '—'
  const d = raw.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return raw
}

function StatusBadge({ w }: { w: Withdrawal }) {
  if (w.status === 'PENDING')  return <span className="ca-badge ca-badge--warn">Pendente</span>
  if (w.status === 'APPROVED') return <span className="ca-badge ca-badge--success">Aprovado</span>
  if (w.status === 'REJECTED') return (
    <div>
      <span className="ca-badge ca-badge--error">Rejeitado</span>
      {w.rejectionReason && <div style={{ fontSize: 11, color: 'var(--ca-muted)', marginTop: 3 }}>{w.rejectionReason}</div>}
    </div>
  )
  return (
    <div>
      <span className="ca-badge ca-badge--error">Falhou</span>
      {w.pagarmeError && <div style={{ fontSize: 11, color: 'var(--ca-muted)', marginTop: 3 }}>{w.pagarmeError}</div>}
    </div>
  )
}

const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FAILED'] as const
const TAB_LABELS: Record<string, string> = { ALL: 'Todos', PENDING: 'Pendentes', APPROVED: 'Aprovados', REJECTED: 'Rejeitados', FAILED: 'Falhos' }

export function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [approveTarget, setApproveTarget] = useState<Withdrawal | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Withdrawal | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await api.adminListWithdrawals({ status: statusFilter === 'ALL' ? undefined : statusFilter, limit: 50 })
      setWithdrawals(res.withdrawals)
      setLastUpdated(new Date())
      setError('')
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar saques')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    setLoading(true)
    fetchWithdrawals()
    const interval = setInterval(fetchWithdrawals, 30_000)
    return () => clearInterval(interval)
  }, [fetchWithdrawals])

  const handleApprove = async () => {
    if (!approveTarget) return
    setActionLoading(approveTarget.id)
    setApproveTarget(null)
    try {
      await api.adminApproveWithdrawal(approveTarget.id)
      await fetchWithdrawals()
    } catch (err: any) {
      setError(`Erro ao aprovar: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return
    setActionLoading(rejectTarget.id)
    const target = rejectTarget
    const reason = rejectReason
    setRejectTarget(null)
    setRejectReason('')
    try {
      await api.adminRejectWithdrawal(target.id, reason)
      await fetchWithdrawals()
    } catch (err: any) {
      setError(`Erro ao rejeitar: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = withdrawals.filter(w => w.status === 'PENDING').length

  return (
    <div className="ca-root" style={{ padding: '40px', background: 'var(--ca-bg, #F8FAFC)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div className="ca-row ca-row--between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="ca-display" style={{ fontSize: 26, marginBottom: 4 }}>Backoffice de Saques</h1>
            {lastUpdated && (
              <div style={{ fontSize: 12, color: 'var(--ca-muted)' }}>
                Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · atualiza a cada 30s
              </div>
            )}
          </div>
          <div className="ca-row ca-row--gap">
            {pendingCount > 0 && (
              <span className="ca-badge ca-badge--warn" style={{ fontSize: 13 }}>{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>
            )}
            <button className="ca-btn ca-btn--ghost" style={{ height: 36, padding: '0 14px', fontSize: 13 }} onClick={fetchWithdrawals}>
              Atualizar
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'ca-btn ca-btn--primary' : 'ca-btn ca-btn--ghost'}
              style={{ height: 34, padding: '0 14px', fontSize: 13 }}
            >
              {TAB_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="ca-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--ca-muted)', fontSize: 14 }}>Carregando...</div>
          ) : withdrawals.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--ca-muted)', fontSize: 14 }}>Nenhum saque encontrado.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 900 }}>
                <thead>
                  <tr style={{ background: 'var(--ca-bg-soft)', borderBottom: '1px solid var(--ca-line)' }}>
                    {['Data', 'Usuário', 'Evento(s)', 'Conta Bancária', 'Valor', 'Status', 'Ações'].map(h => (
                      <th key={h} style={{ padding: '13px 18px', color: 'var(--ca-muted)', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--ca-line-soft)' }}>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                        {fmtDate(w.createdAt)}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>{w.user.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ca-muted)' }}>{w.user.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--ca-muted-2)', fontFamily: 'JetBrains Mono, monospace' }}>{fmtCpf(w.user.cpfCnpj)}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--ca-muted)', maxWidth: 180 }}>
                        {w.user.events?.length > 0
                          ? w.user.events.map(e => (e.data as any)?.title ?? e.slug).join(', ')
                          : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
                        <div>{w.user.bankCode ?? '—'}</div>
                        {w.user.accountNumber && <div style={{ fontSize: 11, color: 'var(--ca-muted)' }}>cc {w.user.accountNumber}</div>}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap' }}>
                        R$ {Number(w.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13 }}>
                        <StatusBadge w={w} />
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13 }}>
                        {w.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              disabled={actionLoading === w.id}
                              onClick={() => setApproveTarget(w)}
                              className="ca-btn ca-btn--primary"
                              style={{ height: 32, padding: '0 12px', fontSize: 12 }}
                            >
                              Aprovar
                            </button>
                            <button
                              disabled={actionLoading === w.id}
                              onClick={() => { setRejectTarget(w); setRejectReason('') }}
                              className="ca-btn ca-btn--ghost"
                              style={{ height: 32, padding: '0 12px', fontSize: 12, color: '#EF4444', borderColor: '#EF4444' }}
                            >
                              Rejeitar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {approveTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setApproveTarget(null)}>
          <div className="ca-card" style={{ padding: 32, width: 420, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirmar aprovação</div>
            <div style={{ fontSize: 14, color: 'var(--ca-muted)', marginBottom: 24, lineHeight: 1.6 }}>
              Aprovar saque de <strong style={{ color: 'var(--ca-ink)' }}>R$ {Number(approveTarget.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> para <strong style={{ color: 'var(--ca-ink)' }}>{approveTarget.user.name}</strong>?
              <br />A transferência será realizada imediatamente via Pagar.me.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ca-btn ca-btn--ghost" style={{ flex: 1, height: 42 }} onClick={() => setApproveTarget(null)}>Cancelar</button>
              <button className="ca-btn ca-btn--primary" style={{ flex: 2, height: 42 }} onClick={handleApprove}>Aprovar saque</button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setRejectTarget(null)}>
          <div className="ca-card" style={{ padding: 32, width: 420, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Rejeitar saque</div>
            <div style={{ fontSize: 14, color: 'var(--ca-muted)', marginBottom: 16 }}>
              Saque de <strong style={{ color: 'var(--ca-ink)' }}>R$ {Number(rejectTarget.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> — {rejectTarget.user.name}
            </div>
            <label style={{ fontSize: 12.5, color: 'var(--ca-muted)', fontWeight: 500 }}>Motivo da rejeição <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Informe o motivo para o host..."
              rows={3}
              style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 12px', border: '1px solid var(--ca-line)', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ca-btn ca-btn--ghost" style={{ flex: 1, height: 42 }} onClick={() => setRejectTarget(null)}>Cancelar</button>
              <button
                className="ca-btn ca-btn--primary"
                style={{ flex: 2, height: 42, background: '#EF4444', borderColor: '#EF4444' }}
                disabled={!rejectReason.trim()}
                onClick={handleReject}
              >
                Confirmar rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
