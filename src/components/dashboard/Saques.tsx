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

interface SaquesProps {
  eventId?: string | null
}

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
      <div className="cd-saques-page-head">
        <PageHead
          eyebrow="Conta de pagamento"
          title="Saques e saldo"
          sub="Acompanhe seu dinheiro em tempo real. Transferências processadas com segurança pela infraestrutura Celebre."
          actions={
            <>
              <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
                <Icon.Doc style={{ width: 15, height: 15 }} />Extrato completo
              </button>
              <button
                className="ca-btn ca-btn--primary"
                style={{ height: 38, padding: '0 16px', fontSize: 13 }}
                onClick={() => { setWithdrawAmount(String((summary?.availableBalance ?? 0) / 100)); setWithdrawModal(true) }}
                disabled={hasPendingWithdrawal || !summary?.availableBalance || summary.availableBalance <= 0}
              >
                <Icon.Pix style={{ width: 16, height: 16 }} />Sacar via PIX
              </button>
            </>
          }
        />
      </div>

      <div className="cd-grid-saques" style={{ gap: 16 }}>
        <div className="ca-card cd-saques-hero" style={{ padding: 28, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)', borderColor: '#1E1B4B', color: '#fff' }}>
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
              <div className="cd-money" style={{ fontSize: 'clamp(28px, 6vw, 44px)', color: '#fff', marginTop: 10 }}>
                <span className="cd-money__currency">R$</span>
                <span>{Math.floor((summary?.availableBalance ?? 0) / 100).toLocaleString('pt-BR')}</span>
                <span className="cd-money__cents">,{String((summary?.availableBalance ?? 0) % 100).padStart(2, '0')}</span>
              </div>
            )}
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
              {summary?.bankConfigured ? 'Conta bancária configurada' : 'Configure sua conta bancária para sacar'}
            </div>
            <div className="ca-row ca-row--gap cd-saques-cta" style={{ marginTop: 22 }}>
              <button
                className="ca-btn ca-btn--primary ca-btn--lg"
                style={{ width: '100%', maxWidth: 200 }}
                onClick={() => { setWithdrawAmount(String((summary?.availableBalance ?? 0) / 100)); setWithdrawModal(true) }}
                disabled={hasPendingWithdrawal || !summary?.availableBalance || summary.availableBalance <= 0}
              >
                Sacar via PIX <Icon.ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="ca-row cd-saques-trust" style={{ gap: 18, marginTop: 24, fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>
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

      <div className="ca-card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
        <div style={{ padding: '18px 20px 12px' }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600 }}>Histórico</div>
        </div>
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ca-muted)', fontSize: 13 }}>Carregando…</div>
        )}
        {!loading && historyEntries.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ca-muted)', fontSize: 13 }}>Nenhuma movimentação ainda.</div>
        )}
        {!loading && historyEntries.map(entry => {
          if (entry.kind === 'tx') {
            const t = entry.item
            const isConfirmed = t.status === 'confirmed'
            return (
              <div key={`tx-${t.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderTop: '1px solid var(--ca-line-soft)' }}>
                <span style={{ width: 38, height: 38, borderRadius: 999, background: isConfirmed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon.Pix style={{ width: 16, height: 16, color: isConfirmed ? '#10B981' : '#F59E0B' }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</div>
                  <div style={{ fontSize: 12, color: 'var(--ca-muted)', marginTop: 1 }}>{fmtDayMonth(t.date)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: isConfirmed ? '#047857' : 'var(--ca-muted)' }}>
                    {isConfirmed ? '+ ' : ''}R$ {(t.netAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 1 }}>
                    {isConfirmed
                      ? <span style={{ color: '#10B981', fontWeight: 500 }}>Confirmado</span>
                      : <span style={{ color: '#F59E0B', fontWeight: 500 }}>Em análise</span>
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
              <div key={`wd-${w.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderTop: '1px solid var(--ca-line-soft)' }}>
                <span style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(99,102,241,0.10)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon.Bank style={{ width: 16, height: 16, color: 'var(--ca-indigo)' }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>Saque PIX</div>
                  <div style={{ fontSize: 12, color: 'var(--ca-muted)', marginTop: 1 }}>{fmtDayMonth(w.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: 'var(--ca-ink)' }}>
                    − R$ {(Number(w.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 11, color: statusColor, fontWeight: 500, marginTop: 1 }}>{statusLabel}</div>
                </div>
              </div>
            )
          }
        })}
      </div>

      {withdrawModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setWithdrawModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 400, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Solicitar saque</div>
            <div style={{ fontSize: 13, color: 'var(--ca-muted)', marginBottom: 24 }}>
              O valor será transferido para a conta bancária cadastrada no Pagar.me.
            </div>
            <label style={{ fontSize: 12.5, color: 'var(--ca-muted)', fontWeight: 500 }}>Valor (R$)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={(summary?.availableBalance ?? 0) / 100}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 20, padding: '10px 14px', border: '1px solid var(--ca-line)', borderRadius: 10, fontSize: 18, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, boxSizing: 'border-box' }}
              autoFocus
            />
            {withdrawMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, background: withdrawMsg.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: withdrawMsg.type === 'success' ? '#065F46' : '#991B1B' }}>
                {withdrawMsg.text}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ca-btn ca-btn--ghost" style={{ flex: 1, height: 44 }} onClick={() => setWithdrawModal(false)} disabled={withdrawing}>
                Cancelar
              </button>
              <button
                className="ca-btn ca-btn--primary"
                style={{ flex: 2, height: 44 }}
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                {withdrawing ? 'Solicitando…' : 'Confirmar saque'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
