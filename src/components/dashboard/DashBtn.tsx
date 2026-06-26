import React from 'react'
import { cn } from '@/lib/utils'

interface DashBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'lg'
  as?: React.ElementType
  href?: string
  target?: string
  rel?: string
}

export function DashBtn({
  variant = 'ghost',
  size = 'sm',
  className,
  children,
  as: As,
  ...rest
}: DashBtnProps) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-[10px] transition-all cursor-pointer border'
  const sizes = {
    sm: 'h-[38px] px-4 text-[13px]',
    lg: 'h-[50px] px-6 text-[15px]',
  }
  const variants = {
    primary: 'bg-ca-grad text-white border-transparent hover:brightness-105 shadow-[0_4px_14px_rgba(99,102,241,0.22)]',
    ghost:   'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  }
  const cls = cn(base, sizes[size], variants[variant], className)
  if (As) return <As className={cls} {...rest}>{children}</As>
  return <button className={cls} {...rest}>{children}</button>
}
