import React from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'success' | 'warn' | 'error' | 'violet' | 'default'

interface DashBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

export function DashBadge({ tone = 'default', className, children, ...rest }: DashBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
        tone === 'success' && 'bg-emerald-100 text-emerald-700',
        tone === 'warn'    && 'bg-amber-100 text-amber-700',
        tone === 'error'   && 'bg-red-100 text-red-700',
        tone === 'violet'  && 'bg-violet-100 text-violet-700',
        tone === 'default' && 'bg-slate-100 text-slate-700',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
