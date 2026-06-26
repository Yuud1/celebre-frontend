import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { DashBtn } from '../components/dashboard/DashBtn'
import { DashBadge } from '../components/dashboard/DashBadge'
import { cn } from '@/lib/utils'

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
  if (w.status === 'PENDING')  return <DashBadge tone="warn">Pendente</DashBadge>
  if (w.status === 'APPROVED') return <DashBadge tone="success">Aprovado</DashBadge>
  if (w.status === 'REJECTED') return (
    <div>
      <DashBadge tone="error">Rejeitado</DashBadge>
      {w.rejectionReason && <div className="text-[11px] text-slate-500 mt-0.5">{w.rejectionReason}</div>}
    </div>
  )
  return (
    <div>
      <DashBadge tone="error">Falhou</DashBadge>
      {w.pagarmeError && <div className="text-[11px] text-slate-500 mt-0.5">{w.pagarmeError}</div>}
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
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen px-10 py-10">
      <div className="max-w-[1100px] mx-auto">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-[-0.025em] text-slate-950 mb-1">Backoffice de Saques</h1>
            {lastUpdated && (
              <div className="text-[12px] text-slate-500">
                Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · atualiza a cada 30s
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {pendingCount > 0 && (
              <DashBadge tone="warn" className="text-[13px]">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</DashBadge>
            )}
            <DashBtn variant="ghost" onClick={fetchWithdrawals}>Atualizar</DashBtn>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 px-4 py-2.5 rounded-[10px] mb-4 text-[13px]">{error}</div>
        )}

        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map(s => (
            <DashBtn
              key={s}
              variant={statusFilter === s ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter(s)}
              className="h-[34px] !px-3.5 !text-[13px]"
            >
              {TAB_LABELS[s]}
            </DashBtn>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-[14px]">Carregando...</div>
          ) : withdrawals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-[14px]">Nenhum saque encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left" style={{ minWidth: 900 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Data', 'Usuário', 'Evento(s)', 'Conta Bancária', 'Valor', 'Status', 'Ações'].map(h => (
                      <th key={h} className="px-[18px] py-[13px] text-slate-500 text-[12px] font-semibold tracking-[0.05em] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map(w => (
                    <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-[18px] py-[14px] text-[13px] text-slate-500 font-mono whitespace-nowrap">{fmtDate(w.createdAt)}</td>
                      <td className="px-[18px] py-[14px] text-[13px]">
                        <div className="font-semibold">{w.user.name}</div>
                        <div className="text-[12px] text-slate-500">{w.user.email}</div>
                        <div className="text-[12px] text-slate-400 font-mono">{fmtCpf(w.user.cpfCnpj)}</div>
                      </td>
                      <td className="px-[18px] py-[14px] text-[13px] text-slate-500 max-w-[180px]">
                        {w.user.events?.length > 0
                          ? w.user.events.map(e => (e.data as any)?.title ?? e.slug).join(', ')
                          : '—'}
                      </td>
                      <td className="px-[18px] py-[14px] text-[13px] font-mono">
                        <div>{w.user.bankCode ?? '—'}</div>
                        {w.user.accountNumber && <div className="text-[11px] text-slate-500">cc {w.user.accountNumber}</div>}
                      </td>
                      <td className="px-[18px] py-[14px] text-[15px] font-display font-bold whitespace-nowrap">
                        R$ {(Number(w.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-[18px] py-[14px] text-[13px]">
                        <StatusBadge w={w} />
                      </td>
                      <td className="px-[18px] py-[14px] text-[13px]">
                        {w.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <DashBtn
                              variant="primary"
                              className="h-8 !px-3 !text-[12px]"
                              disabled={actionLoading === w.id}
                              onClick={() => setApproveTarget(w)}
                            >
                              Aprovar
                            </DashBtn>
                            <DashBtn
                              variant="ghost"
                              className={cn('h-8 !px-3 !text-[12px]', '!text-red-500 !border-red-300 hover:!bg-red-50')}
                              disabled={actionLoading === w.id}
                              onClick={() => { setRejectTarget(w); setRejectReason('') }}
                            >
                              Rejeitar
                            </DashBtn>
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

      {/* Approve modal */}
      {approveTarget && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]" onClick={() => setApproveTarget(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 w-[420px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <div className="font-display text-[18px] font-bold mb-2">Confirmar aprovação</div>
            <div className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              Aprovar saque de <strong className="text-slate-900">R$ {(Number(approveTarget.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> para <strong className="text-slate-900">{approveTarget.user.name}</strong>?
              <br />A transferência será realizada imediatamente via Pagar.me.
            </div>
            <div className="flex gap-2.5">
              <DashBtn variant="ghost" className="flex-1 h-[42px] justify-center" onClick={() => setApproveTarget(null)}>Cancelar</DashBtn>
              <DashBtn variant="primary" className="flex-[2] h-[42px] justify-center" onClick={handleApprove}>Aprovar saque</DashBtn>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]" onClick={() => setRejectTarget(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 w-[420px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <div className="font-display text-[18px] font-bold mb-2">Rejeitar saque</div>
            <div className="text-[14px] text-slate-500 mb-4">
              Saque de <strong className="text-slate-900">R$ {(Number(rejectTarget.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> — {rejectTarget.user.name}
            </div>
            <label className="text-[12.5px] text-slate-500 font-medium">Motivo da rejeição <span className="text-red-500">*</span></label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Informe o motivo para o host..."
              rows={3}
              className="block w-full mt-1.5 mb-5 px-3 py-2.5 border border-slate-200 rounded-[10px] text-[13px] resize-y focus:outline-none focus:border-indigo-400 box-border"
              autoFocus
            />
            <div className="flex gap-2.5">
              <DashBtn variant="ghost" className="flex-1 h-[42px] justify-center" onClick={() => setRejectTarget(null)}>Cancelar</DashBtn>
              <DashBtn
                variant="primary"
                className="flex-[2] h-[42px] justify-center !bg-red-500 !border-red-500 hover:!brightness-95"
                disabled={!rejectReason.trim()}
                onClick={handleReject}
              >
                Confirmar rejeição
              </DashBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
