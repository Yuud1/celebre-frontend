import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import type { ActivePage } from '../../pages/DashboardPage'
import { Money, StatCard, BarChart, Donut, AVATAR_COLORS, fmtDate, nameInitials } from './DashWidgets'

const BAR_DATA = [
  { label: '05', value: 6 }, { label: '06', value: 8 }, { label: '07', value: 4 },
  { label: '08', value: 11 }, { label: '09', value: 14 }, { label: '10', value: 18, label2: 'pico' },
  { label: '11', value: 12 }, { label: '12', value: 9 }, { label: '13', value: 7 },
  { label: '14', value: 10 }, { label: '15', value: 13 }, { label: '16', value: 11 },
  { label: '17', value: 9 }, { label: '18', value: 5 },
]

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

  const confirmed = contributions.filter((c: any) => c.status === 'confirmed')
  const totalCollected = confirmed.reduce((s: number, c: any) => s + Number(c.amount), 0)
  const confirmedCount = confirmed.length
  const avgTicket = confirmedCount > 0 ? totalCollected / confirmedCount : 0
  const feed = contributions.slice(0, 5)

  const eventStatus: 'published' | 'pending' | 'closed' =
    event?.status === 'published' ? 'published' :
    event?.status === 'closed' ? 'closed' : 'pending'

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={totalCollected} currency spark={[8, 12, 10, 18, 14, 22, 20, 28, 26, 34, 30, 38]} />
        <StatCard icon={<Icon.Heart style={{ color: '#EC4899' }} />} label="Contribuições" value={confirmedCount} hint={avgTicket > 0 ? `Média R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por contribuição` : undefined} />
        <StatCard icon={<Icon.Sparkle style={{ color: '#8B5CF6' }} />} label="Conversão da página" value="—" hint="Dados de visitas indisponíveis" />
        <StatCard icon={<Icon.Bank style={{ color: '#6366F1' }} />} label="Saldo disponível" value={0} currency delta="bloqueado" deltaTone="flat" hint="Configure saques via Asaas" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="ca-card" style={{ padding: 24 }}>
          <div className="ca-row ca-row--between" style={{ marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600 }}>Contribuições por dia</div>
              <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 2 }}>Últimos 14 dias · pico no fim de semana</div>
            </div>
            <div className="cd-tabs">
              <span className="cd-tab">7d</span>
              <span className="cd-tab cd-tab--on">14d</span>
              <span className="cd-tab">30d</span>
              <span className="cd-tab">Total</span>
            </div>
          </div>
          <BarChart height={210} data={BAR_DATA} />
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '20px 0 14px' }} />
          <div className="ca-row" style={{ gap: 28 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total no período</div>
              <Money value={18620} size={24} />
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--ca-line-soft)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ticket médio</div>
              <Money value={487} size={24} />
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--ca-line-soft)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Novas mensagens</div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 600, marginTop: 2 }}>32</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ca-card" style={{ padding: 22 }}>
            <div className="ca-row ca-row--between" style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600 }}>Meta da lua de mel</div>
              <span className="ca-badge ca-badge--violet">62% atingida</span>
            </div>
            <div className="ca-row ca-row--gap" style={{ marginTop: 10 }}>
              <div style={{ position: 'relative' }}>
                <Donut value={0.62} size={100} stroke={10} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em' }}>62%</div>
                  <div style={{ fontSize: 10, color: 'var(--ca-muted)' }}>de R$ 45k</div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Arrecadado</div>
                <Money value={27900} size={22} />
                <div style={{ fontSize: 12, color: 'var(--ca-muted)', marginTop: 2 }}>Faltam <strong style={{ color: 'var(--ca-ink)' }}>R$ 17.100</strong></div>
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--ca-indigo)', fontWeight: 600, marginTop: 10 }}>
                  Ver detalhes <Icon.ArrowRight style={{ width: 12, height: 12 }} />
                </a>
              </div>
            </div>
          </div>

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
