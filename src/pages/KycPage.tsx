import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

// ─── Screen 1: Dados da conta Asaas ──────────────────────────
function KycSubconta({ onNext }: { onNext: () => void }) {
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
      // silent — user fills manually
    } finally {
      setCepLoading(false)
    }
  }

  function maskPhone(val: string) {
    const d = val.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }

  function maskCep(val: string) {
    const d = val.replace(/\D/g, '').slice(0, 8)
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
  }

  async function handleSubmit() {
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid #E2E8F0', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AuthLogo size={17} />
          <span style={{ width: 1, height: 22, background: '#E2E8F0' }} />
          <span style={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Configuração da conta · Passo 1 de 2</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="ca-card" style={{ maxWidth: 480, width: '100%', padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Shield style={{ width: 24, height: 24, color: '#6366F1' }} />
            </div>
          </div>
          <h2 className="ca-display" style={{ fontSize: 22, textAlign: 'center', marginBottom: 8 }}>Dados para recebimento</h2>
          <p style={{ fontSize: 13.5, color: '#64748B', textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
            Necessários para configurar sua conta de pagamentos e receber os valores do seu evento.
          </p>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={e => { e.preventDefault(); handleSubmit() }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <AuthField label="Data de nascimento">
                <AuthInput
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                />
              </AuthField>
              <AuthField label="Celular (com DDD)">
                <AuthInput
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={mobilePhone}
                  onChange={e => setMobilePhone(maskPhone(e.target.value))}
                />
              </AuthField>
              <AuthField label="CEP">
                <AuthInput
                  type="text"
                  placeholder="00000-000"
                  value={postalCode}
                  onChange={e => {
                    const masked = maskCep(e.target.value)
                    setPostalCode(masked)
                    fetchCep(masked)
                  }}
                  suffix={cepLoading ? <span style={{ fontSize: 11, color: '#94A3B8' }}>...</span> : undefined}
                />
              </AuthField>
            </div>

            <AuthField label="Endereço (rua/avenida)">
              <AuthInput
                type="text"
                placeholder="Rua das Flores"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </AuthField>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <AuthField label="Bairro">
                <AuthInput
                  type="text"
                  placeholder="Centro"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                />
              </AuthField>
              <AuthField label="Número">
                <AuthInput
                  type="text"
                  placeholder="123"
                  value={addressNumber}
                  onChange={e => setAddressNumber(e.target.value)}
                />
              </AuthField>
            </div>

            <AuthField label="Faturamento mensal estimado (R$)">
              <AuthInput
                type="text"
                placeholder="Ex: 5000"
                value={incomeValue}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setIncomeValue(digits)
                }}
              />
            </AuthField>

            {error && (
              <div style={{ color: '#EF4444', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <AuthBtn type="submit" variant="primary" block size="lg" style={{ marginTop: 4 }} iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}>
              {loading ? 'Configurando...' : 'Continuar'}
            </AuthBtn>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 2: Pix Key ────────────────────────────────────────
function KycPixKey({ onNext }: { onNext: () => void }) {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [pixType, setPixType] = useState<'CPF/CNPJ' | 'Celular' | 'E-mail' | 'Aleatória'>('CPF/CNPJ')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!pixKey) return setError('Informe sua chave PIX')
    setLoading(true)
    setError('')
    try {
      await api.updatePixKey(pixKey)
      await refreshUser()
      onNext()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar chave PIX')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid #E2E8F0', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AuthLogo size={17} />
          <span style={{ width: 1, height: 22, background: '#E2E8F0' }} />
          <span style={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Configuração da conta · Passo 2 de 2</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="ca-card" style={{ maxWidth: 460, width: '100%', padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Pix style={{ width: 24, height: 24, color: '#6366F1' }} />
            </div>
          </div>
          <h2 className="ca-display" style={{ fontSize: 24, textAlign: 'center', marginBottom: 8 }}>Para onde enviamos seu dinheiro?</h2>
          <p style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32 }}>
            Informe sua chave PIX para receber os valores arrecadados no seu evento.
          </p>

          <form onSubmit={e => { e.preventDefault(); handleSave() }}>
            <AuthField label="Tipo de Chave">
              <div style={{ position: 'relative' }}>
                <select
                  value={pixType}
                  onChange={e => {
                    setPixType(e.target.value as any)
                    setPixKey('')
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    outline: 'none',
                    background: '#fff',
                    fontSize: '14px',
                    color: '#0F172A',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="CPF/CNPJ">CPF / CNPJ</option>
                  <option value="Celular">Celular</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Aleatória">Chave Aleatória</option>
                </select>
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </AuthField>

            <AuthField label="Sua Chave PIX" hint={pixType === 'CPF/CNPJ' ? 'Apenas números' : pixType === 'Celular' ? 'Com DDD' : ''}>
              <AuthInput
                icon={<Icon.Pix style={{ width: 18, height: 18 }} />}
                type={pixType === 'E-mail' ? 'email' : 'text'}
                placeholder={pixType === 'CPF/CNPJ' ? '000.000.000-00' : pixType === 'Celular' ? '(00) 00000-0000' : 'Insira sua chave PIX'}
                value={pixKey}
                onChange={e => {
                  let val = e.target.value
                  if (pixType === 'CPF/CNPJ') {
                    const digits = val.replace(/\D/g, '').slice(0, 14)
                    if (digits.length <= 11) {
                      val = digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                    } else {
                      val = digits.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2')
                    }
                  } else if (pixType === 'Celular') {
                    const digits = val.replace(/\D/g, '').slice(0, 11)
                    if (digits.length <= 2) val = digits
                    else if (digits.length <= 6) val = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
                    else if (digits.length <= 10) val = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
                    else val = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
                  }
                  setPixKey(val)
                }}
              />
            </AuthField>

            {error && (
              <div style={{ color: '#EF4444', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', marginTop: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <AuthBtn type="button" variant="ghost" onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>
                Pular por agora
              </AuthBtn>
              <AuthBtn type="submit" variant="primary" style={{ flex: 1 }} iconRight={!loading && <Icon.ArrowRight style={{ width: 16, height: 16 }} />}>
                {loading ? 'Salvando...' : 'Salvar e continuar'}
              </AuthBtn>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 3: Success ────────────────────────────────────────
function KycSuccess() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #FAFAFF 0%, #F5F3FF 100%)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '1px solid #EEF2F7' }}>
        <AuthLogo />
        <button style={{ fontSize: 13, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Ir para o painel →
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12%', right: '20%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 1 }}>
          <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 32 }}>
            <div className="ca-pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(16,185,129,0.12)' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
              <Icon.Check style={{ width: 40, height: 40, color: '#fff' }} />
            </div>
          </div>

          <div className="ca-eyebrow" style={{ color: '#047857', marginBottom: 12 }}>Conta pronta</div>
          <h1 className="ca-display" style={{ fontSize: 44, lineHeight: 1.05, margin: '0 0 14px' }}>
            Tudo certo,{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              {user?.name?.split(' ')[0] || 'Aí sim'}
            </span>!
          </h1>
          <p style={{ color: '#475569', fontSize: 16, margin: '0 0 32px', lineHeight: 1.5 }}>
            Sua conta de pagamentos e chave PIX foram configuradas. Você já pode criar a página do seu evento.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <AuthBtn variant="ghost" size="lg" onClick={() => navigate('/dashboard')}>
              Ir para o painel
            </AuthBtn>
            <AuthBtn variant="primary" size="lg" iconRight={<Icon.ArrowRight style={{ width: 18, height: 18 }} />} style={{ minWidth: 240 }} onClick={() => navigate('/criar')}>
              Criar meu evento
            </AuthBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── KycPage ─────────────────────────────────────────────────
export function KycPage() {
  const [step, setStep] = useState(0)

  return (
    <div className="auth-page ca-root">
      {step === 0 && <KycSubconta onNext={() => setStep(1)} />}
      {step === 1 && <KycPixKey onNext={() => setStep(2)} />}
      {step === 2 && <KycSuccess />}
    </div>
  )
}
