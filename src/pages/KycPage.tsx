import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { isCheckoutPublishRedirect } from '../lib/builderDraft'
import { cn } from '@/lib/utils'

const BANKS = [
  { key: 'nubank',    name: 'Nubank',     code: '260', color: '#820AD1', ink: '#fff' },
  { key: 'itau',      name: 'Itaú',       code: '341', color: '#EC7000', ink: '#fff' },
  { key: 'bradesco',  name: 'Bradesco',   code: '237', color: '#CC092F', ink: '#fff' },
  { key: 'bb',        name: 'BB',         code: '001', color: '#F9DD16', ink: '#0A3D91' },
  { key: 'santander', name: 'Santander',  code: '033', color: '#EC0000', ink: '#fff' },
  { key: 'inter',     name: 'Inter',      code: '077', color: '#FF7A00', ink: '#fff' },
  { key: 'caixa',     name: 'Caixa',      code: '104', color: '#0070AF', ink: '#fff' },
  { key: 'c6',        name: 'C6 Bank',    code: '336', color: '#1A1A1A', ink: '#fff' },
]

function KycLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-slate-50 font-display">
      <div className="flex items-center px-7 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <AuthLogo size={17} />
          <span className="w-px h-[22px] bg-slate-200" />
          <span className="text-[13.5px] text-slate-500 font-medium">{title}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Screen 1: Bank Account Setup ───────────────────────────────────────────

function KycBankSetup({ onNext }: { onNext: () => void }) {
  const { refreshUser } = useAuth()
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [branchNumber, setBranchNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountCheckDigit, setAccountCheckDigit] = useState('')
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bank = BANKS.find(b => b.key === selectedBank)

  async function handleSubmit() {
    if (!selectedBank || !branchNumber || !accountNumber || !accountCheckDigit) {
      return setError('Selecione o banco e preencha todos os dados da conta')
    }
    setLoading(true)
    setError('')
    try {
      await api.setupRecipient({
        bankCode: bank!.code,
        branchNumber: branchNumber.replace(/\D/g, ''),
        accountNumber: accountNumber.replace(/\D/g, ''),
        accountCheckDigit,
        accountType,
      })
      await refreshUser()
      onNext()
    } catch (err: any) {
      setError(err.message || 'Erro ao configurar conta bancária')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KycLayout title="Conta bancária">
      <div className="flex-1 flex items-start justify-center px-5 py-10 overflow-y-auto">
        <div className="w-full max-w-[520px] bg-white border border-slate-200 rounded-2xl p-10 shadow-ca-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <Icon.Bank style={{ width: 24, height: 24, color: '#6366F1' }} />
            </div>
          </div>

          <h2 className="font-display text-[22px] font-semibold tracking-tight text-slate-950 text-center mb-2">
            Configure sua conta bancária
          </h2>
          <p className="text-[13.5px] text-slate-500 text-center mb-8 leading-relaxed">
            Informe os dados da conta que receberá os valores arrecadados no seu evento.
          </p>

          <form className="flex flex-col gap-5" onSubmit={e => { e.preventDefault(); handleSubmit() }}>
            {/* Bank selector */}
            <div>
              <div className="text-[13px] font-semibold text-slate-700 mb-2.5">Selecione o banco</div>
              <div className="grid grid-cols-4 gap-2">
                {BANKS.map(b => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setSelectedBank(b.key)}
                    className="py-2.5 px-1.5 rounded-xl text-[11px] font-semibold text-center leading-tight transition-all"
                    style={{
                      border: selectedBank === b.key ? `2px solid ${b.color}` : '2px solid #E2E8F0',
                      background: selectedBank === b.key ? b.color : '#fff',
                      color: selectedBank === b.key ? b.ink : '#374151',
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Account fields */}
            <div className="grid grid-cols-[1fr_2fr_80px] gap-3">
              <AuthField label="Agência">
                <AuthInput
                  type="text" placeholder="0001"
                  value={branchNumber}
                  onChange={e => setBranchNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                />
              </AuthField>
              <AuthField label="Número da conta">
                <AuthInput
                  type="text" placeholder="12345"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  inputMode="numeric"
                />
              </AuthField>
              <AuthField label="Dígito">
                <AuthInput
                  type="text" placeholder="6"
                  value={accountCheckDigit}
                  onChange={e => setAccountCheckDigit(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  inputMode="numeric"
                />
              </AuthField>
            </div>

            {/* Account type */}
            <div>
              <div className="text-[13px] font-semibold text-slate-700 mb-2">Tipo de conta</div>
              <div className="flex gap-2.5">
                {(['checking', 'savings'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAccountType(t)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all',
                      accountType === t
                        ? 'border-2 border-indigo-500 bg-indigo-50/70 text-indigo-700'
                        : 'border-2 border-slate-200 bg-white text-slate-500',
                    )}
                  >
                    {t === 'checking' ? 'Conta corrente' : 'Conta poupança'}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-[13px] text-red-500 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <AuthBtn
              type="submit" variant="primary" block size="lg"
              className="mt-1" disabled={loading}
              iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}
            >
              {loading ? 'Configurando...' : 'Continuar'}
            </AuthBtn>
          </form>
        </div>
      </div>
    </KycLayout>
  )
}

// ─── Screen 2: Pending Verification ─────────────────────────────────────────

function KycBankPending({ redirectTarget }: { redirectTarget?: string }) {
  const navigate = useNavigate()
  const { refreshUser, user } = useAuth()

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await api.getRecipientStatus()
        if (status.kycStatus === 'bank_configured') {
          await refreshUser()
          navigate(redirectTarget ?? '/dashboard', { replace: true })
        }
      } catch { /* silent — keep polling */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [navigate, refreshUser, redirectTarget])

  const steps = [
    { label: 'Dados recebidos',          done: true,  active: false },
    { label: 'Análise pelo Pagar.me',    done: false, active: true  },
    { label: 'Conta verificada e ativa', done: false, active: false },
  ]

  return (
    <KycLayout title="Verificação em andamento">
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[480px]">
          {/* Gradient card */}
          <div className="relative rounded-[20px] bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 p-9 text-white mb-6 overflow-hidden">
            <div className="absolute w-[200px] h-[200px] rounded-full -top-[60px] -right-10 bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[13px] font-semibold opacity-70 uppercase tracking-widest">Conta Celebre</span>
                <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  Em verificação
                </span>
              </div>
              <div className="font-display text-[28px] font-bold mb-1.5">
                {user?.name?.split(' ')[0] ?? ''}
              </div>
              <div className="text-[13px] opacity-65">{user?.email}</div>
            </div>
          </div>

          {/* Status card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-ca-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Icon.RefreshCw style={{ width: 18, height: 18, color: '#6366F1' }} />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900">Verificação em andamento</div>
                <div className="text-xs text-slate-500">Análise automática pelo Pagar.me</div>
              </div>
            </div>

            <div className="flex flex-col">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center',
                      step.done   ? 'bg-emerald-500' :
                      step.active ? 'bg-indigo-500 border-2 border-indigo-500' :
                      'bg-slate-200',
                    )}>
                      {step.done   && <Icon.Check style={{ width: 14, height: 14, color: '#fff' }} />}
                      {step.active && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={cn('w-0.5 h-7 my-0.5', step.done ? 'bg-emerald-500' : 'bg-slate-200')} />
                    )}
                  </div>
                  <div className={cn('pt-1', i < steps.length - 1 && 'pb-5')}>
                    <div className={cn(
                      'text-[13.5px]',
                      step.done || step.active ? 'font-semibold text-slate-900' : 'font-normal text-slate-400',
                    )}>
                      {step.label}
                    </div>
                    {step.active && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Verificando documentos e dados bancários…
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 px-3.5 py-3 bg-slate-50 rounded-xl text-xs text-slate-500 leading-relaxed">
              A verificação geralmente leva alguns minutos. Esta página atualiza automaticamente quando sua conta for ativada.
            </div>
          </div>
        </div>
      </div>
    </KycLayout>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function KycPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const publishFlow = isCheckoutPublishRedirect(redirect)
  const initialStep = user?.kycStatus === 'recipient_created' ? 1 : 0
  const [step, setStep] = useState(initialStep)
  const [onboardingEventId, setOnboardingEventId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.onboardingRequired || redirect) return
    let cancelled = false
    api.listEvents().then((events) => {
      if (!cancelled && events[0]) setOnboardingEventId(events[0].id)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [user?.onboardingRequired, redirect])

  const target = redirect && publishFlow
    ? redirect
    : onboardingEventId
      ? `/criar?event=${onboardingEventId}`
      : '/dashboard'

  useEffect(() => {
    if (user?.kycStatus === 'bank_configured') {
      navigate(target, { replace: true })
    }
  }, [user?.kycStatus, navigate, target])

  if (user?.kycStatus === 'bank_configured') return null

  return (
    <div className="fixed inset-0 overflow-auto font-display">
      {step === 0 && <KycBankSetup onNext={() => setStep(1)} />}
      {step === 1 && <KycBankPending redirectTarget={target} />}
    </div>
  )
}
