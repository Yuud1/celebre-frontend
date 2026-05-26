import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import { ImagePicker } from '../components/builder/ImagePicker'
import '../styles/dash.css'
import { Personalize } from '../components/dashboard/Personalize'

export type ActivePage = 'dashboard' | 'gifts' | 'contrib' | 'payouts' | 'customize'

// ─── Helpers ─────────────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,#F472B6,#A855F7)',
  'linear-gradient(135deg,#6366F1,#8B5CF6)',
  'linear-gradient(135deg,#34D399,#10B981)',
  'linear-gradient(135deg,#FBBF24,#F97316)',
  'linear-gradient(135deg,#60A5FA,#6366F1)',
]

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function nameInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Casamento',
  baby_shower: 'Chá de Bebê',
  housewarming: 'Chá de Casa Nova',
  birthday: 'Aniversário',
}

function fmtCurrencyInner(v: number) {
  const r = Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const [reais, cents] = r.split(',')
  return (
    <>
      <span className="cd-money__currency">R$</span>
      <span>{reais}</span>
      <span className="cd-money__cents">,{cents}</span>
    </>
  )
}

function Money({ value, size }: { value: number; size: number }) {
  return (
    <div className="cd-money" style={{ fontSize: size }}>
      {fmtCurrencyInner(value)}
    </div>
  )
}

// ─── Sparkline ────────────────────────────────────────────────
function Sparkline({ data, height = 36 }: { data: number[]; height?: number }) {
  const W = 160
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const stepX = W / (data.length - 1)
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2] as [number, number])
  const path = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
  const area = `${path} L ${W} ${height} L 0 ${height} Z`
  const [lastX, lastY] = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id="cd-spark-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d={area} fill="rgba(99,102,241,0.10)" />
      <path d={path} fill="none" stroke="url(#cd-spark-grad)" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r={3} fill="#fff" stroke="#6366F1" strokeWidth={2} />
    </svg>
  )
}

// ─── Donut ────────────────────────────────────────────────────
function Donut({ value = 0.62, size = 110, stroke = 12 }: { value?: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <defs>
        <linearGradient id="cd-donut-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F7" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#cd-donut-grad)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

// ─── Bar chart ────────────────────────────────────────────────
interface BarDatum { label: string; value: number; label2?: string }
function BarChart({ data, height = 200 }: { data: BarDatum[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = Math.max(6, (d.value / max) * (height - 30))
        const isPeak = d.value === max
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: isPeak ? '#6366F1' : 'var(--ca-muted-2)', fontWeight: isPeak ? 600 : 500, fontVariantNumeric: 'tabular-nums' }}>
              {d.label2 ?? ''}
            </div>
            <div style={{
              width: '100%', height: h, borderRadius: 6,
              background: isPeak ? 'var(--ca-grad)' : 'var(--ca-violet-100)',
              boxShadow: isPeak ? '0 4px 12px rgba(99,102,241,0.28)' : 'none',
            }} />
            <div style={{ fontSize: 11, color: 'var(--ca-muted)' }}>{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  currency?: boolean
  delta?: string
  deltaTone?: 'up' | 'down' | 'flat'
  spark?: number[]
  hint?: string
}
function StatCard({ icon, label, value, currency = false, delta, deltaTone = 'up', spark, hint }: StatCardProps) {
  return (
    <div className="cd-stat">
      <div className="cd-stat__top">
        {icon}
        <span>{label}</span>
        {delta && (
          <span className={'cd-stat__delta cd-stat__delta--' + deltaTone} style={{ marginLeft: 'auto' }}>
            {deltaTone === 'up' ? '▲' : deltaTone === 'down' ? '▼' : '·'} {delta}
          </span>
        )}
      </div>
      {currency ? (
        <div className="cd-stat__value" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
          {fmtCurrencyInner(value as number)}
        </div>
      ) : (
        <div className="cd-stat__value">{value}</div>
      )}
      {hint && <div style={{ fontSize: 12, color: 'var(--ca-muted)', marginTop: 4 }}>{hint}</div>}
      {spark && <div className="cd-stat__spark"><Sparkline data={spark} /></div>}
    </div>
  )
}

// ─── Sidebar KYC Widget ───────────────────────────────────────
function KycSidebarWidget() {
  const { user } = useAuth()
  
  if (user?.kycStatus === 'pix_configured') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
        <Icon.ShieldCheck style={{ width: 15, height: 15, color: '#10B981' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#047857' }}>Conta verificada</span>
      </div>
    )
  }

  return (
    <div className="cd-kyc">
      <div className="ca-row" style={{ gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(245,158,11,0.14)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon.Shield style={{ width: 16, height: 16 }} />
        </span>
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ca-ink)' }}>Falta a Chave PIX</div>
          <div style={{ fontSize: 11, color: 'var(--ca-muted)' }}>Configurar recebimento</div>
        </div>
      </div>
      <Link to="/verificacao" style={{ display: 'block', marginTop: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#fff', background: '#F59E0B', padding: '6px', borderRadius: 6, textDecoration: 'none' }}>
        Configurar agora
      </Link>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────
interface SidebarProps {
  activePage: ActivePage
  onNav: (p: ActivePage) => void
  event: any | null
  contribCount: number
  giftCount: number
}
function Sidebar({ activePage, onNav, event, contribCount, giftCount }: SidebarProps) {
  const { user } = useAuth()
  type NavId = ActivePage | 'event' | 'settings'
  const main: Array<{ id: NavId; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'dashboard', label: 'Dashboard',     icon: <Icon.Globe   style={{ width: 17, height: 17 }} /> },
    { id: 'event',     label: 'Meu evento',    icon: <Icon.Heart   style={{ width: 17, height: 17 }} /> },
    { id: 'gifts',     label: 'Presentes',     icon: <Icon.Sparkle style={{ width: 17, height: 17 }} />, count: giftCount || undefined },
    { id: 'contrib',   label: 'Contribuições', icon: <Icon.Pix     style={{ width: 17, height: 17 }} />, count: contribCount || undefined },
    { id: 'payouts',   label: 'Saques',        icon: <Icon.Bank    style={{ width: 17, height: 17 }} /> },
  ]
  const account: Array<{ id: NavId; label: string; icon: React.ReactNode }> = [
    { id: 'customize', label: 'Personalização', icon: <Icon.Camera style={{ width: 17, height: 17 }} /> },
    { id: 'settings',  label: 'Configurações',  icon: <Icon.User   style={{ width: 17, height: 17 }} /> },
  ]
  const navCls = (id: NavId) =>
    'cd-nav__item' + (id === activePage ? ' cd-nav__item--on' : '')
  const go = (id: NavId) => {
    if (id === 'dashboard' || id === 'gifts' || id === 'contrib' || id === 'payouts' || id === 'customize') {
      onNav(id)
    }
  }

  const eventName = event?.data?.name ?? '—'
  const eventTypeLabel = EVENT_TYPE_LABELS[event?.data?.eventType] ?? event?.data?.eventType ?? '—'
  const eventDate = fmtDate(event?.eventDate)
  const userInitials = nameInitials(user?.name)

  return (
    <aside className="cd-side">
      <div className="cd-side__brand">
        <span className="ca-logo">
          <span className="ca-logo__mark" />
          celebre
        </span>
      </div>

      <div className="cd-switcher">
        <span className="cd-switcher__avatar">{userInitials}</span>
        <div className="cd-switcher__meta">
          <b>{eventName}</b>
          <small>{eventTypeLabel} · {eventDate}</small>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14, color: 'var(--ca-muted-2)', flexShrink: 0 }}>
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="cd-section">
        <div className="cd-section__label">Geral</div>
        <nav className="cd-nav">
          {main.map(it => (
            <a key={it.id} className={navCls(it.id)} onClick={() => go(it.id)}>
              {it.icon}
              <span>{it.label}</span>
              {it.count != null && <span className="cd-nav__count">{it.count}</span>}
            </a>
          ))}
        </nav>
      </div>

      <div className="cd-section">
        <div className="cd-section__label">Conta</div>
        <nav className="cd-nav">
          {account.map(it => (
            <a key={it.id} className={navCls(it.id)} onClick={() => go(it.id)}>
              {it.icon}
              <span>{it.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="cd-side__footer">
        <KycSidebarWidget />
        <div className="cd-user" style={{ marginTop: 10 }}>
          <span className="cd-user__avatar">{userInitials}</span>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ca-ink)' }}>{user?.name ?? '—'}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ca-muted)' }}>{user?.email ?? '—'}</div>
          </div>
          <Icon.ArrowRight style={{ width: 14, height: 14, color: 'var(--ca-muted-2)' }} />
        </div>
      </div>
    </aside>
  )
}

// ─── Topbar ───────────────────────────────────────────────────
function Topbar() {
  return (
    <div className="cd-top">
      <div className="cd-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" strokeLinecap="round" />
        </svg>
        Buscar presentes, contribuições, pessoas…
        <span className="cd-search__kbd">⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      <a className="ca-row ca-row--gap-sm" style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--ca-bg-soft)', border: '1px solid var(--ca-line)', fontSize: 12.5, color: 'var(--ca-ink-3)', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}>
        <Icon.Globe style={{ width: 14, height: 14, color: 'var(--ca-muted)' }} />
        celebre.app/julia-e-marcos
        <Icon.Link style={{ width: 13, height: 13, color: 'var(--ca-muted-2)', marginLeft: 4 }} />
      </a>

      <button className="cd-top__icon-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 17, height: 17 }}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" strokeLinejoin="round" />
          <path d="M10 21h4" strokeLinecap="round" />
        </svg>
        <span className="cd-top__dot" />
      </button>

      <button className="cd-top__icon-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v3M12 20v3M4 12H1M23 12h-3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
        </svg>
      </button>

      <span style={{ width: 1, height: 26, background: 'var(--ca-line)' }} />

      <span className="cd-user__avatar" style={{ width: 32, height: 32, fontSize: 13 }}>JM</span>
    </div>
  )
}

// ─── Page head ────────────────────────────────────────────────
interface PageHeadProps {
  eyebrow?: string
  title: string
  status?: 'published' | 'pending' | 'closed'
  sub?: string
  actions?: React.ReactNode
}
export function PageHead({ eyebrow, title, status, sub, actions }: PageHeadProps) {
  const statuses = {
    published: { c: '#047857', bg: 'rgba(16,185,129,0.10)', dot: '#10B981', label: 'Publicado' },
    pending:   { c: '#B45309', bg: 'rgba(245,158,11,0.10)', dot: '#F59E0B', label: 'Aguardando verificação' },
    closed:    { c: '#475569', bg: 'var(--ca-bg-soft)',     dot: '#94A3B8', label: 'Encerrado' },
  }
  const s = status ? statuses[status] : null
  return (
    <div className="cd-page__head">
      <div>
        {eyebrow && <span className="ca-eyebrow">{eyebrow}</span>}
        <div className="ca-row ca-row--gap" style={{ marginTop: 8 }}>
          <h1 className="ca-display" style={{ fontSize: 30, margin: 0, letterSpacing: '-0.025em' }}>{title}</h1>
          {s && (
            <span className="ca-badge" style={{ background: s.bg, color: s.c, borderColor: s.bg, marginLeft: 4, alignSelf: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
              {s.label}
            </span>
          )}
        </div>
        {sub && <p style={{ color: 'var(--ca-muted)', fontSize: 14, margin: '6px 0 0', maxWidth: 540 }}>{sub}</p>}
      </div>
      {actions && <div className="ca-row ca-row--gap">{actions}</div>}
    </div>
  )
}

// ─── KYC Status Big (in home page) ───────────────────────────
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

// ─── Dashboard Home ───────────────────────────────────────────
interface DashHomeProps { event: any | null; contributions: any[]; onNavigate: (p: ActivePage) => void }

const BAR_DATA: BarDatum[] = [
  { label: '05', value: 6 }, { label: '06', value: 8 }, { label: '07', value: 4 },
  { label: '08', value: 11 }, { label: '09', value: 14 }, { label: '10', value: 18, label2: 'pico' },
  { label: '11', value: 12 }, { label: '12', value: 9 }, { label: '13', value: 7 },
  { label: '14', value: 10 }, { label: '15', value: 13 }, { label: '16', value: 11 },
  { label: '17', value: 9 }, { label: '18', value: 5 },
]

function DashHome({ event, contributions, onNavigate }: DashHomeProps) {
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

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={totalCollected} currency spark={[8, 12, 10, 18, 14, 22, 20, 28, 26, 34, 30, 38]} />
        <StatCard icon={<Icon.Heart style={{ color: '#EC4899' }} />} label="Contribuições" value={confirmedCount} hint={avgTicket > 0 ? `Média R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por contribuição` : undefined} />
        <StatCard icon={<Icon.Sparkle style={{ color: '#8B5CF6' }} />} label="Conversão da página" value="—" hint="Dados de visitas indisponíveis" />
        <StatCard icon={<Icon.Bank style={{ color: '#6366F1' }} />} label="Saldo disponível" value={0} currency delta="bloqueado" deltaTone="flat" hint="Configure saques via Asaas" />
      </div>

      {/* Mid row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
        {/* Chart card */}
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

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Goal donut */}
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

      {/* Contributions feed */}
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

// ─── Gifts Page ───────────────────────────────────────────────
interface GiftCardItemProps {
  gift: any
  eventId: string
  onDelete: (giftId: string) => void
}
function GiftCardItem({ gift, eventId: _eventId, onDelete }: GiftCardItemProps) {
  const isFixed = gift.type === 'fixed'
  const isPurchased = gift.isPurchased
  const collected = Number(gift.collected ?? 0)
  const goal = Number(gift.value ?? 0)
  const pct = isFixed
    ? (isPurchased ? 100 : 0)
    : (goal > 0 ? Math.min(100, (collected / goal) * 100) : 0)
  const typeLabel = gift.type === 'fixed' ? 'Fixo' : 'Coletivo'

  return (
    <div className="cd-gift">
      <div className="cd-gift__image ca-ph" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span className="ca-badge" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ca-ink)' }}>
            {typeLabel}
          </span>
          {isPurchased && (
            <span className="ca-badge ca-badge--success">
              <Icon.Check style={{ width: 11, height: 11 }} />Quitado
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <button onClick={() => onDelete(gift.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', color: '#EF4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14 }}>
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="cd-gift__body">
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{gift.name}</div>
        <div className="ca-row ca-row--between" style={{ marginTop: 12, marginBottom: 8 }}>
          <Money value={isFixed ? (isPurchased ? goal : 0) : collected} size={17} />
          {goal > 0 && <span style={{ fontSize: 12, color: 'var(--ca-muted)', fontVariantNumeric: 'tabular-nums' }}>de R$ {goal.toLocaleString('pt-BR')}</span>}
        </div>
        <div className={'cd-progress' + (isPurchased ? ' cd-progress--success' : '')}>
          <div className="cd-progress__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="ca-row ca-row--between" style={{ marginTop: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--ca-muted)' }}>{isFixed ? (isPurchased ? 'Quitado' : 'Não quitado') : `${Math.round(pct)}% arrecadado`}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPurchased ? '#047857' : 'var(--ca-indigo)' }}>{Math.round(pct)}%</span>
        </div>
      </div>
    </div>
  )
}

interface DashGiftsProps { event: any | null; onReload: () => void }
function DashGifts({ event, onReload }: DashGiftsProps) {
  const gifts: any[] = event?.gifts ?? []

  const handleDelete = async (giftId: string) => {
    if (!event?.id) return
    if (!window.confirm('Remover este presente?')) return
    try {
      await api.deleteGift(event.id, giftId)
      onReload()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Catálogo do evento"
        title="Presentes"
        sub={`${gifts.length} presente${gifts.length !== 1 ? 's' : ''} cadastrado${gifts.length !== 1 ? 's' : ''}. Adicione, edite ou remova presentes.`}
        actions={
          <>
            {event?.slug && (
              <a href={`/p/${event.slug}`} target="_blank" rel="noreferrer" className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon.Eye style={{ width: 15, height: 15 }} />Ver página pública
              </a>
            )}
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {gifts.map((g: any) => (
          <GiftCardItem key={g.id} gift={g} eventId={event?.id ?? ''} onDelete={handleDelete} />
        ))}
        {gifts.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: 'var(--ca-muted)', fontSize: 14 }}>
            Nenhum presente cadastrado. Os presentes são adicionados na criação do evento.
          </div>
        )}
      </div>
    </>
  )
}

// ─── Saques Page ──────────────────────────────────────────────
const HISTORY = [
  { date: '14 Out · 18:42', desc: 'Saque PIX · Banco Inter',     method: 'PIX · CPF ···0-00',   amount: -3200, status: 'paid'    },
  { date: '13 Out · 09:15', desc: 'Repasse automático',           method: 'PIX · CPF ···0-00',   amount: -1750, status: 'paid'    },
  { date: '12 Out · 22:08', desc: 'Contribuição · Camila F.',     method: 'Pix recebido',         amount:  1200, status: 'in'      },
  { date: '12 Out · 11:30', desc: 'Saque PIX · Banco Inter',     method: 'PIX · CPF ···0-00',   amount: -2400, status: 'paid'    },
  { date: '11 Out · 19:55', desc: 'Contribuição · Letícia S.',    method: 'Cartão · final 4242', amount:   500, status: 'in'      },
  { date: '10 Out · 14:23', desc: 'Saque PIX · Banco Inter',     method: 'PIX · CPF ···0-00',   amount: -1860, status: 'pending' },
]

function Saques() {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16 }}>
        {/* Hero balance */}
        <div className="ca-card" style={{ padding: 28, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)', borderColor: '#1E1B4B', color: '#fff' }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', top: -100, right: -80, background: 'radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', bottom: -80, left: -40, background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', filter: 'blur(20px)' }} />
          <div style={{ position: 'relative' }}>
            <div className="ca-row ca-row--gap-sm" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5 }}>
              <Icon.Pix style={{ width: 14, height: 14, color: '#A5B4FC' }} />
              Saldo disponível para saque
            </div>
            <div className="cd-money" style={{ fontSize: 44, color: '#fff', marginTop: 10 }}>
              {fmtCurrencyInner(28940.50)}
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>
              Atualizado <span className="ca-mono">há 12 segundos</span> · Chave PIX <strong style={{ color: '#fff' }}>CPF ··· 0-00</strong>
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

        {/* Pending */}
        <div className="ca-card" style={{ padding: 22 }}>
          <div className="ca-row ca-row--between">
            <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
              <Icon.Loader style={{ width: 14, height: 14, color: '#F59E0B' }} />Saldo em análise
            </div>
            <span className="ca-badge ca-badge--warn">3 contribuições</span>
          </div>
          <Money value={2780} size={28} />
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 6, lineHeight: 1.5 }}>
            Análise antifraude · disponível em até <strong style={{ color: 'var(--ca-ink)' }}>48h</strong>.
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '14px 0' }} />
          <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12, color: 'var(--ca-muted)' }}>
            <Icon.Info style={{ width: 13, height: 13 }} />
            Contribuições acima de R$ 500 passam por revisão automática.
          </div>
        </div>

        {/* Transferred */}
        <div className="ca-card" style={{ padding: 22 }}>
          <div className="ca-row ca-row--between">
            <div className="ca-row ca-row--gap-sm" style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
              <Icon.Check style={{ width: 14, height: 14, color: '#10B981' }} />Já transferido
            </div>
            <span className="ca-badge ca-badge--success">+12% mês</span>
          </div>
          <Money value={10660} size={28} />
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 6 }}>6 saques · último em 14/10</div>
          <hr style={{ border: 0, borderTop: '1px solid var(--ca-line-soft)', margin: '14px 0' }} />
          <div style={{ height: 36 }}><Sparkline data={[2, 4, 3, 6, 5, 8, 7, 10, 9, 12]} /></div>
        </div>
      </div>

      {/* History */}
      <div className="ca-card" style={{ padding: 0, marginTop: 16, overflow: 'hidden' }}>
        <div className="ca-row ca-row--between" style={{ padding: '18px 22px 14px' }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600 }}>Histórico de transferências</div>
            <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 2 }}>Todas as movimentações da sua conta de pagamento</div>
          </div>
          <div className="cd-tabs">
            <span className="cd-tab cd-tab--on">Todos</span>
            <span className="cd-tab">Saques</span>
            <span className="cd-tab">Recebimentos</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--ca-line-soft)' }}>
          <div style={{ padding: '10px 22px', fontSize: 11, color: 'var(--ca-muted-2)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ca-bg-soft)', borderBottom: '1px solid var(--ca-line-soft)', display: 'grid', gridTemplateColumns: '160px 1fr 1fr 140px 120px 80px' }}>
            <span>Data</span><span>Descrição</span><span>Método</span><span style={{ textAlign: 'right' }}>Valor</span><span>Status</span><span />
          </div>
          {HISTORY.map((r, i) => (
            <div key={i} style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '160px 1fr 1fr 140px 120px 80px', borderBottom: '1px solid var(--ca-line-soft)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{r.date}</span>
              <span style={{ fontWeight: 500 }}>{r.desc}</span>
              <span style={{ color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{r.method}</span>
              <span style={{ textAlign: 'right', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: r.amount > 0 ? '#047857' : 'var(--ca-ink)' }}>
                {r.amount > 0 ? '+' : '−'} R$ {Math.abs(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span>
                {r.status === 'paid'    && <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 10, height: 10 }} />Concluído</span>}
                {r.status === 'pending' && <span className="ca-badge ca-badge--warn"><Icon.Loader style={{ width: 10, height: 10 }} />Processando</span>}
                {r.status === 'in'      && <span className="ca-badge"><Icon.ArrowLeft style={{ width: 10, height: 10, transform: 'rotate(-45deg)' }} />Recebido</span>}
              </span>
              <button style={{ fontSize: 12, color: 'var(--ca-indigo)', fontWeight: 600, textAlign: 'right' }}>Recibo</button>
            </div>
          ))}
        </div>
      </div>

      {/* Trust strip */}
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



// ─── Contributions Page ───────────────────────────────────────
function DashContributions({ contributions }: { contributions: any[] }) {
  const confirmed = contributions.filter((c: any) => c.status === 'confirmed')
  const total = confirmed.reduce((s: number, c: any) => s + Number(c.amount), 0)

  return (
    <>
      <PageHead
        eyebrow="Pagamentos"
        title="Contribuições"
        sub={`${contributions.length} contribuição${contributions.length !== 1 ? 'ões' : ''} · ${confirmed.length} confirmada${confirmed.length !== 1 ? 's' : ''}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={total} currency />
        <StatCard icon={<Icon.Check style={{ color: '#10B981' }} />} label="Confirmadas" value={confirmed.length} />
        <StatCard icon={<Icon.Loader style={{ color: '#F59E0B' }} />} label="Pendentes" value={contributions.length - confirmed.length} />
      </div>

      <div className="ca-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 22px', fontSize: 11, color: 'var(--ca-muted-2)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ca-bg-soft)', borderBottom: '1px solid var(--ca-line-soft)', display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 120px' }}>
          <span>Convidado</span><span>Presente</span><span style={{ textAlign: 'right' }}>Valor</span><span>Método</span><span>Status</span>
        </div>
        {contributions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ca-muted)', fontSize: 13 }}>
            Nenhuma contribuição ainda.
          </div>
        )}
        {contributions.map((c: any, i: number) => {
          const isPaid = c.status === 'confirmed'
          return (
            <div key={c.id} style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 140px 120px 120px', borderBottom: i < contributions.length - 1 ? '1px solid var(--ca-line-soft)' : 'none', alignItems: 'center', fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{c.guestName ?? 'Anônimo'}</span>
              <span style={{ color: 'var(--ca-muted)' }}>{c.gift?.name ?? '—'}</span>
              <span style={{ textAlign: 'right', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                R$ {Number(c.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: 12, color: 'var(--ca-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {c.paymentMethod === 'pix' ? 'PIX' : c.paymentMethod === 'credit_card' ? 'Cartão' : c.paymentMethod ?? '—'}
              </span>
              <span>
                {isPaid
                  ? <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 10, height: 10 }} />Confirmado</span>
                  : <span className="ca-badge ca-badge--warn"><Icon.Loader style={{ width: 10, height: 10 }} />Pendente</span>}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─── Empty State ──────────────────────────────────────────────
function NoEventState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 48, textAlign: 'center' }}>
      <span style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--ca-violet-100)', color: 'var(--ca-indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Icon.Sparkle style={{ width: 28, height: 28 }} />
      </span>
      <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>
        Você ainda não tem nenhum evento publicado
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ca-muted)', maxWidth: 380, marginBottom: 24 }}>
        Crie seu evento, adicione presentes e compartilhe com seus convidados.
      </p>
      <Link to="/criar" className="ca-btn ca-btn--primary" style={{ height: 44, padding: '0 24px', fontSize: 14 }}>
        Criar meu primeiro evento
      </Link>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────
export function DashboardPage() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [event, setEvent] = useState<any | null>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [noEvent, setNoEvent] = useState(false)

  const loadData = async () => {
    try {
      const events = await api.listEvents()
      if (events.length === 0) {
        setNoEvent(true)
        setLoading(false)
        return
      }
      const firstId = events[0].id
      const [ev, contrib] = await Promise.all([
        api.getEvent(firstId),
        api.getEventContributions(firstId),
      ])
      setEvent(ev)
      setContributions(contrib)
      setNoEvent(false)
    } catch {
      // silently fail — user sees empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const confirmedContrib = contributions.filter((c: any) => c.status === 'confirmed')

  return (
    <div style={{ position: 'fixed', inset: 0 }} className="ca-root">
      <div className="cd-shell">
        <Sidebar
          activePage={activePage}
          onNav={setActivePage}
          event={event}
          contribCount={confirmedContrib.length}
          giftCount={event?.gifts?.length ?? 0}
        />
        <div className="cd-main">
          <Topbar />
          <div className="cd-page">
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--ca-muted)', fontSize: 14 }}>
                Carregando…
              </div>
            )}
            {!loading && noEvent && <NoEventState />}
            {!loading && !noEvent && (
              <>
                {activePage === 'dashboard' && <DashHome event={event} contributions={contributions} onNavigate={setActivePage} />}
                {activePage === 'gifts'     && <DashGifts event={event} onReload={loadData} />}
                {activePage === 'contrib'   && <DashContributions contributions={contributions} />}
                {activePage === 'payouts'   && <Saques />}
                {activePage === 'customize' && <Personalize event={event} onReload={loadData} onNavigate={setActivePage} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
