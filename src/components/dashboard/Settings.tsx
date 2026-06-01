import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { AuthField, AuthInput, AuthBtn } from '../auth/AuthShared'
import { PageHead } from '../../pages/DashboardPage'
import { api } from '../../lib/api'

type PixType = 'CPF/CNPJ' | 'Celular' | 'E-mail' | 'Aleatória'

const TYPE_MAP: Record<PixType, string> = {
  'CPF/CNPJ': 'CPF',
  'Celular': 'PHONE',
  'E-mail': 'EMAIL',
  'Aleatória': 'EVP',
}

function maskPixKey(key: string | null) {
  if (!key) return null
  if (key.includes('@')) {
    const [local, domain] = key.split('@')
    return local.slice(0, 2) + '···@' + domain
  }
  if (key.replace(/\D/g, '').length >= 11) return '···.' + key.slice(-4)
  return key.slice(0, 3) + '···' + key.slice(-2)
}

function formatPixInput(val: string, type: PixType) {
  if (type === 'CPF/CNPJ') {
    const digits = val.replace(/\D/g, '').slice(0, 14)
    if (digits.length <= 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, d) =>
        [a, b, c].filter(Boolean).join('.') + (d ? '-' + d : '')
      )
    }
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, a, b, c, d, e) =>
      `${a}.${b}.${c}/${d}` + (e ? '-' + e : '')
    )
  }
  if (type === 'Celular') {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, a, b, c) =>
      `(${a}) ${b}` + (c ? '-' + c : '')
    )
  }
  return val
}

export function Settings() {
  const { user, refreshUser } = useAuth()
  const [pixType, setPixType] = useState<PixType>('CPF/CNPJ')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const maskedKey = maskPixKey(user?.pixKey ?? null)

  const handleSave = async () => {
    if (!pixKey.trim()) return setError('Informe a chave PIX')
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const type = pixType === 'CPF/CNPJ'
        ? (pixKey.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF')
        : TYPE_MAP[pixType]
      await api.updatePixKey(pixKey, type)
      await refreshUser()
      setPixKey('')
      setSaved(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHead eyebrow="Conta" title="Configurações" />

      <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ca-card" style={{ padding: '28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.Pix style={{ width: 18, height: 18, color: 'var(--ca-indigo)' }} />
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ca-ink)' }}>Chave PIX</div>
              <div style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>
                {maskedKey ? <>Atual: <code style={{ fontFamily: 'var(--ca-mono)', fontSize: 12 }}>{maskedKey}</code></> : 'Nenhuma chave configurada'}
              </div>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); handleSave() }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AuthField label="Tipo de Chave">
              <div style={{ position: 'relative' }}>
                <select
                  value={pixType}
                  onChange={e => { setPixType(e.target.value as PixType); setPixKey(''); setSaved(false) }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0', outline: 'none', background: '#fff', fontSize: 14, color: 'var(--ca-ink)', appearance: 'none', cursor: 'pointer' }}
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

            <AuthField
              label="Nova Chave"
              hint={pixType === 'CPF/CNPJ' ? 'Apenas números' : pixType === 'Celular' ? 'Com DDD' : ''}
            >
              <AuthInput
                icon={<Icon.Pix style={{ width: 18, height: 18 }} />}
                type={pixType === 'E-mail' ? 'email' : 'text'}
                placeholder={
                  pixType === 'CPF/CNPJ' ? '000.000.000-00' :
                  pixType === 'Celular' ? '(00) 00000-0000' :
                  pixType === 'Aleatória' ? 'Cole a chave aleatória' :
                  'seu@email.com'
                }
                value={pixKey}
                onChange={e => { setPixKey(formatPixInput(e.target.value, pixType)); setSaved(false) }}
              />
            </AuthField>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--ca-error, #EF4444)', padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 8 }}>
                {error}
              </div>
            )}

            {saved && (
              <div style={{ fontSize: 13, color: '#047857', padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.ShieldCheck style={{ width: 14, height: 14 }} />
                Chave PIX atualizada com sucesso
              </div>
            )}

            <AuthBtn type="submit" variant="primary" style={{ alignSelf: 'flex-start', height: 40, padding: '0 20px', fontSize: 13.5 }} disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar chave PIX'}
            </AuthBtn>
          </form>
        </div>
      </div>
    </div>
  )
}
