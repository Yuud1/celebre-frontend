import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { isCheckoutPublishRedirect } from '../lib/builderDraft'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const redirect = searchParams.get('redirect')
  const publishFlow = isCheckoutPublishRedirect(redirect)
  const registerHref = redirect
    ? `/criar-conta?redirect=${encodeURIComponent(redirect)}`
    : '/criar-conta'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return setError('Preencha e-mail e senha')
    setLoading(true)
    setError('')
    try {
      const { user } = await api.login({ email, password })
      setUser(user)
      const redirect = searchParams.get('redirect')
      if (publishFlow) {
        navigate(redirect ?? '/dashboard', { replace: true })
      } else if (user.kycStatus !== 'bank_configured') {
        const next = redirect ? `/verificacao?redirect=${encodeURIComponent(redirect)}` : '/verificacao'
        navigate(next, { replace: true })
      } else {
        navigate(redirect ?? '/dashboard', { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 overflow-auto grid nav:grid-cols-[1fr_1.05fr] min-h-dvh bg-white font-display">
      {/* Form column */}
      <div className="flex flex-col items-center justify-center px-[clamp(18px,4vw,52px)] py-[clamp(24px,5vw,48px)] overflow-y-auto bg-[#fffefe]">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-9">
            <AuthLogo size={18} />
            <div className="mt-7">
              <h1 className="font-display text-[28px] font-semibold tracking-tight text-slate-950 mb-2">
                {publishFlow ? 'Entre para publicar' : 'Bem-vindo de volta'}
              </h1>
              <p className="text-sm text-slate-500">
                Não tem conta?{' '}
                <Link to={registerHref} className="font-semibold text-indigo-600 hover:underline">
                  Criar gratuitamente
                </Link>
              </p>
            </div>
          </div>

          {/* Social login */}
          <div className="flex gap-2.5 mb-6">
            <AuthBtn variant="ghost" className="flex-1 border border-slate-200" icon={<Icon.Google style={{ width: 18, height: 18 }} />}>
              Google
            </AuthBtn>
            <AuthBtn variant="ghost" className="flex-1 border border-slate-200" icon={<Icon.Apple style={{ width: 18, height: 18 }} />}>
              Apple
            </AuthBtn>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3.5 mb-6 text-xs font-medium uppercase tracking-widest text-slate-400">
            <span className="flex-1 h-px bg-slate-200" />
            ou
            <span className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
            <AuthField label="E-mail">
              <AuthInput
                icon={<Icon.Mail style={{ width: 18, height: 18 }} />}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </AuthField>

            <AuthField label="Senha">
              <AuthInput
                icon={<Icon.Lock style={{ width: 18, height: 18 }} />}
                suffix={
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    <Icon.Eye style={{ width: 16, height: 16 }} />
                  </button>
                }
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </AuthField>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between -mt-1">
              <button
                type="button"
                className="inline-flex items-center gap-2.5 text-[13.5px] text-slate-700 cursor-pointer select-none"
                onClick={() => setRemember(v => !v)}
              >
                <span className={cn(
                  'w-[18px] h-[18px] rounded-[5px] border-[1.5px] bg-white inline-flex items-center justify-center transition-all flex-shrink-0',
                  remember ? 'bg-slate-950 border-slate-950 text-white' : 'border-slate-200 text-transparent',
                )}>
                  {remember && <Icon.Check style={{ width: 10, height: 10 }} />}
                </span>
                Lembrar de mim
              </button>
              <Link to="/esqueci-senha" className="text-[13.5px] font-medium text-indigo-600 hover:underline">
                Esqueci a senha
              </Link>
            </div>

            {error && (
              <div className="text-[13px] text-red-500 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <AuthBtn
              type="submit"
              variant="primary"
              block
              size="lg"
              className="mt-2"
              iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </AuthBtn>
          </form>

          {/* Trust footer */}
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {[
              { icon: <Icon.Shield style={{ width: 13, height: 13 }} />, text: 'SSL seguro' },
              { icon: <Icon.ShieldCheck style={{ width: 13, height: 13 }} />, text: 'LGPD' },
              { icon: <Icon.Check style={{ width: 13, height: 13 }} />, text: 'Dados protegidos' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-[5px] text-xs text-slate-400">
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AuthVisualPanel />
    </div>
  )
}
