import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { maskCPF } from '../lib/mask'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { isCheckoutPublishRedirect } from '../lib/builderDraft'

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '#94A3B8' }

  let points = 0
  if (password.length >= 8) points += 1
  if (password.length >= 12) points += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1
  if (/\d/.test(password)) points += 1
  if (/[^A-Za-z0-9]/.test(password)) points += 1

  if (points <= 2) return { score: 1, label: 'Fraca', color: '#EF4444' }
  if (points === 3) return { score: 2, label: 'Razoável', color: '#F59E0B' }
  if (points === 4) return { score: 3, label: 'Boa', color: '#9e68ba' }
  return { score: 4, label: 'Forte', color: '#805a7c' }
}

function RegisterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="register-shell auth-theme--celebre">
      {children}
    </div>
  )
}

function RegisterStepLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="register-main">
        <div className="register-main__inner">{children}</div>
      </div>
      <AuthVisualPanel />
    </>
  )
}

function RegisterError({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div style={{ color: '#EF4444', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
      {message}
      {children}
    </div>
  )
}

interface AccountFormState {
  name: string
  email: string
  cpf: string
  password: string
  confirmPassword: string
  terms: boolean
  showPass: boolean
  showConfirmPass: boolean
}

const initialAccountForm: AccountFormState = {
  name: '',
  email: '',
  cpf: '',
  password: '',
  confirmPassword: '',
  terms: false,
  showPass: false,
  showConfirmPass: false,
}

function StepAccount({
  form,
  setForm,
}: {
  form: AccountFormState
  setForm: React.Dispatch<React.SetStateAction<AccountFormState>>
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const redirect = searchParams.get('redirect')
  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : '/login'

  const { name, email, cpf, password, confirmPassword, terms, showPass, showConfirmPass } = form
  const strength = getPasswordStrength(password)
  const passwordsMatch = !confirmPassword || password === confirmPassword

  const updateForm = (patch: Partial<AccountFormState>) => {
    setForm(current => ({ ...current, ...patch }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name || !email || !cpf || !password || !confirmPassword) {
      setError('Preencha todos os campos')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    if (!terms) {
      setError('Aceite os termos para continuar')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.register({ name, email: email.trim().toLowerCase(), cpfCnpj: cpf, password })
      if (!res?.user) throw new Error('Resposta inválida ao criar conta')
      setUser(res.user)
      const publishFlow = isCheckoutPublishRedirect(redirect)
      const next = publishFlow && redirect
        ? redirect
        : redirect
          ? `/verificacao?redirect=${encodeURIComponent(redirect)}`
          : '/dashboard'
      navigate(next, { replace: true })
    } catch (err: any) {
      const message = err?.message || 'Erro ao criar conta'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const passwordToggle = (visible: boolean, onToggle: () => void) => (
    <button
      type="button"
      className="register-input-toggle"
      onClick={onToggle}
      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
    >
      <Icon.Eye style={{ width: 16, height: 16 }} />
    </button>
  )

  return (
    <RegisterStepLayout>
      <div className="register-form-logo">
        <AuthLogo size={17} />
      </div>
      <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Passo 1 · Crie sua conta</div>
      <h2 className="ca-display register-headline">Comece gratuitamente</h2>
      <p className="register-lead">Crie sua conta e monte sua página em minutos.</p>
      <p className="register-auth-switch">
        Já tem conta? <Link to={loginHref}>Entrar</Link>
      </p>

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="register-form__row register-form__row--full">
          <AuthField label="Nome completo">
            <AuthInput icon={<Icon.User style={{ width: 18, height: 18 }} />} type="text" placeholder="Seu nome" value={name} onChange={e => updateForm({ name: e.target.value })} autoComplete="name" />
          </AuthField>
        </div>

        <div className="register-form__row">
          <AuthField label="E-mail">
            <AuthInput icon={<Icon.Mail style={{ width: 18, height: 18 }} />} type="email" placeholder="seu@email.com" value={email} onChange={e => updateForm({ email: e.target.value })} autoComplete="email" />
          </AuthField>

          <AuthField label="CPF">
            <AuthInput icon={<Icon.Doc style={{ width: 18, height: 18 }} />} type="text" placeholder="000.000.000-00" value={cpf} onChange={e => updateForm({ cpf: maskCPF(e.target.value) })} autoComplete="off" inputMode="numeric" />
          </AuthField>
        </div>

        <div className="register-form__row">
          <AuthField label="Senha">
            <AuthInput
              icon={<Icon.Lock style={{ width: 18, height: 18 }} />}
              suffix={passwordToggle(showPass, () => updateForm({ showPass: !showPass }))}
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={e => updateForm({ password: e.target.value })}
              autoComplete="new-password"
            />
          </AuthField>

          <AuthField
            label="Confirmar senha"
            hint={confirmPassword && !passwordsMatch ? 'As senhas não coincidem' : undefined}
            hintTone={confirmPassword && !passwordsMatch ? 'err' : undefined}
          >
            <AuthInput
              icon={<Icon.Lock style={{ width: 18, height: 18 }} />}
              suffix={passwordToggle(showConfirmPass, () => updateForm({ showConfirmPass: !showConfirmPass }))}
              type={showConfirmPass ? 'text' : 'password'}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={e => updateForm({ confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
          </AuthField>
        </div>

        {password ? (
          <div className="register-form__strength" style={{ ['--strength-color' as string]: strength.color }}>
            <div className="register-form__strength-bars" aria-hidden="true">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className={i < strength.score ? 'is-on' : ''} />
              ))}
            </div>
            <div className="register-form__strength-label">{strength.label}</div>
          </div>
        ) : null}

        {error ? (
          <RegisterError message={error}>
            {error.toLowerCase().includes('e-mail') && (
              <>
                {' '}
                <Link to="/login" className="register-inline-link">Fazer login</Link>
              </>
            )}
          </RegisterError>
        ) : null}

        <div className="register-terms">
          <button
            type="button"
            className={'ca-check' + (terms ? ' ca-check--on' : '')}
            onClick={() => updateForm({ terms: !terms })}
            aria-pressed={terms}
          >
            <span className="ca-check__box">
              {terms && <Icon.Check style={{ width: 10, height: 10 }} />}
            </span>
          </button>
          <span className="register-terms__text">
            Aceito os{' '}
            <button type="button" className="register-inline-link register-inline-link--button">Termos de Uso</button>
            {' '}e a{' '}
            <button type="button" className="register-inline-link register-inline-link--button">Política de Privacidade</button>
          </span>
        </div>

        <AuthBtn type="submit" variant="primary" block size="lg" style={{ marginTop: 4 }} disabled={loading} iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}>
          {loading ? 'Criando conta...' : 'Continuar'}
        </AuthBtn>
      </form>
    </RegisterStepLayout>
  )
}

export function RegisterPage() {
  const [accountForm, setAccountForm] = useState<AccountFormState>(initialAccountForm)

  return (
    <div className="auth-page ca-root">
      <RegisterShell>
        <StepAccount
          form={accountForm}
          setForm={setAccountForm}
        />
      </RegisterShell>
    </div>
  )
}
