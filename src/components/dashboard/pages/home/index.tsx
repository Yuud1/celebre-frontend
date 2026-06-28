import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/auth/AuthIcons'
import { PageHead, type ActivePage } from '@/pages/DashboardPage'
import { Money, StatCard, BarChart, Donut, AVATAR_COLORS, fmtDate, nameInitials } from "@/components/dashboard/DashWidgets"
import { DashBtn } from '../../DashBtn'
import { DashBadge } from '../../DashBadge'
import { cn } from '@/lib/utils'

type Period = '7' | '14' | '30' | 'all'

function buildBarData(contributions: any[], days: number | null) {
  const now = new Date()
  const cutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null
  const n = days ?? 14
  const labels: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    labels.push(String(d.getDate()).padStart(2, '0'))
  }
  const counts: Record<string, number> = {}
  labels.forEach((l) => { counts[l] = 0 })
  for (const c of contributions) {
    if (c.status !== 'confirmed') continue
    if (cutoff && new Date(c.createdAt) < cutoff) continue
    const d = new Date(c.createdAt)
    const label = String(d.getDate()).padStart(2, '0')
    if (counts[label] !== undefined) counts[label]++
  }
  return labels.map((label) => ({ label, value: counts[label] }))
}

function buildSparkData(contributions: any[]): number[] {
  const now = new Date()
  const buckets: number[] = Array(12).fill(0)
  for (const c of contributions) {
    if (c.status !== 'confirmed') continue
    const diffDays = (now.getTime() - new Date(c.createdAt).getTime()) / (24 * 60 * 60 * 1000)
    const bucket = 11 - Math.min(11, Math.floor(diffDays))
    buckets[bucket] += Number(c.netAmount ?? 0)
  }
  return buckets
}

function KycStatusBig() {
  const { user } = useAuth()
  if (user?.kycStatus === 'bank_configured') return null
  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-[22px]" style={{ background: 'linear-gradient(160deg, #FEFBF4, #FEF7E7)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[10px] bg-amber-100 text-amber-600 inline-flex items-center justify-center shrink-0">
            <Icon.Shield style={{ width: 18, height: 18 }} />
          </span>
          <div>
            <div className="font-display text-[15px] font-semibold text-slate-900">Configure seu PIX</div>
            <div className="text-[12.5px] text-slate-500">Você precisa de uma chave PIX para sacar.</div>
          </div>
        </div>
        <DashBadge tone="warn">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Pendente
        </DashBadge>
      </div>
      <div className="mt-3.5">
        <DashBtn variant="primary" as="a" href="/verificacao" className="w-full justify-center !bg-amber-400 !shadow-none hover:!bg-amber-500">
          Configurar agora
        </DashBtn>
      </div>
    </div>
  )
}

interface DashHomeProps { event: any | null; contributions: any[]; onNavigate: (p: ActivePage) => void; availableBalance?: number | null }

export function DashHome({ event, contributions, onNavigate, availableBalance: availableBalanceProp }: DashHomeProps) {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'você'
  const [period, setPeriod] = useState<Period>('14')

  const days = period === 'all' ? null : Number(period)
  const cutoff = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null

  const confirmed = contributions.filter((c: any) => c.status === 'confirmed')
  const filteredConfirmed = useMemo(() =>
    cutoff ? confirmed.filter((c) => new Date(c.createdAt) >= cutoff) : confirmed,
    [confirmed, period]
  )

  const totalCollected  = confirmed.reduce((s: number, c: any) => s + Number(c.netAmount ?? 0), 0)
  const confirmedCount  = confirmed.length
  const avgTicket       = confirmedCount > 0 ? totalCollected / confirmedCount : 0
  const feed            = contributions.slice(0, 5)
  const periodTotal     = filteredConfirmed.reduce((s: number, c: any) => s + Number(c.netAmount ?? 0), 0)
  const periodAvgTicket = filteredConfirmed.length > 0 ? periodTotal / filteredConfirmed.length : 0
  const messageCount    = filteredConfirmed.filter((c: any) => c.message?.trim()).length
  const availableBalance= availableBalanceProp ?? totalCollected
  const sparkData       = useMemo(() => buildSparkData(contributions), [contributions])
  const barData         = useMemo(() => buildBarData(contributions, days), [contributions, period])

  const goalGift = useMemo(() =>
    (event?.gifts ?? []).find((g: any) => g.type === 'contribution' && Number(g.value) > 0) ?? null,
    [event?.gifts]
  )
  const goalPct = goalGift ? Math.min(1, Number(goalGift.collected ?? 0) / Number(goalGift.value)) : 0

  const eventStatus: 'published' | 'pending' | 'closed' =
    event?.status === 'published' ? 'published' :
    event?.status === 'closed'    ? 'closed'    : 'pending'

  const periodLabel = period === '7' ? '7 dias' : period === '14' ? '14 dias' : period === '30' ? '30 dias' : 'todo período'

  return (
    <>
      <PageHead
        eyebrow={`Visão geral · ${event?.data?.name ?? '—'}`}
        title={`Olá, ${firstName} 👋`}
        status={eventStatus}
        sub={event ? `Sua página "${event.data?.name}" está ${eventStatus === 'published' ? 'publicada e recebendo contribuições' : 'encerrada'}.` : ''}
        actions={
          <>
            <DashBtn variant="ghost" onClick={() => onNavigate('customize')}>
              <Icon.Camera style={{ width: 15, height: 15 }} />
              Editar página
            </DashBtn>
            {event?.slug && (
              <DashBtn variant="primary" as="a" href={`/p/${event.slug}`} target="_blank" rel="noreferrer">
                <Icon.Link style={{ width: 15, height: 15 }} />
                Ver evento
              </DashBtn>
            )}
          </>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 nav:grid-cols-4 gap-4">
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={totalCollected} currency spark={sparkData} />
        <StatCard icon={<Icon.Heart style={{ color: '#EC4899' }} />} label="Contribuições" value={confirmedCount} hint={avgTicket > 0 ? `Média R$ ${(avgTicket / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por contribuição` : undefined} />
        <StatCard icon={<Icon.Sparkle style={{ color: '#8B5CF6' }} />} label="Conversão da página" value="—" hint="Dados de visitas indisponíveis" />
        <StatCard icon={<Icon.Bank style={{ color: '#6366F1' }} />} label="Saldo disponível" value={availableBalance} currency hint="Saldo líquido acumulado" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 nav:grid-cols-[1.4fr_1fr] gap-4 mt-4">
        {/* Chart card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-[18px]">
            <div>
              <div className="font-display text-[16px] font-semibold text-slate-900">Contribuições por dia</div>
              <div className="text-[12.5px] text-slate-500 mt-0.5">Últimos {periodLabel}</div>
            </div>
            {/* Period tabs */}
            <div className="inline-flex gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
              {(['7', '14', '30', 'all'] as Period[]).map((p) => (
                <button
                  key={p}
                  className={cn(
                    'px-3.5 py-[7px] rounded-lg text-[13px] font-medium cursor-pointer transition-all border-0',
                    period === p
                      ? 'bg-white text-slate-900 font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
                      : 'text-slate-500 bg-transparent hover:text-slate-900',
                  )}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'all' ? 'Total' : `${p}d`}
                </button>
              ))}
            </div>
          </div>
          <BarChart height={210} data={barData} />
          <hr className="border-0 border-t border-slate-100 my-5" />
          <div className="flex items-center gap-7">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-[0.06em]">Total no período</div>
              <Money value={periodTotal} size={24} />
            </div>
            <span className="w-px self-stretch bg-slate-100" />
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-[0.06em]">Ticket médio</div>
              <Money value={periodAvgTicket} size={24} />
            </div>
            <span className="w-px self-stretch bg-slate-100" />
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-[0.06em]">Mensagens</div>
              <div className="font-display text-[22px] font-semibold mt-0.5">{messageCount}</div>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-4">
          {goalGift && (
            <div className="bg-white rounded-2xl border border-slate-200 p-[22px]">
              <div className="flex items-center justify-between mb-2">
                <div className="font-display text-[15px] font-semibold text-slate-900">{goalGift.name}</div>
                <DashBadge tone="violet">{Math.round(goalPct * 100)}% atingida</DashBadge>
              </div>
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="relative">
                  <Donut value={goalPct} size={100} stroke={10} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-display font-semibold text-[22px] tracking-[-0.02em]">{Math.round(goalPct * 100)}%</div>
                    <div className="text-[10px] text-slate-500">de {(Number(goalGift.value) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-slate-500 uppercase tracking-[0.06em]">Arrecadado</div>
                  <Money value={Number(goalGift.collected ?? 0)} size={22} />
                  <div className="text-xs text-slate-500 mt-0.5">
                    Faltam <strong className="text-slate-900">{(Math.max(0, Number(goalGift.value) - Number(goalGift.collected ?? 0)) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                  <button onClick={() => onNavigate('gifts')} className="inline-flex items-center gap-1 text-[12.5px] text-indigo-500 font-semibold mt-2.5 bg-transparent border-0 cursor-pointer p-0">
                    Ver detalhes <Icon.ArrowRight style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <KycStatusBig />
        </div>
      </div>

      {/* Recent contributions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-4">
        <div className="flex items-center justify-between px-[22px] pt-[18px] pb-3.5">
          <div>
            <div className="font-display text-[16px] font-semibold text-slate-900">Contribuições recentes</div>
            <div className="text-[12.5px] text-slate-500 mt-0.5">Últimas pessoas que celebraram com você</div>
          </div>
        </div>
        <div className="flex flex-col px-3.5 pb-3">
          {feed.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-[13px]">Nenhuma contribuição ainda.</div>
          )}
          {feed.map((c: any, i: number) => {
            const guestName = c.guestName ?? 'Anônimo'
            const initials  = nameInitials(guestName)
            const color     = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const isPaid    = c.status === 'confirmed'
            return (
              <div key={c.id} className="grid grid-cols-[36px_1fr_auto_auto] gap-3.5 px-2 py-3.5 items-center border-t border-slate-100 first:border-t-0 hover:bg-slate-50 transition-colors rounded-xl">
                <span className="w-9 h-9 rounded-full inline-flex items-center justify-center text-white font-semibold text-[13px] shrink-0" style={{ background: color }}>
                  {initials}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[13.5px] text-slate-900">{guestName}</span>
                    <span className="text-[12px] text-slate-400">·</span>
                    <span className="text-[12.5px] text-slate-500">{c.gift?.name ?? '—'}</span>
                  </div>
                  {c.message && (
                    <div className="text-[12.5px] text-slate-600 mt-0.5 italic overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                      "{c.message}"
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <Money value={Number(c.amount)} size={15} />
                  <div className="text-[11px] text-slate-400 mt-0.5">{fmtDate(c.createdAt)}</div>
                </div>
                <DashBadge tone={isPaid ? 'success' : 'warn'}>
                  {isPaid
                    ? <><Icon.Check style={{ width: 11, height: 11 }} />Pago</>
                    : <><Icon.Loader style={{ width: 11, height: 11 }} />Aguardando</>}
                </DashBadge>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
