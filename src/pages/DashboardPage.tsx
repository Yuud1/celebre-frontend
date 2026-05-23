import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Icon } from '../components/auth/AuthIcons'
import '../styles/dash.css'

type ActivePage = 'dashboard' | 'gifts' | 'payouts' | 'customize'

// ─── Helpers ─────────────────────────────────────────────────
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
}
function Sidebar({ activePage, onNav }: SidebarProps) {
  type NavId = ActivePage | 'event' | 'contrib' | 'settings'
  const main: Array<{ id: NavId; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'dashboard', label: 'Dashboard',     icon: <Icon.Globe   style={{ width: 17, height: 17 }} /> },
    { id: 'event',     label: 'Meu evento',    icon: <Icon.Heart   style={{ width: 17, height: 17 }} /> },
    { id: 'gifts',     label: 'Presentes',     icon: <Icon.Sparkle style={{ width: 17, height: 17 }} />, count: 24 },
    { id: 'contrib',   label: 'Contribuições', icon: <Icon.Pix     style={{ width: 17, height: 17 }} />, count: 87 },
    { id: 'payouts',   label: 'Saques',        icon: <Icon.Bank    style={{ width: 17, height: 17 }} /> },
  ]
  const account: Array<{ id: NavId; label: string; icon: React.ReactNode }> = [
    { id: 'customize', label: 'Personalização', icon: <Icon.Camera style={{ width: 17, height: 17 }} /> },
    { id: 'settings',  label: 'Configurações',  icon: <Icon.User   style={{ width: 17, height: 17 }} /> },
  ]
  const navCls = (id: NavId) =>
    'cd-nav__item' + (id === activePage ? ' cd-nav__item--on' : '')
  const go = (id: NavId) => {
    if (id === 'dashboard' || id === 'gifts' || id === 'payouts' || id === 'customize') {
      onNav(id)
    }
  }

  return (
    <aside className="cd-side">
      <div className="cd-side__brand">
        <span className="ca-logo">
          <span className="ca-logo__mark" />
          celebre
        </span>
      </div>

      <div className="cd-switcher">
        <span className="cd-switcher__avatar">J&amp;M</span>
        <div className="cd-switcher__meta">
          <b>Júlia &amp; Marcos</b>
          <small>Casamento · 18 Out 2026</small>
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
          <span className="cd-user__avatar">JM</span>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ca-ink)' }}>Júlia Mendes</div>
            <div style={{ fontSize: 11.5, color: 'var(--ca-muted)' }}>julia@email.com</div>
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
function PageHead({ eyebrow, title, status, sub, actions }: PageHeadProps) {
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
const BAR_DATA: BarDatum[] = [
  { label: '05', value: 6 }, { label: '06', value: 8 }, { label: '07', value: 4 },
  { label: '08', value: 11 }, { label: '09', value: 14 }, { label: '10', value: 18, label2: 'pico' },
  { label: '11', value: 12 }, { label: '12', value: 9 }, { label: '13', value: 7 },
  { label: '14', value: 10 }, { label: '15', value: 13 }, { label: '16', value: 11 },
  { label: '17', value: 9 }, { label: '18', value: 5 },
]

const FEED = [
  { name: 'Mariana Castro',  initials: 'MC', color: 'linear-gradient(135deg,#F472B6,#A855F7)', gift: 'Lua de mel · Maldivas',  message: 'Que sejam mil dias de felicidade!',    amount: 750,  status: 'paid',    time: 'há 5 min' },
  { name: 'Rafael Antunes',  initials: 'RA', color: 'linear-gradient(135deg,#6366F1,#8B5CF6)', gift: 'Jantar romântico',       message: 'Vocês merecem o mundo todo ❤️',       amount: 250,  status: 'paid',    time: 'há 23 min' },
  { name: 'Letícia Souza',   initials: 'LS', color: 'linear-gradient(135deg,#34D399,#10B981)', gift: 'Cota livre',             message: 'Amo vocês! Que comece a nova fase.', amount: 500,  status: 'paid',    time: 'há 1h' },
  { name: 'Eduardo Lima',    initials: 'EL', color: 'linear-gradient(135deg,#FBBF24,#F97316)', gift: 'Conjunto de panelas',    message: 'Pra deixar a cozinha completa.',     amount: 380,  status: 'pending', time: 'há 2h' },
  { name: 'Camila Ferreira', initials: 'CF', color: 'linear-gradient(135deg,#60A5FA,#6366F1)', gift: 'Lua de mel · Maldivas',  message: 'Aproveitem cada momento.',           amount: 1200, status: 'paid',    time: 'há 3h' },
]

function DashHome() {
  return (
    <>
      <PageHead
        eyebrow="Visão geral · 01–18 Out 2026"
        title="Olá, Júlia 👋"
        status="published"
        sub="Faltam 12 dias para o grande dia. Sua página recebeu 8 novas contribuições nas últimas 24h."
        actions={
          <>
            <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Camera style={{ width: 15, height: 15 }} />
              Editar página
            </button>
            <button className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Link style={{ width: 15, height: 15 }} />
              Compartilhar evento
            </button>
          </>
        }
      />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={<Icon.Pix style={{ color: '#10B981' }} />} label="Total arrecadado" value={42380} currency delta="+24%" deltaTone="up" spark={[8, 12, 10, 18, 14, 22, 20, 28, 26, 34, 30, 38]} />
        <StatCard icon={<Icon.Heart style={{ color: '#EC4899' }} />} label="Contribuições" value="87" delta="+12" deltaTone="up" hint="Média R$ 487 por contribuição" />
        <StatCard icon={<Icon.Sparkle style={{ color: '#8B5CF6' }} />} label="Conversão da página" value="34%" delta="+3.2%" deltaTone="up" hint="1.420 visitas · 487 cliques" />
        <StatCard icon={<Icon.Bank style={{ color: '#6366F1' }} />} label="Saldo disponível" value={28940.50} currency delta="bloqueado" deltaTone="flat" hint="R$ 13.440 em análise" />
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
          <a style={{ fontSize: 13, color: 'var(--ca-indigo)', fontWeight: 600 }}>Ver todas (87) →</a>
        </div>

        <div className="cd-feed" style={{ padding: '0 14px 12px' }}>
          {FEED.map((c, i) => (
            <div key={i} className="cd-feed__row">
              <span className="cd-feed__avatar" style={{ background: c.color }}>{c.initials}</span>
              <div style={{ minWidth: 0 }}>
                <div className="ca-row ca-row--gap-sm">
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--ca-muted)' }}>·</span>
                  <span style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>{c.gift}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ca-ink-3)', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 460 }}>
                  "{c.message}"
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Money value={c.amount} size={15} />
                <div style={{ fontSize: 11, color: 'var(--ca-muted-2)', marginTop: 2 }}>{c.time}</div>
              </div>
              <span className={'ca-badge ' + (c.status === 'paid' ? 'ca-badge--success' : 'ca-badge--warn')}>
                {c.status === 'paid'
                  ? <><Icon.Check style={{ width: 11, height: 11 }} />Pago</>
                  : <><Icon.Loader style={{ width: 11, height: 11 }} />Aguardando</>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Gifts Page ───────────────────────────────────────────────
interface GiftData {
  title: string; type: 'collective' | 'fixed' | 'open'; image: string
  raised: number; goal: number | null; contributors: string[]; status?: 'purchased'
}
function GiftCardItem({ title, type, image, raised, goal, contributors, status }: GiftData) {
  const pct = goal ? Math.min(100, (raised / goal) * 100) : 100
  return (
    <div className="cd-gift">
      <div className={'cd-gift__image ' + image} style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span className="ca-badge" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ca-ink)' }}>
            {type === 'collective' ? 'Coletivo' : type === 'fixed' ? 'Fixo' : 'Livre'}
          </span>
          {status === 'purchased' && (
            <span className="ca-badge ca-badge--success">
              <Icon.Check style={{ width: 11, height: 11 }} />Quitado
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <button style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', color: 'var(--ca-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <Icon.Camera style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
      <div className="cd-gift__body">
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{title}</div>
        <div className="ca-row ca-row--between" style={{ marginTop: 12, marginBottom: 8 }}>
          <Money value={raised} size={17} />
          {goal && <span style={{ fontSize: 12, color: 'var(--ca-muted)', fontVariantNumeric: 'tabular-nums' }}>de R$ {goal.toLocaleString('pt-BR')}</span>}
        </div>
        <div className={'cd-progress' + (status === 'purchased' ? ' cd-progress--success' : '')}>
          <div className="cd-progress__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="ca-row ca-row--between" style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex' }}>
              {contributors.slice(0, 3).map((c, i) => (
                <span key={i} style={{ width: 22, height: 22, borderRadius: 999, background: c, marginLeft: i ? -6 : 0, border: '2px solid #fff' }} />
              ))}
              {contributors.length > 3 && (
                <span style={{ width: 22, height: 22, borderRadius: 999, background: '#F1F5F9', color: '#64748B', fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: -6, border: '2px solid #fff' }}>
                  +{contributors.length - 3}
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--ca-muted)' }}>{contributors.length} {contributors.length === 1 ? 'pessoa' : 'pessoas'}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: status === 'purchased' ? '#047857' : 'var(--ca-indigo)' }}>{Math.round(pct)}%</span>
        </div>
      </div>
    </div>
  )
}

const GIFTS: GiftData[] = [
  { title: 'Lua de mel · Maldivas', type: 'collective', image: 'ca-ph ca-ph--violet', raised: 8400, goal: 12000, contributors: ['#F472B6', '#A855F7', '#6366F1', '#34D399', '#FBBF24'] },
  { title: 'Jantar romântico',      type: 'fixed',      image: 'ca-ph',               raised: 250,  goal: 250,   contributors: ['#6366F1'], status: 'purchased' },
  { title: 'Conjunto de panelas',   type: 'fixed',      image: 'ca-ph ca-ph--dark',   raised: 380,  goal: 750,   contributors: ['#FBBF24', '#F472B6'] },
  { title: 'Cota livre',            type: 'open',       image: 'ca-ph ca-ph--violet', raised: 4250, goal: null,  contributors: ['#34D399', '#60A5FA', '#A855F7', '#F472B6', '#FBBF24', '#6366F1', '#EC4899'] },
  { title: 'Decoração do living',   type: 'collective', image: 'ca-ph',               raised: 1840, goal: 3500,  contributors: ['#A855F7', '#34D399', '#60A5FA'] },
  { title: 'Eletros da cozinha',    type: 'collective', image: 'ca-ph ca-ph--dark',   raised: 2980, goal: 4200,  contributors: ['#F472B6', '#FBBF24', '#6366F1', '#34D399'] },
]

function DashGifts() {
  return (
    <>
      <PageHead
        eyebrow="Catálogo do evento"
        title="Presentes"
        sub="24 presentes ativos · 8 totalmente quitados. Adicione, edite ou destaque os presentes que importam mais."
        actions={
          <>
            <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Eye style={{ width: 15, height: 15 }} />Ver página pública
            </button>
            <button className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Plus style={{ width: 16, height: 16 }} />Novo presente
            </button>
          </>
        }
      />

      <div className="ca-row ca-row--between" style={{ marginBottom: 18 }}>
        <div className="cd-tabs">
          <span className="cd-tab cd-tab--on">Todos · 24</span>
          <span className="cd-tab">Coletivos · 9</span>
          <span className="cd-tab">Fixos · 12</span>
          <span className="cd-tab">Livres · 3</span>
          <span className="cd-tab">Quitados · 8</span>
        </div>
        <div className="ca-row ca-row--gap-sm">
          <span style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>Ordenar por</span>
          <button className="ca-btn ca-btn--ghost" style={{ height: 36, fontSize: 13 }}>
            Mais arrecadado
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 13, height: 13 }}>
              <path d="M8 10l4 4 4-4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {GIFTS.map(g => <GiftCardItem key={g.title} {...g} />)}
        <button className="cd-gift" style={{ background: 'linear-gradient(180deg, #fff 0%, var(--ca-bg-soft) 100%)', border: '1.5px dashed var(--ca-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 340, padding: 28, textAlign: 'center' }}>
          <div>
            <span style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--ca-violet-100)', color: 'var(--ca-indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Icon.Plus style={{ width: 22, height: 22 }} />
            </span>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, marginTop: 12 }}>Adicionar presente</div>
            <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 4, maxWidth: 220 }}>
              Crie um presente coletivo, fixo ou cota livre.
            </div>
          </div>
        </button>
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

// ─── Personalize Page ─────────────────────────────────────────
const PALETTES = [
  ['#0F172A', '#6366F1'], ['#3F2A1D', '#B8543A'],
  ['#1F3D2C', '#5B8C5E'], ['#1E1B4B', '#A855F7'],
  ['#0C4A6E', '#0EA5E9'], ['#831843', '#EC4899'],
]
const FONTS = [
  { id: 'grotesk' as const, label: 'Geometric', sub: 'Space Grotesk',   family: 'Space Grotesk, sans-serif',      weight: 600 },
  { id: 'serif'   as const, label: 'Editorial', sub: 'Instrument Serif', family: 'Instrument Serif, Georgia, serif', weight: 400 },
  { id: 'sans'    as const, label: 'Modern',    sub: 'Inter',            family: 'Inter, sans-serif',               weight: 600 },
]

function Personalize() {
  const [tab, setTab] = useState<'design' | 'media' | 'template'>('design')
  const [colorIdx, setColorIdx] = useState(0)
  const [font, setFont] = useState<'grotesk' | 'serif' | 'sans'>('grotesk')

  const selectedFont = FONTS.find(f => f.id === font)!

  return (
    <>
      <PageHead
        eyebrow="Personalização"
        title="Sua página, do seu jeito"
        sub="Edite cores, tipografia e foto de capa em tempo real. As alterações aparecem instantaneamente para os seus convidados."
        actions={
          <>
            <button className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>Descartar alterações</button>
            <button className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13 }}>
              <Icon.Check style={{ width: 15, height: 15 }} />Publicar mudanças
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        {/* Controls */}
        <div className="ca-card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--ca-line-soft)' }}>
            {([
              { id: 'design',   label: 'Design',   icon: <Icon.Sparkle style={{ width: 14, height: 14 }} /> },
              { id: 'media',    label: 'Mídia',    icon: <Icon.Camera  style={{ width: 14, height: 14 }} /> },
              { id: 'template', label: 'Template', icon: <Icon.Doc     style={{ width: 14, height: 14 }} /> },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: tab === t.id ? 'var(--ca-ink)' : 'var(--ca-muted)', background: tab === t.id ? '#fff' : 'transparent', borderBottom: tab === t.id ? '2px solid var(--ca-indigo)' : '2px solid transparent', border: 'none', cursor: 'pointer' }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Palette */}
            <div>
              <div className="ca-row ca-row--between" style={{ marginBottom: 10 }}>
                <span className="ca-eyebrow">Paleta</span>
                <button style={{ fontSize: 12, color: 'var(--ca-indigo)', fontWeight: 600 }}>Custom</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {PALETTES.map((p, i) => (
                  <button key={i} onClick={() => setColorIdx(i)} className={'cd-swatch' + (colorIdx === i ? ' cd-swatch--on' : '')} style={{ background: `linear-gradient(135deg, ${p[0]} 50%, ${p[1]} 50%)` }} />
                ))}
              </div>
              <div className="ca-row" style={{ gap: 10, marginTop: 12, padding: '10px 12px', background: 'var(--ca-bg-soft)', borderRadius: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: PALETTES[colorIdx][0] }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ca-ink-3)' }}>{PALETTES[colorIdx][0]}</span>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: PALETTES[colorIdx][1], marginLeft: 'auto' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ca-ink-3)' }}>{PALETTES[colorIdx][1]}</span>
              </div>
            </div>

            {/* Typography */}
            <div>
              <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Tipografia</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {FONTS.map(f => (
                  <button key={f.id} onClick={() => setFont(f.id)} className={'ca-pick' + (font === f.id ? ' ca-pick--on' : '')} style={{ padding: 12, borderRadius: 10 }}>
                    {font === f.id && <span className="ca-pick__check" style={{ top: 10, right: 10, width: 18, height: 18 }}><Icon.Check style={{ width: 10, height: 10 }} /></span>}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontFamily: f.family, fontSize: 18, letterSpacing: '-0.02em', fontWeight: f.weight }}>Júlia &amp; Marcos</div>
                      <div style={{ fontSize: 11, color: 'var(--ca-muted)', marginTop: 2 }}>{f.label} · {f.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Density slider */}
            <div>
              <div className="ca-row ca-row--between" style={{ marginBottom: 8 }}>
                <span className="ca-eyebrow">Densidade</span>
                <span style={{ fontSize: 12, color: 'var(--ca-ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>1.4</span>
              </div>
              <div style={{ height: 26, display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'var(--ca-line)', borderRadius: 999 }} />
                <div style={{ position: 'absolute', left: 0, height: 4, width: '64%', background: 'var(--ca-grad)', borderRadius: 999 }} />
                <div style={{ position: 'absolute', left: '62%', width: 18, height: 18, borderRadius: 999, background: '#fff', border: '2px solid var(--ca-indigo)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }} />
              </div>
              <div className="ca-row ca-row--between" style={{ marginTop: 6, fontSize: 11, color: 'var(--ca-muted-2)' }}>
                <span>Compacto</span><span>Confortável</span><span>Espaçoso</span>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Mostrar contador regressivo', true], ['Permitir mensagens', true], ['Exibir lista de convidados', false]].map(([label, on]) => (
                <div key={String(label)} className="ca-row ca-row--between" style={{ padding: '10px 0', borderTop: '1px solid var(--ca-line-soft)' }}>
                  <span style={{ fontSize: 13 }}>{label}</span>
                  <span className={'cd-toggle' + (on ? ' cd-toggle--on' : '')}><span className="cd-toggle__thumb" /></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="ca-card" style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(180deg, #F1F5F9, #F8FAFC)', minHeight: 600 }}>
          <div className="ca-row ca-row--between" style={{ padding: '14px 18px', background: '#fff', borderBottom: '1px solid var(--ca-line-soft)' }}>
            <div className="cd-tabs">
              <span className="cd-tab cd-tab--on"><Icon.Globe style={{ width: 12, height: 12, marginRight: 4 }} />Desktop</span>
              <span className="cd-tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 12, height: 12, marginRight: 4 }}>
                  <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" strokeLinecap="round" />
                </svg>
                Mobile
              </span>
            </div>
            <div className="ca-row ca-row--gap-sm" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--ca-muted)' }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: '#10B981' }} />
              celebre.app/julia-e-marcos
            </div>
          </div>

          <div style={{ padding: 28, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 540, background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 50px rgba(15,23,42,0.10)', border: '1px solid var(--ca-line)' }}>
              <div style={{ height: 240, position: 'relative', background: `linear-gradient(135deg, ${PALETTES[colorIdx][0]} 0%, ${PALETTES[colorIdx][1]} 100%)` }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, color: '#fff' }}>
                  <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: '0.16em', textTransform: 'uppercase' }}>18 de Outubro · Florianópolis</div>
                  <div style={{ fontFamily: selectedFont.family, fontSize: 36, marginTop: 6, fontWeight: selectedFont.weight, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    Júlia &amp; Marcos
                  </div>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 11, color: 'var(--ca-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mensagem dos noivos</div>
                <p style={{ fontSize: 14, color: 'var(--ca-ink-3)', lineHeight: 1.65, marginTop: 8 }}>
                  Sua presença é o maior presente. Mas se quiser nos ajudar a começar essa nova fase, ficamos felizes com qualquer contribuição.
                </p>
                <button style={{ marginTop: 16, width: '100%', height: 44, borderRadius: 12, background: PALETTES[colorIdx][1], color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                  Contribuir com um presente
                </button>
                <div className="ca-row ca-row--between" style={{ marginTop: 22 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--ca-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Arrecadado</div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 18, marginTop: 2 }}>R$ 42.380</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--ca-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Convidados</div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 18, marginTop: 2 }}>128</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────
export function DashboardPage() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')

  return (
    <div style={{ position: 'fixed', inset: 0 }} className="ca-root">
      <div className="cd-shell">
        <Sidebar activePage={activePage} onNav={setActivePage} />
        <div className="cd-main">
          <Topbar />
          <div className="cd-page">
            {activePage === 'dashboard' && <DashHome />}
            {activePage === 'gifts'     && <DashGifts />}
            {activePage === 'payouts'   && <Saques />}
            {activePage === 'customize' && <Personalize />}
          </div>
        </div>
      </div>
    </div>
  )
}
