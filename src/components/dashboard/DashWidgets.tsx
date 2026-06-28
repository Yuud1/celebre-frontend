// Shared visual helpers for dashboard pages
import { cn } from '@/lib/utils'

export const AVATAR_COLORS = [
  'linear-gradient(135deg,#F472B6,#A855F7)',
  'linear-gradient(135deg,#6366F1,#8B5CF6)',
  'linear-gradient(135deg,#34D399,#10B981)',
  'linear-gradient(135deg,#FBBF24,#F97316)',
  'linear-gradient(135deg,#60A5FA,#6366F1)',
]

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function nameInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

export function fmtCurrencyInner(v: number) {
  const r = (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const [reais, cents] = r.split(',')
  return (
    <>
      <span className="text-[0.58em] text-slate-500 font-medium tracking-[0.02em]">R$</span>
      <span>{reais}</span>
      <span className="text-[0.55em] text-slate-500 ml-0.5">,{cents}</span>
    </>
  )
}

export function Money({ value, size }: { value: number; size: number }) {
  return (
    <div className="font-display font-semibold tracking-[-0.025em] tabular-nums inline-flex items-baseline gap-1" style={{ fontSize: size }}>
      {fmtCurrencyInner(value)}
    </div>
  )
}

export function Sparkline({ data, height = 36 }: { data: number[]; height?: number }) {
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

export function Donut({ value = 0.62, size = 110, stroke = 12 }: { value?: number; size?: number; stroke?: number }) {
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

export interface BarDatum { label: string; value: number; label2?: string }
export function BarChart({ data, height = 200 }: { data: BarDatum[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="flex items-end gap-2.5" style={{ height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = Math.max(6, (d.value / max) * (height - 30))
        const isPeak = d.value === max
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className={cn('text-[11px]', isPeak ? 'text-indigo-500 font-semibold' : 'text-slate-400 font-medium')} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {d.label2 ?? ''}
            </div>
            <div style={{
              width: '100%', height: h, borderRadius: 6,
              background: isPeak ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #A855F7 100%)' : '#EDE9FE',
              boxShadow: isPeak ? '0 4px 12px rgba(99,102,241,0.28)' : 'none',
            }} />
            <div className="text-[11px] text-slate-500">{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}

export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  currency?: boolean
  delta?: string
  deltaTone?: 'up' | 'down' | 'flat'
  spark?: number[]
  hint?: string
}
export function StatCard({ icon, label, value, currency = false, delta, deltaTone = 'up', spark, hint }: StatCardProps) {
  return (
    <div className="p-[20px_22px] bg-white border border-slate-200 rounded-2xl relative overflow-hidden transition-all hover:border-slate-300 hover:shadow-ca-md hover:-translate-y-px">
      <div className="flex items-center gap-2.5 text-[12.5px] text-slate-500 font-medium [&_svg]:w-[15px] [&_svg]:h-[15px]">
        {icon}
        <span>{label}</span>
        {delta && (
          <span className={cn(
            'ml-auto inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
            deltaTone === 'up'   && 'bg-emerald-50 text-emerald-700',
            deltaTone === 'down' && 'bg-red-50 text-red-700',
            deltaTone === 'flat' && 'bg-slate-50 text-slate-500',
          )}>
            {deltaTone === 'up' ? '▲' : deltaTone === 'down' ? '▼' : '·'} {delta}
          </span>
        )}
      </div>
      {currency ? (
        <div className="font-display font-semibold text-[30px] tracking-[-0.025em] mt-2.5 tabular-nums inline-flex items-baseline gap-1">
          {fmtCurrencyInner(value as number)}
        </div>
      ) : (
        <div className="font-display font-semibold text-[30px] tracking-[-0.025em] mt-2.5 tabular-nums">{value}</div>
      )}
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
      {spark && <div className="mt-3.5 h-9"><Sparkline data={spark} /></div>}
    </div>
  )
}
