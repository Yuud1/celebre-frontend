import React from 'react'
import { Icon } from './AuthIcons'

export function AuthLogo({ invert = false, size = 18 }: { invert?: boolean; size?: number }) {
  return (
    <span className={'ca-logo' + (invert ? ' ca-logo--invert' : '')} style={{ fontSize: size }}>
      <span className="ca-logo__mark" style={{ width: Math.round(size * 1.55), height: Math.round(size * 1.55) }} />
      <span>celebre</span>
    </span>
  )
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ink' | 'ghost' | 'soft'
  size?: 'md' | 'lg'
  block?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}
export function AuthBtn({ variant = 'primary', size = 'md', block, icon, iconRight, children, className = '', style, ...rest }: BtnProps) {
  const cls = `ca-btn ca-btn--${variant}${size === 'lg' ? ' ca-btn--lg' : ''}${block ? ' ca-btn--block' : ''} ${className}`.trim()
  return <button className={cls} style={style} {...rest}>{icon}{children}{iconRight}</button>
}

export function AuthField({ label, hint, hintTone, children }: { label?: string; hint?: string; hintTone?: string; children: React.ReactNode }) {
  return (
    <label className="ca-field">
      {label && <span className="ca-label">{label}</span>}
      {children}
      {hint && <span className={'ca-hint' + (hintTone ? ' ca-hint--' + hintTone : '')}>{hint}</span>}
    </label>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  suffix?: React.ReactNode
  suffixPill?: boolean
}
export function AuthInput({ icon, suffix, suffixPill, ...rest }: InputProps) {
  const inputCls = ['ca-input', icon ? 'ca-input--has-icon' : '', suffix ? 'ca-input--has-suffix' : ''].filter(Boolean).join(' ')
  if (!icon && !suffix) return <input className={inputCls} {...rest} />
  return (
    <div className="ca-input-wrap">
      {icon && <span className="ca-input-wrap__icon">{icon}</span>}
      <input className={inputCls} {...rest} />
      {suffix && <span className={'ca-input-wrap__suffix' + (suffixPill ? ' ca-input-wrap__suffix--pill' : '')}>{suffix}</span>}
    </div>
  )
}

export function AuthStepBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="ca-stepbar">
      {Array.from({ length: total }).map((_, i) => {
        let cls = 'ca-stepbar__seg'
        if (i < current) cls += ' ca-stepbar__seg--done'
        else if (i === current) cls += ' ca-stepbar__seg--active'
        return <div key={i} className={cls} />
      })}
    </div>
  )
}

export function AuthStepList({ items, current }: { items: string[]; current: number }) {
  return (
    <div className="ca-steps">
      {items.map((item, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className={'ca-step' + (done ? ' ca-step--done' : active ? ' ca-step--active' : '')}>
            <span className="ca-step__dot">
              {done ? <Icon.Check style={{ width: 12, height: 12 }} /> : (i + 1)}
            </span>
            <span style={{ flex: 1 }}>{item}</span>
          </div>
        )
      })}
    </div>
  )
}
