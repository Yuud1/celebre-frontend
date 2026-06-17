import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { isCheckoutPublishRedirect } from '../lib/builderDraft'

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
    <div className="auth-page ca-root login-page auth-theme--celebre">
      <div className="login-page__form">
        <div className="login-page__form-inner">
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <AuthLogo size={18} />
            <div style={{ marginTop: 28 }}>
              <h1 className="ca-display login-headline">
                {publishFlow ? 'Entre para publicar' : 'Bem-vindo de volta'}
              </h1>
              <p className="register-auth-switch">
                Não tem conta?{' '}
                <Link to={registerHref}>Criar gratuitamente</Link>
              </p>
            </div>
          </div>

          {/* Social login */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <AuthBtn variant="ghost" style={{ flex: 1 }} icon={<Icon.Google style={{ width: 18, height: 18 }} />}>
              Google
            </AuthBtn>
            <AuthBtn variant="ghost" style={{ flex: 1 }} icon={<Icon.Apple style={{ width: 18, height: 18 }} />}>
              Apple
            </AuthBtn>
          </div>

          <div className="ca-or" style={{ marginBottom: 24 }}>ou</div>

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleSubmit}>
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
                    className="register-input-toggle"
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
            <div className="ca-row ca-row--between" style={{ marginTop: -4 }}>
              <button
                type="button"
                className={'ca-check' + (remember ? ' ca-check--on' : '')}
                onClick={() => setRemember(v => !v)}
              >
                <span className="ca-check__box">
                  {remember && <Icon.Check style={{ width: 10, height: 10 }} />}
                </span>
                <span>Lembrar de mim</span>
              </button>
              <Link to="/esqueci-senha" className="login-forgot-link">Esqueci a senha</Link>
            </div>

            {error && <div style={{ color: '#EF4444', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>{error}</div>}

            <AuthBtn type="submit" variant="primary" block size="lg" style={{ marginTop: 8 }} iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}>
              {loading ? 'Entrando...' : 'Entrar'}
            </AuthBtn>
          </form>

          {/* Trust footer */}
          <div className="login-trust">
            {[
              { icon: <Icon.Shield style={{ width: 13, height: 13 }} />, text: 'SSL seguro' },
              { icon: <Icon.ShieldCheck style={{ width: 13, height: 13 }} />, text: 'LGPD' },
              { icon: <Icon.Check style={{ width: 13, height: 13 }} />, text: 'Dados protegidos' },
            ].map((item, i) => (
              <div key={i} className="login-trust__item">
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
