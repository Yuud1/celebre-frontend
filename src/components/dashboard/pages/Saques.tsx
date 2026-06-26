import { useEffect, useState, useMemo } from 'react'
import { Icon } from '../../auth/AuthIcons'
import { Money, Sparkline } from '../DashWidgets'
import { DashBadge } from '../DashBadge'
import { api } from '../../../lib/api'
import { cn } from '@/lib/utils'
import { DashPageHeader } from '../DashPageHeader'
import { PageHead } from '../../../pages/DashboardPage'
import { File } from 'lucide-react'

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

interface SaquesProps { eventId?: string | null; onBack?: () => void }

export function Saques({ eventId: _eventId, onBack }: SaquesProps) {
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
  const canWithdraw = !hasPendingWithdrawal && !!summary?.availableBalance && summary.availableBalance > 0
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

  const balance   = summary?.availableBalance ?? 0
  const balReais  = Math.floor(balance / 100).toLocaleString('pt-BR')
  const balCents  = String(balance % 100).padStart(2, '0')

  return (
    <div className="flex flex-col min-h-full">
      <div className="hidden nav:block mb-5">
        <PageHead eyebrow="Financeiro" title="Saques" />
      </div>
      <div className="sm:flex sm:justify-between sm:gap-10">
        <div
        className="nav:flex-1 relative nav:block overflow-hidden shrink-0 rounded-b-[32px] nav:rounded-[24px]"
        style={{ background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)' }}
      >
        <div className="absolute w-[340px] h-[340px] rounded-full pointer-events-none"
          style={{ top: -120, right: -80, background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)', filter: 'blur(28px)' }} />
        <div className="absolute w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ bottom: -90, left: -60, background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)', filter: 'blur(24px)' }} />

        <div className="relative flex flex-col px-6 pt-8 pb-8 nav:px-10 nav:pt-9">
          {/* top row: title + extrato */}

            <DashPageHeader
              title="Saldo"
              onBack={onBack}
              titleColor="text-white"
              iconColor="text-white/80"
              iconBg="bg-white/10 hover:bg-white/20"
              className="mb-10 nav:hidden"
              right={
                <button
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 
                  rounded-full inline-flex items-center justify-center
                   border-0 cursor-pointer transition-colors text-white/80"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <File size={18} />
                </button>
              }
            />
            

          {/* balance */}
          <div className="mb-8 flex flex-col items-start nav:items-center">
            <div className="flex items-center justify-center gap-1.5 text-white/55 text-[13px] mb-3 uppercase">
              Disponível
            </div>
            {loading ? (
              <div className="h-[68px] rounded-[14px] mx-auto w-[60%] animate-pulse" style={{ background: 'rgba(255,255,255,0.12)' }} />
            ) : (
              <div className="font-display font-bold text-white tabular-nums leading-none inline-flex items-baseline"
                style={{ fontSize: 'clamp(48px, 9vw, 68px)' }}>
                <span className="font-medium text-white/60 mr-1.5" style={{ fontSize: '0.42em' }}>R$</span>
                {balReais}
                <span className="text-white/60 ml-0.5" style={{ fontSize: '0.38em' }}>,{balCents}</span>
              </div>
            )}
          </div>

          {/* trust row */}
          <div className="flex items-center justify-center gap-5 mb-7 text-white/40 text-[11px] font-medium flex-wrap">
            <span className="flex items-center gap-1"><Icon.ShieldCheck style={{ width: 12, height: 12, color: '#818CF8' }} />Custódia segregada</span>
            <span className="flex items-center gap-1"><Icon.Pix style={{ width: 12, height: 12, color: '#818CF8' }} />PIX em até 30s</span>
            <span className="flex items-center gap-1"><Icon.Lock style={{ width: 12, height: 12, color: '#818CF8' }} />Auditado · BACEN</span>
          </div>

          <div className="flex justify-center">
            <button
              disabled={!canWithdraw}
              onClick={() => { setWithdrawAmount(String(balance / 100)); setWithdrawModal(true) }}
              className={cn(
                'h-[52px] rounded-[14px] text-black bg-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all border-0 cursor-pointer',
                canWithdraw
                  ? 'hover:brightness-110 active:scale-[0.98]'
                  : 'opacity-50 cursor-not-allowed shadow-none',
              )}
              style={{
                width: '100%',
                background: canWithdraw
                  ? 'white'
                  : 'rgba(255,255,255,0.15)',
              }}
            >
              <Icon.Pix style={{ width: 18, height: 18 }} />
              {hasPendingWithdrawal ? 'Saque em andamento' : 'Sacar via PIX'}
              {canWithdraw && <Icon.ArrowRight style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards — after history */}
        <div className="sm:grid grid-cols-2 hidden gap-4">
          {/* Pending */}
          <div className="bg-white rounded-2xl border border-slate-200 p-[22px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                <Icon.Loader style={{ width: 14, height: 14, color: '#F59E0B' }} />Saldo em análise
              </div>
              {!loading && (summary?.pendingCount ?? 0) > 0 && (
                <DashBadge tone="warn">{summary!.pendingCount} {summary!.pendingCount === 1 ? 'contrib.' : 'contribs.'}</DashBadge>
              )}
            </div>
            {loading ? (
              <div className="h-8 mt-2 bg-slate-50 rounded-md animate-pulse" />
            ) : (
              <Money value={summary?.pendingBalance ?? 0} size={26} />
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
            <div className="flex items-center gap-1.5 text-[12.5px] text-slate-500 mb-1">
              <Icon.Check style={{ width: 14, height: 14, color: '#10B981' }} />Total recebido
            </div>
            {loading ? (
              <div className="h-8 mt-2 bg-slate-50 rounded-md animate-pulse" />
            ) : (
              <Money value={summary?.totalNetReceived ?? 0} size={26} />
            )}
            <div className="text-[12.5px] text-slate-500 mt-1.5">
              {summary?.confirmedCount ?? 0} {(summary?.confirmedCount ?? 0) === 1 ? 'contribuição' : 'contribuições'} confirmadas
              {summary?.lastConfirmedAt ? ` · último em ${fmtLastDate(summary.lastConfirmedAt)}` : ''}
            </div>
            <hr className="border-0 border-t border-slate-100 my-3.5" />
            <div className="h-9"><Sparkline data={sparkData} /></div>
          </div>
        </div>
      </div>

      {/* ── Content below hero ── */}
      <div className="flex flex-col gap-4 px-5 nav:px-0 pt-5 pb-8 max-sm:pb-[calc(64px+20px)]">

        {/* History */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 pt-[18px] pb-3">
            <div className="font-display text-[15px] font-semibold text-slate-900">Histórico</div>
          </div>
          {loading && (
            <div className="py-6 text-center text-slate-500 text-[13px]">Carregando…</div>
          )}
          {!loading && historyEntries.length === 0 && (
            <div className="py-6 text-center text-slate-500 text-[13px]">Nenhuma movimentação ainda.</div>
          )}
          {!loading && historyEntries.map(entry => {
            if (entry.kind === 'tx') {
              const t = entry.item
              const isConfirmed = t.status === 'confirmed'
              return (
                <div key={`tx-${t.id}`} className="flex items-center gap-3.5 px-5 py-[13px] border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className={cn('w-[38px] h-[38px] rounded-full inline-flex items-center justify-center shrink-0', isConfirmed ? 'bg-emerald-50' : 'bg-amber-50')}>
                    <Icon.Pix style={{ width: 16, height: 16, color: isConfirmed ? '#10B981' : '#F59E0B' }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13.5px] text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap">{t.desc}</div>
                    <div className="text-[12px] text-slate-500 mt-px">{fmtDayMonth(t.date)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn('font-semibold text-[14px] tabular-nums', isConfirmed ? 'text-emerald-700' : 'text-slate-400')}>
                      {isConfirmed ? '+ ' : ''}R$ {(t.netAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] mt-px">
                      {isConfirmed
                        ? <span className="text-emerald-500 font-medium">Confirmado</span>
                        : <span className="text-amber-500 font-medium">Em análise</span>}
                    </div>
                  </div>
                </div>
              )
            } else {
              const w = entry.item
              const statusColor = w.status === 'APPROVED' ? '#047857' : w.status === 'PENDING' ? '#B45309' : '#BE123C'
              const statusLabel = w.status === 'APPROVED' ? 'Aprovado' : w.status === 'PENDING' ? 'Aguardando' : w.status === 'REJECTED' ? 'Rejeitado' : 'Falhou'
              return (
                <div key={`wd-${w.id}`} className="flex items-center gap-3.5 px-5 py-[13px] border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="w-[38px] h-[38px] rounded-full bg-indigo-50 inline-flex items-center justify-center shrink-0">
                    <Icon.Bank style={{ width: 16, height: 16, color: '#6366F1' }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13.5px] text-slate-900">Saque PIX</div>
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
      </div>

      {/* ── Withdraw modal ── */}
      {withdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] flex items-end sm:items-center justify-center z-[1000]"
          onClick={() => setWithdrawModal(false)}>
          <div
            className="bg-white w-full sm:w-[400px] sm:max-w-[90vw] sm:rounded-[20px] rounded-t-[24px] p-7 sm:p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="font-display text-xl font-bold mb-1.5">Solicitar saque</div>
            <div className="text-[13px] text-slate-500 mb-6">
              O valor será transferido para a conta bancária cadastrada no Pagar.me.
            </div>
            <label className="text-[12.5px] text-slate-500 font-medium">Valor (R$)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={balance / 100}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              className="block w-full mt-1.5 mb-5 px-3.5 py-3 border border-slate-200 rounded-[10px] text-[22px] font-display font-bold focus:outline-none focus:border-indigo-400 text-slate-900"
              autoFocus
            />
            {withdrawMsg && (
              <div className={cn('px-3.5 py-2.5 rounded-[10px] mb-4 text-[13px]',
                withdrawMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800')}>
                {withdrawMsg.text}
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                className="flex-1 h-11 rounded-[10px] border border-slate-200 bg-white text-slate-700 font-semibold text-[13.5px] cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setWithdrawModal(false)} disabled={withdrawing}
              >
                Cancelar
              </button>
              <button
                className={cn(
                  'flex-[2] h-11 rounded-[10px] text-white font-semibold text-[13.5px] flex items-center justify-center gap-1.5 border-0 transition-all',
                  withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0
                    ? 'opacity-50 cursor-not-allowed bg-indigo-400'
                    : 'cursor-pointer hover:brightness-105',
                )}
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                <Icon.Pix style={{ width: 15, height: 15 }} />
                {withdrawing ? 'Solicitando…' : 'Confirmar saque'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
