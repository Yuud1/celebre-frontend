import React from 'react'
import { Icon } from './AuthIcons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─── Visual panel (right column) ────────────────────────────────────────────

export function AuthVisualPanel() {
  return (
    <aside className="relative min-h-full overflow-hidden bg-[#fffefe] hidden nav:block" aria-hidden="true">
      <img src="/login-bg.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
    </aside>
  )
}

// ─── Logo ────────────────────────────────────────────────────────────────────

export function AuthLogo({ invert = false, size = 18 }: { invert?: boolean; size?: number }) {
  return (
    <span className={cn('inline-flex items-center', invert && 'brightness-0 invert')}>
      <img
        src="/logo-html.png"
        alt="celebre"
        style={{ maxHeight: Math.round(size * 2.15) }}
      />
    </span>
  )
}

// ─── Button ──────────────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ink' | 'ghost' | 'soft'
  size?: 'md' | 'lg'
  block?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

export function AuthBtn({
  variant = 'primary',
  size = 'md',
  block,
  icon,
  iconRight,
  children,
  className,
  type = 'button',
  disabled,
  ...rest
}: BtnProps) {
  const shadcnVariant = variant === 'primary' ? 'default'
    : variant === 'ink'   ? 'secondary'
    : variant === 'ghost' ? 'outline'
    : 'ghost'

  return (
    <Button
      type={type}
      variant={shadcnVariant}
      disabled={disabled}
      className={cn(
        'font-display tracking-[-0.005em]',
        size === 'lg' && 'h-14 px-6 text-[15px] rounded-2xl',
        block && 'w-full',
        variant === 'primary' && 'bg-cl-grad hover:brightness-105 shadow-[0_8px_24px_rgba(99,102,241,0.28)]',
        variant === 'ink' && 'bg-slate-950 text-white hover:bg-black border-0',
        variant === 'soft' && 'bg-violet-50 text-indigo-600 hover:bg-violet-100 border-0',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </Button>
  )
}

// ─── Field + Input ───────────────────────────────────────────────────────────

export function AuthField({
  label,
  hint,
  hintTone,
  children,
}: {
  label?: string
  hint?: string
  hintTone?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label className="text-[13px] font-medium text-slate-700">{label}</Label>}
      {children}
      {hint && (
        <p className={cn(
          'text-xs tracking-[-0.005em]',
          hintTone === 'err' ? 'text-red-600' : hintTone === 'ok' ? 'text-emerald-600' : 'text-slate-400',
        )}>
          {hint}
        </p>
      )}
    </div>
  )
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  suffix?: React.ReactNode
  suffixPill?: boolean
}

export function AuthInput({ icon, suffix, suffixPill, className, ...rest }: AuthInputProps) {
  if (!icon && !suffix) {
    return (
      <Input
        className={cn(
          'h-[52px] px-4 text-[15px] font-medium rounded-xl border-slate-200',
          'focus-visible:ring-primary/20 focus-visible:border-primary',
          'placeholder:text-slate-400 placeholder:font-normal',
          className,
        )}
        {...rest}
      />
    )
  }

  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <Input
        className={cn(
          'h-[52px] text-[15px] font-medium rounded-xl border-slate-200',
          'focus-visible:ring-primary/20 focus-visible:border-primary',
          'placeholder:text-slate-400 placeholder:font-normal',
          icon   && 'pl-11',
          suffix && 'pr-28',
          className,
        )}
        {...rest}
      />
      {suffix && (
        <span className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500',
          suffixPill && 'h-8 px-2.5 bg-slate-50 rounded-lg',
        )}>
          {suffix}
        </span>
      )}
    </div>
  )
}

// ─── Step bar ────────────────────────────────────────────────────────────────

export function AuthStepBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i < current  ? 'bg-primary' :
            i === current ? 'bg-primary/40' :
            'bg-slate-200',
          )}
        />
      ))}
    </div>
  )
}

// ─── Step list ───────────────────────────────────────────────────────────────

export function AuthStepList({ items, current }: { items: string[]; current: number }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map((item, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div
            key={i}
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold',
              done   ? 'text-primary/60' :
              active ? 'text-primary' :
              'text-slate-400',
            )}
          >
            <span className={cn(
              'w-5 h-5 rounded-full border-2 inline-flex items-center justify-center text-[10px]',
              done   ? 'bg-primary border-primary text-white' :
              active ? 'border-primary text-primary' :
              'border-slate-200 text-slate-400',
            )}>
              {done ? <Icon.Check style={{ width: 10, height: 10 }} /> : (i + 1)}
            </span>
            <span>{item}</span>
          </div>
        )
      })}
    </div>
  )
}
