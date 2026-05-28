import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import type { ActivePage } from '../../pages/DashboardPage'
import { Money, StatCard, BarChart, Donut, AVATAR_COLORS, fmtDate, nameInitials } from './DashWidgets'

type Period = '7' | '14' | '30' | 'all'

function dayKey(date: string | Date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildBarData(contributions: any[], days: number | null) {
  const now = new Date()
  const cutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null

  // Generate labels for the range
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
  if (user?.kycStatus === 'pix_configured') return null
  return (
    <div className="ca-card" style={{ padding: 22, background: 'linear-gradient(160deg, #FEFBF4, #FEF7E7)', borderColor: 'rgba(245,158,11,0.25)' }}>
      <div className="ca-row ca-row--between">
        <div className="ca-row ca-row--gap">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.18)', color: '#B45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.Shield style={{ width: 18, height: 18 }} />
          </span>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600 }}>Configure seu PIX</div>
            <div style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>Você precisa de uma chave PIX para sacar.</div>
          </div>
        </div>
        <span className="ca-badge ca-badge--warn">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: '#F59E0B' }} />
          Pendente
        </span>
      </div>
      <div style={{ marginTop: 14 }}>
        <Link to="/verificacao" className="ca-btn ca-btn--primary" style={{ width: '100%', height: 38, background: '#F59E0B', borderColor: '#F59E0B' }}>
          Configurar agora
        </Link>
      </div>
    </div>
  )
}

interface DashHomeProps { event: any | null; contributions: any[]; onNavigate: (p: ActivePage) => void }

export function DashHome({ event, contributions, onNavigate }: DashHomeProps) {
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

  const totalCollected = confirmed.reduce((s: number, c: any) => s + Number(c.amount), 0)
  const confirmedCount = confirmed.length
  const avgTicket = confirmedCount > 0 ? totalCollected / confirmedCount : 0
  const feed = contributions.slice(0, 5)

  const periodTotal = filteredConfirmed.reduce((s: number, c: any) => s + Number(c.amount), 0)
  const periodAvgTicket = filteredConfirmed.length > 0 ? periodTotal / filteredConfirmed.length : 0
  const messageCount = filteredConfirmed.filter((c: any) => c.message?.trim()).length

  const availableBalance = confirmed.reduce((s: number, c: any) => s + Number(c.netAmount ?? 0), 0)
  const sparkData = useMemo(() => buildSparkData(contributions), [contributions])
  const barData = useMemo(() => buildBarData(contributions, days), [contributions, period])

  // Top contribution-type gift for goal widget
  const goalGift = useMemo(() =>
    (event?.gifts ?? []).find((g: any) => g.type === 'contribution' && Number(g.value) > 0) ?? null,
    [event?.gifts]
  )
  const goalPct = goalGift ? Math.min(1, Number(goalGift.collected ?? 0) / Number(goalGift.value)) : 0

  const eventStatus: 'published' | 'pending' | 'closed' =
    event?.status === 'published' ? 'published' :
    event?.status === 'closed' ? 'closed' : 'pending'

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
            <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }} onClick={() => onNavigate('customize')}>
              <Icon.Camera style={{ width: 15, height: 15 }} />
              Editar página
            </button>
            {event?.slug && (
              <a href={`/p/${event.slug}`} target="_blank" rel="noreferrer" className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon.Link style={{ width: 15, height: 15 }} />
                Ver evento
              </a>
            )}
          </>
        }
      />

      <div className="cd-grid-stats-4" style={{ gap: 16 }}>
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={totalCollected} currency spark={sparkData} />
        <StatCard icon={<Icon.Heart style={{ color: '#EC4899' }} />} label="Contribuições" value={confirmedCount} hint={avgTicket > 0 ? `Média R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por contribuição` : undefined} />
        <StatCard icon={<Icon.Sparkle style={{ color: '#8B5CF6' }} />} label="Conversão da página" value="—" hint="Dados de visitas indisponíveis" />
        <StatCard icon={<Icon.Bank style={{ color: '#6366F1' }} />} label="Saldo disponível" value={availableBalance} currency hint="Saldo líquido acumulado" />
      </div>

      <div className="cd-grid-content" style={{ gap: 16, marginTop: 16 }}>
        <div className="ca-card" style={{ padding: 24 }}>
          <div className="ca-row ca-row--between" style={{ marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600 }}>Contribuições por dia</div>
              <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 2 }}>Últimos {periodLabel}</div>
            </div>
            <div className="cd-tabs">
              {(['7', '14', '30', 'all'] as Period[]).map((p) => (
                <span
                  key={p}
                  className={`cd-tab${period === p ? ' cd-tab--on' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'all' ? 'Total' : `${p}d`}
                </span>
              ))}
            </div>
          </div>
          <BarChart height={210} data={barData} />
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '20px 0 14px' }} />
          <div className="ca-row" style={{ gap: 28 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total no período</div>
              <Money value={periodTotal} size={24} />
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--ca-line-soft)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ticket médio</div>
              <Money value={periodAvgTicket} size={24} />
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--ca-line-soft)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mensagens</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 600, marginTop: 2 }}>{messageCount}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {goalGift ? (
            <div className="ca-card" style={{ padding: 22 }}>
              <div className="ca-row ca-row--between" style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600 }}>{goalGift.name}</div>
                <span className="ca-badge ca-badge--violet">{Math.round(goalPct * 100)}% atingida</span>
              </div>
              <div className="ca-row ca-row--gap" style={{ marginTop: 10 }}>
                <div style={{ position: 'relative' }}>
                  <Donut value={goalPct} size={100} stroke={10} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em' }}>{Math.round(goalPct * 100)}%</div>
                    <div style={{ fontSize: 10, color: 'var(--ca-muted)' }}>de {Number(goalGift.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Arrecadado</div>
                  <Money value={Number(goalGift.collected ?? 0)} size={22} />
                  <div style={{ fontSize: 12, color: 'var(--ca-muted)', marginTop: 2 }}>
                    Faltam <strong style={{ color: 'var(--ca-ink)' }}>{Math.max(0, Number(goalGift.value) - Number(goalGift.collected ?? 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                  <button onClick={() => onNavigate('gifts')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--ca-indigo)', fontWeight: 600, marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Ver detalhes <Icon.ArrowRight style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <KycStatusBig />
        </div>
      </div>

      <div className="ca-card" style={{ padding: 0, marginTop: 16, overflow: 'hidden' }}>
        <div className="ca-row ca-row--between" style={{ padding: '18px 22px 14px' }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600 }}>Contribuições recentes</div>
            <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 2 }}>Últimas pessoas que celebraram com você</div>
          </div>
        </div>

        <div className="cd-feed" style={{ padding: '0 14px 12px' }}>
          {feed.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ca-muted)', fontSize: 13 }}>
              Nenhuma contribuição ainda.
            </div>
          )}
          {feed.map((c: any, i: number) => {
            const guestName = c.guestName ?? 'Anônimo'
            const initials = nameInitials(guestName)
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const isPaid = c.status === 'confirmed'
            return (
              <div key={c.id} className="cd-feed__row">
                <span className="cd-feed__avatar" style={{ background: color }}>{initials}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="ca-row ca-row--gap-sm">
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{guestName}</span>
                    <span style={{ fontSize: 12, color: 'var(--ca-muted)' }}>·</span>
                    <span style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>{c.gift?.name ?? '—'}</span>
                  </div>
                  {c.message && (
                    <div style={{ fontSize: 12.5, color: 'var(--ca-ink-3)', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 460 }}>
                      "{c.message}"
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Money value={Number(c.amount)} size={15} />
                  <div style={{ fontSize: 11, color: 'var(--ca-muted-2)', marginTop: 2 }}>{fmtDate(c.createdAt)}</div>
                </div>
                <span className={'ca-badge ' + (isPaid ? 'ca-badge--success' : 'ca-badge--warn')}>
                  {isPaid
                    ? <><Icon.Check style={{ width: 11, height: 11 }} />Pago</>
                    : <><Icon.Loader style={{ width: 11, height: 11 }} />Aguardando</>}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
