import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashPageHeaderProps {
  title: string
  onBack?: () => void
  right?: React.ReactNode
  border?: boolean
  titleColor?: string
  iconColor?: string
  iconBg?: string
  className?: string
}

export function DashPageHeader({
  title,
  onBack,
  right,
  border = false,
  titleColor = 'text-slate-900',
  iconColor = 'text-slate-600',
  iconBg = 'bg-slate-100 hover:bg-slate-200',
  className,
}: DashPageHeaderProps) {
  return (
    <div className={cn(
      'relative flex items-center',
      border && 'border-b border-slate-200 pb-3',
      className,
    )}>
      {/* Left: circular back button */}
      <div className="shrink-0 z-10">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Voltar"
            className={cn(
              'w-9 h-9 rounded-full inline-flex items-center justify-center border-0 cursor-pointer transition-colors',
              iconBg,
              iconColor,
            )}
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>

      {/* Title — absolutely centred regardless of left/right widths */}
      <span className={cn(
        'absolute inset-0 flex items-center justify-center pointer-events-none font-display font-semibold text-[16px] leading-none',
        titleColor,
      )}>
        {title}
      </span>

      {/* Right: optional slot */}
      <div className="ml-auto shrink-0 z-10 flex items-center">
        {right ?? <div className="w-9 h-9" />}
      </div>
    </div>
  )
}
