import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { maskCPF } from '../lib/mask'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { isCheckoutPublishRedirect } from '../lib/builderDraft'
import { cn } from '@/lib/utils'

// ─── Password strength ───────────────────────────────────────────────────────

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '#94A3B8' }
  let points = 0
  if (password.length >= 8)  points += 1
  if (password.length >= 12) points += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1
  if (/\d/.test(password))            points += 1
  if (/[^A-Za-z0-9]/.test(password)) points += 1
  if (points <= 2) return { score: 1, label: 'Fraca',    color: '#EF4444' }
  if (points === 3) return { score: 2, label: 'Razoável', color: '#F59E0B' }
  if (points === 4) return { score: 3, label: 'Boa',      color: '#9e68ba' }
  return                     { score: 4, label: 'Forte',   color: '#805a7c' }
}

// ─── Shared layout ───────────────────────────────────────────────────────────

function RegisterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-auto grid nav:grid-cols-[1fr_1.05fr] min-h-dvh bg-white font-display">
      {children}
    </div>
  )
}

function RegisterStepLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col overflow-y-auto bg-[#fffefe]">
        <div className="flex-1 flex flex-col justify-center px-[clamp(18px,4vw,52px)] py-10">
          <div className="w-full max-w-[440px] mx-auto">
            {children}
          </div>
        </div>
      </div>
      <AuthVisualPanel />
    </>
  )
}

function RegisterError({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="text-[13px] text-red-500 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
      {message}{children}
    </div>
  )
}

// ─── Account form state ──────────────────────────────────────────────────────

interface AccountFormState {
  name: string; email: string; cpf: string
  password: string; confirmPassword: string
  terms: boolean; showPass: boolean; showConfirmPass: boolean
}

const initialAccountForm: AccountFormState = {
  name: '', email: '', cpf: '', password: '', confirmPassword: '',
  terms: false, showPass: false, showConfirmPass: false,
}

// ─── Step 1: Account ─────────────────────────────────────────────────────────

function StepAccount({ form, setForm }: {
  form: AccountFormState
  setForm: React.Dispatch<React.SetStateAction<AccountFormState>>
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const redirect = searchParams.get('redirect')
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'

  const { name, email, cpf, password, confirmPassword, terms, showPass, showConfirmPass } = form
  const strength = getPasswordStrength(password)
  const passwordsMatch = !confirmPassword || password === confirmPassword

  const updateForm = (patch: Partial<AccountFormState>) =>
    setForm(current => ({ ...current, ...patch }))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name || !email || !cpf || !password || !confirmPassword) return setError('Preencha todos os campos')
    if (password.length < 8)          return setError('A senha deve ter pelo menos 8 caracteres')
    if (password !== confirmPassword)  return setError('As senhas não coincidem')
    if (!terms)                        return setError('Aceite os termos para continuar')

    setLoading(true)
    setError('')
    try {
      const res = await api.register({ name, email: email.trim().toLowerCase(), cpfCnpj: cpf, password })
      if (!res?.user) throw new Error('Resposta inválida ao criar conta')
      setUser(res.user)
      const publishFlow = isCheckoutPublishRedirect(redirect)
      const next = publishFlow && redirect
        ? redirect
        : redirect ? `/verificacao?redirect=${encodeURIComponent(redirect)}` : '/dashboard'
      navigate(next, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const passwordToggle = (visible: boolean, onToggle: () => void) => (
    <button
      type="button"
      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
      onClick={onToggle}
      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
    >
      <Icon.Eye style={{ width: 16, height: 16 }} />
    </button>
  )

  return (
    <RegisterStepLayout>
      <div className="mb-1">
        <AuthLogo size={17} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mt-5 mb-2.5">
        Passo 1 · Crie sua conta
      </p>
      <h2 className="font-display text-[26px] font-semibold tracking-tight text-slate-950 mb-1">
        Comece gratuitamente
      </h2>
      <p className="text-sm text-slate-500 mb-1">
        Crie sua conta e monte sua página em minutos.
      </p>
      <p className="text-sm text-slate-500 mb-6">
        Já tem conta?{' '}
        <Link to={loginHref} className="font-semibold text-indigo-600 hover:underline">Entrar</Link>
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <AuthField label="Nome completo">
          <AuthInput
            icon={<Icon.User style={{ width: 18, height: 18 }} />}
            type="text" placeholder="Seu nome"
            value={name} onChange={e => updateForm({ name: e.target.value })}
            autoComplete="name"
          />
        </AuthField>

        <div className="grid grid-cols-1 nav:grid-cols-2 gap-4">
          <AuthField label="E-mail">
            <AuthInput
              icon={<Icon.Mail style={{ width: 18, height: 18 }} />}
              type="email" placeholder="seu@email.com"
              value={email} onChange={e => updateForm({ email: e.target.value })}
              autoComplete="email"
            />
          </AuthField>
          <AuthField label="CPF">
            <AuthInput
              icon={<Icon.Doc style={{ width: 18, height: 18 }} />}
              type="text" placeholder="000.000.000-00"
              value={cpf} onChange={e => updateForm({ cpf: maskCPF(e.target.value) })}
              autoComplete="off" inputMode="numeric"
            />
          </AuthField>
        </div>

        <div className="grid grid-cols-1 nav:grid-cols-2 gap-4">
          <AuthField label="Senha">
            <AuthInput
              icon={<Icon.Lock style={{ width: 18, height: 18 }} />}
              suffix={passwordToggle(showPass, () => updateForm({ showPass: !showPass }))}
              type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
              value={password} onChange={e => updateForm({ password: e.target.value })}
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
              type={showConfirmPass ? 'text' : 'password'} placeholder="Repita a senha"
              value={confirmPassword} onChange={e => updateForm({ confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
          </AuthField>
        </div>

        {/* Password strength */}
        {password && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1 flex-1" aria-hidden="true">
              {[0, 1, 2, 3].map(i => (
                <span
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-colors"
                  style={{ background: i < strength.score ? strength.color : '#E2E8F0' }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        )}

        {error && (
          <RegisterError message={error}>
            {error.toLowerCase().includes('e-mail') && (
              <> <Link to="/login" className="underline font-semibold">Fazer login</Link></>
            )}
          </RegisterError>
        )}

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            className="mt-0.5 flex-shrink-0"
            onClick={() => updateForm({ terms: !terms })}
            aria-pressed={terms}
          >
            <span className={cn(
              'w-[18px] h-[18px] rounded-[5px] border-[1.5px] bg-white inline-flex items-center justify-center transition-all',
              terms ? 'bg-primary border-primary text-white' : 'border-slate-200 text-transparent',
            )}>
              {terms && <Icon.Check style={{ width: 10, height: 10 }} />}
            </span>
          </button>
          <span className="text-[13px] text-slate-500 leading-relaxed">
            Aceito os{' '}
            <button type="button" className="font-semibold text-indigo-600 hover:underline">Termos de Uso</button>
            {' '}e a{' '}
            <button type="button" className="font-semibold text-indigo-600 hover:underline">Política de Privacidade</button>
          </span>
        </div>

        <AuthBtn
          type="submit" variant="primary" block size="lg"
          className="mt-1" disabled={loading}
          iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}
        >
          {loading ? 'Criando conta...' : 'Continuar'}
        </AuthBtn>
      </form>
    </RegisterStepLayout>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function RegisterPage() {
  const [accountForm, setAccountForm] = useState<AccountFormState>(initialAccountForm)

  return (
    <RegisterShell>
      <StepAccount form={accountForm} setForm={setAccountForm} />
    </RegisterShell>
  )
}
