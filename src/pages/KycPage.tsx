import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { isCheckoutPublishRedirect } from '../lib/builderDraft'

const BANKS = [
  { key: 'nubank',    name: 'Nubank',          code: '260', color: '#820AD1', ink: '#fff' },
  { key: 'itau',      name: 'Itaú',            code: '341', color: '#EC7000', ink: '#fff' },
  { key: 'bradesco',  name: 'Bradesco',        code: '237', color: '#CC092F', ink: '#fff' },
  { key: 'bb',        name: 'BB',              code: '001', color: '#F9DD16', ink: '#0A3D91' },
  { key: 'santander', name: 'Santander',       code: '033', color: '#EC0000', ink: '#fff' },
  { key: 'inter',     name: 'Inter',           code: '077', color: '#FF7A00', ink: '#fff' },
  { key: 'caixa',     name: 'Caixa',           code: '104', color: '#0070AF', ink: '#fff' },
  { key: 'c6',        name: 'C6 Bank',         code: '336', color: '#1A1A1A', ink: '#fff' },
]

// ─── Screen 1: Bank Account Setup ─────────────────────────────
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 28px', borderBottom: '1px solid #E2E8F0', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AuthLogo size={17} />
          <span style={{ width: 1, height: 22, background: '#E2E8F0' }} />
          <span style={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Conta bancária</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
        <div className="ca-card" style={{ maxWidth: 520, width: '100%', padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Bank style={{ width: 24, height: 24, color: '#6366F1' }} />
            </div>
          </div>
          <h2 className="ca-display" style={{ fontSize: 22, textAlign: 'center', marginBottom: 8 }}>
            Configure sua conta bancária
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
            Informe os dados da conta que receberá os valores arrecadados no seu evento.
          </p>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={e => { e.preventDefault(); handleSubmit() }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Selecione o banco</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {BANKS.map(b => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setSelectedBank(b.key)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 10,
                      border: selectedBank === b.key ? `2px solid ${b.color}` : '2px solid #E2E8F0',
                      background: selectedBank === b.key ? b.color : '#fff',
                      color: selectedBank === b.key ? b.ink : '#374151',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 80px', gap: 12 }}>
              <AuthField label="Agência">
                <AuthInput
                  type="text"
                  placeholder="0001"
                  value={branchNumber}
                  onChange={e => setBranchNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                />
              </AuthField>
              <AuthField label="Número da conta">
                <AuthInput
                  type="text"
                  placeholder="12345"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  inputMode="numeric"
                />
              </AuthField>
              <AuthField label="Dígito">
                <AuthInput
                  type="text"
                  placeholder="6"
                  value={accountCheckDigit}
                  onChange={e => setAccountCheckDigit(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  inputMode="numeric"
                />
              </AuthField>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Tipo de conta</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['checking', 'savings'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAccountType(t)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      border: accountType === t ? '2px solid #6366F1' : '2px solid #E2E8F0',
                      background: accountType === t ? 'rgba(99,102,241,0.07)' : '#fff',
                      color: accountType === t ? '#4338CA' : '#64748B',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t === 'checking' ? 'Conta corrente' : 'Conta poupança'}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ color: '#EF4444', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <AuthBtn type="submit" variant="primary" block size="lg" style={{ marginTop: 4 }} iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />} disabled={loading}>
              {loading ? 'Configurando...' : 'Continuar'}
            </AuthBtn>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 2: Pending Verification ───────────────────────────
function KycBankPending({ redirectTarget }: { redirectTarget?: string }) {
  const navigate = useNavigate()
  const { refreshUser, user } = useAuth()

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await api.getRecipientStatus()
        if (status.kycStatus === 'bank_configured') {
          await refreshUser()
          const dest = redirectTarget ?? '/dashboard'
          navigate(dest, { replace: true })
        }
      } catch {
        // silent — keep polling
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [navigate, refreshUser, redirectTarget])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 28px', borderBottom: '1px solid #E2E8F0', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AuthLogo size={17} />
          <span style={{ width: 1, height: 22, background: '#E2E8F0' }} />
          <span style={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Verificação em andamento</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ borderRadius: 20, background: 'linear-gradient(140deg,#312E81 0%,#4338CA 45%,#7C3AED 100%)', padding: '36px 32px', color: '#fff', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', top: -60, right: -40, background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Conta Celebre</div>
                <span style={{ background: 'rgba(251,191,36,0.2)', color: '#FDE68A', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                  Em verificação
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6 }}>
                {user?.name?.split(' ')[0] ?? ''}
              </div>
              <div style={{ fontSize: 13, opacity: 0.65 }}>{user?.email}</div>
            </div>
          </div>

          <div className="ca-card" style={{ padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.RefreshCw style={{ width: 18, height: 18, color: '#6366F1' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Verificação em andamento</div>
                <div style={{ fontSize: 12.5, color: '#64748B' }}>Análise automática pelo Pagar.me</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Dados recebidos', done: true },
                { label: 'Análise pelo Pagar.me', done: false, active: true },
                { label: 'Conta verificada e ativa', done: false },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step.done ? '#10B981' : step.active ? '#6366F1' : '#E2E8F0',
                      border: step.active ? '2px solid #6366F1' : 'none',
                    }}>
                      {step.done && <Icon.Check style={{ width: 14, height: 14, color: '#fff' }} />}
                      {step.active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: 2, height: 28, background: step.done ? '#10B981' : '#E2E8F0', margin: '2px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 4, paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: step.done || step.active ? 600 : 400, color: step.done || step.active ? '#0F172A' : '#94A3B8' }}>
                      {step.label}
                    </div>
                    {step.active && (
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Verificando documentos e dados bancários…</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
              A verificação geralmente leva alguns minutos. Esta página atualiza automaticamente quando sua conta for ativada.
            </div>

            <button
              style={{ marginTop: 16, width: '100%', background: 'none', border: 'none', color: '#6366F1', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}
              onClick={() => navigate('/dashboard')}
            >
              Ir para o painel enquanto isso →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── KycPage ─────────────────────────────────────────────────
export function KycPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const publishFlow = isCheckoutPublishRedirect(redirect)

  const initialStep = user?.kycStatus === 'recipient_created' ? 1 : 0
  const [step, setStep] = useState(initialStep)

  useEffect(() => {
    if (user?.kycStatus === 'bank_configured') {
      navigate(redirect ?? '/dashboard', { replace: true })
    }
  }, [user?.kycStatus, navigate, redirect])

  if (user?.kycStatus === 'bank_configured') return null

  return (
    <div className="auth-page ca-root">
      {step === 0 && (
        <KycBankSetup onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <KycBankPending redirectTarget={publishFlow && redirect ? redirect : undefined} />
      )}
    </div>
  )
}
