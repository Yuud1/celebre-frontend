import { useEffect, useState, useMemo } from 'react'
import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import { Money, Sparkline } from './DashWidgets'
import { DashBtn, DashBadge } from './DashShared'
import { api } from '../../lib/api'
import { cn } from '@/lib/utils'

type Summary = {
  availableBalance: number
  pendingBalance: number
  pendingCount: number
  totalNetReceived: number
  confirmedCount: number
  bankConfigured: boolean
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

type HistoryEntry =
  | { kind: 'tx'; item: Transaction }
  | { kind: 'wd'; item: any }

function fmtDayMonth(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')
}

function fmtLastDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
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

interface SaquesProps { eventId?: string | null }

export function Saques({ eventId: _eventId }: SaquesProps) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([api.getWalletSummary(), api.getWalletTransactions(), api.getWithdrawalHistory()])
      .then(([s, t, w]) => {
        if (cancelled) return
        setSummary(s)
        setTransactions(Array.isArray(t) ? t : [])
        setWithdrawals(Array.isArray(w) ? w : [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleWithdraw = async () => {
    const amount = Math.round(parseFloat(withdrawAmount.replace(',', '.')) * 100)
    if (!amount || amount <= 0) return
    setWithdrawing(true)
    setWithdrawMsg(null)
    try {
      await api.requestWithdrawal(amount)
      setWithdrawMsg({ type: 'success', text: 'Saque solicitado! Seu pedido está em análise e será processado em breve.' })
      setWithdrawAmount('')
      setTimeout(() => { setWithdrawModal(false); setWithdrawMsg(null) }, 3000)
    } catch (err: any) {
      setWithdrawMsg({ type: 'error', text: err.message || 'Erro ao solicitar saque.' })
    } finally {
      setWithdrawing(false)
    }
  }

  const hasPendingWithdrawal = withdrawals.some((w: any) => w.status === 'PENDING')
  const sparkData = useMemo(() => buildSparkData(transactions), [transactions])
  const txList = Array.isArray(transactions) ? transactions : []

  const historyEntries: HistoryEntry[] = useMemo(() => [
    ...txList.map(t => ({ kind: 'tx' as const, item: t })),
    ...withdrawals.map(w => ({ kind: 'wd' as const, item: w })),
  ].sort((a, b) => {
    const da = new Date(a.kind === 'tx' ? a.item.date : a.item.createdAt).getTime()
    const db = new Date(b.kind === 'tx' ? b.item.date : b.item.createdAt).getTime()
    return db - da
  }), [txList, withdrawals])

  return (
    <>
      <PageHead
        eyebrow="Conta de pagamento"
        title="Saques e saldo"
        sub="Acompanhe seu dinheiro em tempo real. Transferências processadas com segurança pela infraestrutura Celebre."
        actions={
          <>
            <DashBtn variant="ghost">
              <Icon.Doc style={{ width: 15, height: 15 }} />Extrato completo
            </DashBtn>
            <DashBtn
              variant="primary"
              onClick={() => { setWithdrawAmount(String((summary?.availableBalance ?? 0) / 100)); setWithdrawModal(true) }}
              disabled={hasPendingWithdrawal || !summary?.availableBalance || summary.availableBalance <= 0}
            >
              <Icon.Pix style={{ width: 16, height: 16 }} />Sacar via PIX
            </DashBtn>
          </>
        }
      />

      {/* 3-col grid */}
      <div className="grid grid-cols-1 nav:grid-cols-[1.4fr_1fr_1fr] gap-4">
        {/* Hero balance card */}
        <div className="rounded-2xl p-7 relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)' }}>
          <div className="absolute w-[280px] h-[280px] rounded-full -top-[100px] -right-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%)', filter: 'blur(20px)' }} />
          <div className="absolute w-[220px] h-[220px] rounded-full -bottom-[80px] -left-[40px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', filter: 'blur(20px)' }} />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-white/70 text-[12.5px]">
              <Icon.Pix style={{ width: 14, height: 14, color: '#A5B4FC' }} />
              Saldo disponível para saque
            </div>
            {loading ? (
              <div className="h-[60px] mt-2.5 bg-white/20 rounded-lg opacity-40" />
            ) : (
              <div className="mt-2.5 font-display font-semibold tabular-nums text-white inline-flex items-baseline gap-1" style={{ fontSize: 'clamp(28px, 6vw, 44px)' }}>
                <span className="text-[0.58em] text-white/70 font-medium">R$</span>
                <span>{Math.floor((summary?.availableBalance ?? 0) / 100).toLocaleString('pt-BR')}</span>
                <span className="text-[0.55em] text-white/70 ml-0.5">,{String((summary?.availableBalance ?? 0) % 100).padStart(2, '0')}</span>
              </div>
            )}
            <div className="text-[12.5px] text-white/55 mt-1.5">
              {summary?.bankConfigured ? 'Conta bancária configurada' : 'Configure sua conta bancária para sacar'}
            </div>
            <div className="mt-[22px]">
              <DashBtn
                variant="primary"
                size="lg"
                className="w-full max-w-[200px] justify-center"
                onClick={() => { setWithdrawAmount(String((summary?.availableBalance ?? 0) / 100)); setWithdrawModal(true) }}
                disabled={hasPendingWithdrawal || !summary?.availableBalance || summary.availableBalance <= 0}
              >
                Sacar via PIX <Icon.ArrowRight style={{ width: 18, height: 18 }} />
              </DashBtn>
            </div>
            <div className="flex items-center gap-[18px] mt-6 text-[11.5px] text-white/60 flex-wrap">
              <span className="flex items-center gap-1.5"><Icon.ShieldCheck style={{ width: 13, height: 13, color: '#A5B4FC' }} />Custódia em conta segregada</span>
              <span className="flex items-center gap-1.5"><Icon.Pix style={{ width: 13, height: 13, color: '#A5B4FC' }} />PIX em até 30s</span>
              <span className="flex items-center gap-1.5"><Icon.Lock style={{ width: 13, height: 13, color: '#A5B4FC' }} />Auditado · BACEN</span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl border border-slate-200 p-[22px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
              <Icon.Loader style={{ width: 14, height: 14, color: '#F59E0B' }} />Saldo em análise
            </div>
            {!loading && (summary?.pendingCount ?? 0) > 0 && (
              <DashBadge tone="warn">{summary!.pendingCount} {summary!.pendingCount === 1 ? 'contribuição' : 'contribuições'}</DashBadge>
            )}
          </div>
          {loading ? (
            <div className="h-9 mt-2 bg-slate-50 rounded-md" />
          ) : (
            <Money value={summary?.pendingBalance ?? 0} size={28} />
          )}
          <div className="text-[12.5px] text-slate-500 mt-1.5 leading-relaxed">
            Análise antifraude · disponível em até <strong className="text-slate-900">48h</strong>.
          </div>
          <hr className="border-0 border-t border-slate-100 my-3.5" />
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
            <Icon.Info style={{ width: 13, height: 13 }} />
            Contribuições acima de R$ 500 passam por revisão automática.
          </div>
        </div>

        {/* Total received */}
        <div className="bg-white rounded-2xl border border-slate-200 p-[22px]">
          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
            <Icon.Check style={{ width: 14, height: 14, color: '#10B981' }} />Total recebido
          </div>
          {loading ? (
            <div className="h-9 mt-2 bg-slate-50 rounded-md" />
          ) : (
            <Money value={summary?.totalNetReceived ?? 0} size={28} />
          )}
          <div className="text-[12.5px] text-slate-500 mt-1.5">
            {summary?.confirmedCount ?? 0} {(summary?.confirmedCount ?? 0) === 1 ? 'contribuição' : 'contribuições'} confirmadas
            {summary?.lastConfirmedAt ? ` · último em ${fmtLastDate(summary.lastConfirmedAt)}` : ''}
          </div>
          <hr className="border-0 border-t border-slate-100 my-3.5" />
          <div className="h-9"><Sparkline data={sparkData} /></div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-4">
        <div className="px-5 pt-[18px] pb-3">
          <div className="font-display text-[15px] font-semibold text-slate-900">Histórico</div>
        </div>
        {loading && (
          <div className="py-5 text-center text-slate-500 text-[13px]">Carregando…</div>
        )}
        {!loading && historyEntries.length === 0 && (
          <div className="py-5 text-center text-slate-500 text-[13px]">Nenhuma movimentação ainda.</div>
        )}
        {!loading && historyEntries.map(entry => {
          if (entry.kind === 'tx') {
            const t = entry.item
            const isConfirmed = t.status === 'confirmed'
            return (
              <div key={`tx-${t.id}`} className="flex items-center gap-3.5 px-5 py-[13px] border-t border-slate-100">
                <span className={cn('w-[38px] h-[38px] rounded-full inline-flex items-center justify-center shrink-0', isConfirmed ? 'bg-emerald-500/10' : 'bg-amber-500/10')}>
                  <Icon.Pix style={{ width: 16, height: 16, color: isConfirmed ? '#10B981' : '#F59E0B' }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13.5px] overflow-hidden text-ellipsis whitespace-nowrap">{t.desc}</div>
                  <div className="text-[12px] text-slate-500 mt-px">{fmtDayMonth(t.date)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-semibold text-[14px] tabular-nums ${isConfirmed ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {isConfirmed ? '+ ' : ''}R$ {(t.netAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] mt-px">
                    {isConfirmed
                      ? <span className="text-emerald-500 font-medium">Confirmado</span>
                      : <span className="text-amber-500 font-medium">Em análise</span>
                    }
                  </div>
                </div>
              </div>
            )
          } else {
            const w = entry.item
            const statusColor = w.status === 'APPROVED' ? '#047857' : w.status === 'PENDING' ? '#B45309' : '#BE123C'
            const statusLabel = w.status === 'APPROVED' ? 'Aprovado' : w.status === 'PENDING' ? 'Aguardando' : w.status === 'REJECTED' ? 'Rejeitado' : 'Falhou'
            return (
              <div key={`wd-${w.id}`} className="flex items-center gap-3.5 px-5 py-[13px] border-t border-slate-100">
                <span className="w-[38px] h-[38px] rounded-full bg-indigo-500/10 inline-flex items-center justify-center shrink-0">
                  <Icon.Bank style={{ width: 16, height: 16, color: '#6366F1' }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13.5px]">Saque PIX</div>
                  <div className="text-[12px] text-slate-500 mt-px">{fmtDayMonth(w.createdAt)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-[14px] tabular-nums text-slate-900">
                    − R$ {(Number(w.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] font-medium mt-px" style={{ color: statusColor }}>{statusLabel}</div>
                </div>
              </div>
            )
          }
        })}
      </div>

      {/* Withdraw modal */}
      {withdrawModal && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]" onClick={() => setWithdrawModal(false)}>
          <div className="bg-white rounded-[20px] p-8 w-[400px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <div className="font-display text-xl font-bold mb-1.5">Solicitar saque</div>
            <div className="text-[13px] text-slate-500 mb-6">
              O valor será transferido para a conta bancária cadastrada no Pagar.me.
            </div>
            <label className="text-[12.5px] text-slate-500 font-medium">Valor (R$)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={(summary?.availableBalance ?? 0) / 100}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              className="block w-full mt-1.5 mb-5 px-3.5 py-2.5 border border-slate-200 rounded-[10px] text-[18px] font-display font-semibold focus:outline-none focus:border-indigo-400"
              autoFocus
            />
            {withdrawMsg && (
              <div className={cn('px-3.5 py-2.5 rounded-[10px] mb-4 text-[13px]', withdrawMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')}>
                {withdrawMsg.text}
              </div>
            )}
            <div className="flex gap-2.5">
              <DashBtn variant="ghost" className="flex-1 h-11 justify-center" onClick={() => setWithdrawModal(false)} disabled={withdrawing}>
                Cancelar
              </DashBtn>
              <DashBtn
                variant="primary"
                className="flex-[2] h-11 justify-center"
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                {withdrawing ? 'Solicitando…' : 'Confirmar saque'}
              </DashBtn>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
