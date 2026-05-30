import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { maskCEP, maskCPF, maskPhone } from '../lib/mask'
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
  onNext,
}: {
  form: AccountFormState
  setForm: React.Dispatch<React.SetStateAction<AccountFormState>>
  onNext: () => void
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const redirect = searchParams.get('redirect')
  const publishFlow = isCheckoutPublishRedirect(redirect)
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
      if (publishFlow && redirect) {
        navigate(redirect, { replace: true })
        return
      }
      onNext()
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

function StepRecebimento({ onNext }: { onNext: () => void }) {
  const [birthDate, setBirthDate] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [address, setAddress] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [province, setProvince] = useState('')
  const [incomeValue, setIncomeValue] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchCep(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setAddress(data.logradouro || '')
        setProvince(data.bairro || '')
      }
    } catch {
      // preenchimento manual
    } finally {
      setCepLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!birthDate || !mobilePhone || !postalCode || !address || !addressNumber || !province || !incomeValue) {
      return setError('Preencha todos os campos')
    }

    setLoading(true)
    setError('')
    try {
      await api.setupSubconta({
        birthDate,
        mobilePhone: mobilePhone.replace(/\D/g, ''),
        postalCode: postalCode.replace(/\D/g, ''),
        address,
        addressNumber,
        province,
        incomeValue: Number(incomeValue.replace(/\D/g, '')),
      })
      onNext()
    } catch (err: any) {
      setError(err.message || 'Erro ao configurar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegisterStepLayout>
      <div className="register-form-logo">
        <AuthLogo size={17} />
      </div>
      <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Passo 2 · Recebimento</div>
      <h2 className="ca-display register-headline">Dados para recebimento</h2>
      <p className="register-lead">
        Necessários para configurar sua conta de pagamentos e receber os valores do seu evento.
      </p>

      <form className="register-form" onSubmit={e => { e.preventDefault(); handleSubmit() }}>
        <div className="register-form__row">
          <AuthField label="Data de nascimento">
            <AuthInput type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
          </AuthField>

          <AuthField label="Celular (com DDD)">
            <AuthInput
              type="text"
              placeholder="(11) 99999-9999"
              value={mobilePhone}
              onChange={e => setMobilePhone(maskPhone(e.target.value))}
            />
          </AuthField>
        </div>

        <div className="register-form__row register-form__row--full">
          <AuthField label="CEP">
            <AuthInput
              type="text"
              placeholder="00000-000"
              value={postalCode}
              onChange={e => {
                const masked = maskCEP(e.target.value)
                setPostalCode(masked)
                fetchCep(masked)
              }}
              suffix={cepLoading ? <span style={{ fontSize: 11, color: 'var(--ca-muted-2)' }}>...</span> : undefined}
            />
          </AuthField>
        </div>

        <div className="register-form__row register-form__row--full">
          <AuthField label="Endereço (rua/avenida)">
            <AuthInput type="text" placeholder="Rua das Flores" value={address} onChange={e => setAddress(e.target.value)} />
          </AuthField>
        </div>

        <div className="register-form__row register-form__row--address">
          <AuthField label="Bairro">
            <AuthInput type="text" placeholder="Centro" value={province} onChange={e => setProvince(e.target.value)} />
          </AuthField>

          <AuthField label="Número">
            <AuthInput type="text" placeholder="123" value={addressNumber} onChange={e => setAddressNumber(e.target.value)} />
          </AuthField>
        </div>

        <div className="register-form__row register-form__row--full">
          <AuthField label="Faturamento mensal estimado (R$)">
            <AuthInput
              type="text"
              placeholder="Ex: 5000"
              value={incomeValue}
              onChange={e => setIncomeValue(e.target.value.replace(/\D/g, ''))}
            />
          </AuthField>
        </div>

        {error ? <RegisterError message={error} /> : null}

        <AuthBtn type="submit" variant="primary" block size="lg" style={{ marginTop: 4 }} iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}>
          {loading ? 'Configurando...' : 'Continuar'}
        </AuthBtn>
      </form>
    </RegisterStepLayout>
  )
}

type PixType = 'CPF/CNPJ' | 'Celular' | 'E-mail' | 'Aleatória'

function maskPixKeyValue(val: string, pixType: PixType) {
  if (pixType === 'CPF/CNPJ') {
    const digits = val.replace(/\D/g, '').slice(0, 14)
    if (digits.length <= 11) {
      return digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return digits.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }

  if (pixType === 'Celular') return maskPhone(val)
  return val
}

function StepPix({ onPrev }: { onPrev: () => void }) {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [pixType, setPixType] = useState<PixType>('CPF/CNPJ')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!pixKey) return setError('Informe sua chave PIX')

    setLoading(true)
    setError('')
    try {
      const typeMap: Record<PixType, string> = {
        'CPF/CNPJ': pixKey.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF',
        'Celular': 'PHONE',
        'E-mail': 'EMAIL',
        'Aleatória': 'EVP',
      }
      await api.updatePixKey(pixKey, typeMap[pixType])
      await refreshUser()
      navigate('/criar', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar chave PIX')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegisterStepLayout>
      <div className="register-form-logo">
        <AuthLogo size={17} />
      </div>
      <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Passo 3 · Chave PIX</div>
      <h2 className="ca-display register-headline">Para onde enviamos seu dinheiro?</h2>
      <p className="register-lead">
        Informe sua chave PIX para receber os valores arrecadados no seu evento.
      </p>

      <form className="register-form" onSubmit={e => { e.preventDefault(); handleSubmit() }}>
        <AuthField label="Tipo de chave">
          <div className="register-select-wrap">
            <select
              className="register-select"
              value={pixType}
              onChange={e => {
                setPixType(e.target.value as PixType)
                setPixKey('')
              }}
            >
              <option value="CPF/CNPJ">CPF / CNPJ</option>
              <option value="Celular">Celular</option>
              <option value="E-mail">E-mail</option>
              <option value="Aleatória">Chave aleatória</option>
            </select>
            <span className="register-select-wrap__chevron" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </span>
          </div>
        </AuthField>

        <AuthField
          label="Sua chave PIX"
          hint={pixType === 'CPF/CNPJ' ? 'Apenas números' : pixType === 'Celular' ? 'Com DDD' : undefined}
        >
          <AuthInput
            icon={<Icon.Pix style={{ width: 18, height: 18 }} />}
            type={pixType === 'E-mail' ? 'email' : 'text'}
            placeholder={
              pixType === 'CPF/CNPJ' ? '000.000.000-00'
                : pixType === 'Celular' ? '(00) 00000-0000'
                  : 'Insira sua chave PIX'
            }
            value={pixKey}
            onChange={e => setPixKey(maskPixKeyValue(e.target.value, pixType))}
          />
        </AuthField>

        {error ? <RegisterError message={error} /> : null}

        <div className="register-actions">
          <AuthBtn type="button" variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>
            Voltar
          </AuthBtn>
          <button type="button" className="register-actions__skip" onClick={() => navigate('/dashboard')}>
            Pular por agora
          </button>
          <AuthBtn type="submit" variant="primary" className="register-actions__primary" iconRight={!loading && <Icon.ArrowRight style={{ width: 16, height: 16 }} />}>
            {loading ? 'Salvando...' : 'Concluir'}
          </AuthBtn>
        </div>
      </form>
    </RegisterStepLayout>
  )
}

export function RegisterPage() {
  const [step, setStep] = useState(0)
  const [accountForm, setAccountForm] = useState<AccountFormState>(initialAccountForm)

  return (
    <div className="auth-page ca-root">
      <RegisterShell>
        {step === 0 && (
          <StepAccount
            form={accountForm}
            setForm={setAccountForm}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && <StepRecebimento onNext={() => setStep(2)} />}
        {step === 2 && <StepPix onPrev={() => setStep(1)} />}
      </RegisterShell>
    </div>
  )
}
