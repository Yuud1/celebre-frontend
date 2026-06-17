import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'

const BANKS: Record<string, { name: string; color: string; ink: string }> = {
  '260': { name: 'Nubank',          color: '#820AD1', ink: '#fff' },
  '341': { name: 'Itaú Unibanco',   color: '#EC7000', ink: '#fff' },
  '237': { name: 'Bradesco',        color: '#CC092F', ink: '#fff' },
  '001': { name: 'Banco do Brasil', color: '#F9DD16', ink: '#0A3D91' },
  '033': { name: 'Santander',       color: '#EC0000', ink: '#fff' },
  '077': { name: 'Banco Inter',     color: '#FF7A00', ink: '#fff' },
  '104': { name: 'Caixa Econômica', color: '#0070AF', ink: '#fff' },
  '336': { name: 'C6 Bank',         color: '#1A1A1A', ink: '#fff' },
}

function bankName(code: string | null) {
  if (!code) return null
  return BANKS[code]?.name ?? `Banco ${code}`
}

function PayoutCard({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 16,
      background: gradient,
      padding: '24px 24px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', top: -50, right: -30, background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)' }} />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  )
}

export function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const kycStatus = user?.kycStatus ?? 'pending'

  if (kycStatus === 'pending') {
    return (
      <div>
        <PageHead eyebrow="Conta" title="Configurações" />
        <div style={{ maxWidth: 520 }}>
          <div className="ca-card" style={{ padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.Bank style={{ width: 18, height: 18, color: 'var(--ca-indigo)' }} />
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Conta bancária</div>
                <div style={{ fontSize: 12.5, color: 'var(--ca-muted)' }}>Nenhuma conta configurada</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
              Configure sua conta bancária para receber os valores arrecadados nos seus eventos.
            </p>
            <button className="ca-btn ca-btn--primary" style={{ height: 40, padding: '0 20px', fontSize: 13.5 }} onClick={() => navigate('/verificacao')}>
              Configurar conta bancária
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (kycStatus === 'recipient_created') {
    return (
      <div>
        <PageHead eyebrow="Conta" title="Configurações" />
        <div style={{ maxWidth: 520 }}>
          <PayoutCard gradient="linear-gradient(140deg,#312E81 0%,#4338CA 45%,#7C3AED 100%)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Conta Celebre</div>
              <span style={{ background: 'rgba(251,191,36,0.2)', color: '#FDE68A', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                Em verificação
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{user?.name}</div>
            <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>Verificação em andamento pelo Pagar.me</div>
          </PayoutCard>
          <div className="ca-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon.RefreshCw style={{ width: 18, height: 18, color: '#6366F1', flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>
              Seus dados estão sendo verificados automaticamente. Você receberá uma atualização em breve.
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (kycStatus === 'active') {
    return (
      <div>
        <PageHead eyebrow="Conta" title="Configurações" />
        <div style={{ maxWidth: 520 }}>
          <PayoutCard gradient="linear-gradient(140deg,#312E81 0%,#4338CA 45%,#6D28D9 100%)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Conta Celebre</div>
              <span style={{ background: 'rgba(52,211,153,0.2)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                KYC aprovado
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{user?.name}</div>
            <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>Finalize adicionando sua conta bancária</div>
          </PayoutCard>
          <div className="ca-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#64748B' }}>
              Identidade verificada. Adicione uma conta bancária para receber saques.
            </div>
            <button className="ca-btn ca-btn--primary" style={{ height: 36, padding: '0 16px', fontSize: 13, flexShrink: 0 }} onClick={() => navigate('/verificacao')}>
              Adicionar conta
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (kycStatus === 'bank_configured') {
    const bname = bankName(user?.bankCode ?? null)
    return (
      <div>
        <PageHead eyebrow="Conta" title="Configurações" />
        <div style={{ maxWidth: 520 }}>
          <PayoutCard gradient="linear-gradient(140deg,#0F172A 0%,#1E293B 55%,#334155 100%)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Conta Celebre</div>
              <span style={{ background: 'rgba(52,211,153,0.2)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                <Icon.Check style={{ width: 10, height: 10, display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Verificado
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{user?.name}</div>
            <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
              {bname ?? user?.bankCode}
            </div>
          </PayoutCard>
          <div className="ca-card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon.ShieldCheck style={{ width: 18, height: 18, color: '#10B981', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#064E3B', fontWeight: 500 }}>Conta bancária verificada e ativa</div>
            </div>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 6 }}>
              Seus saques serão transferidos diretamente para a conta bancária cadastrada no Pagar.me.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // rejected
  return (
    <div>
      <PageHead eyebrow="Conta" title="Configurações" />
      <div style={{ maxWidth: 520 }}>
        <PayoutCard gradient="linear-gradient(140deg,#1E293B 0%,#27272A 55%,#3F3F46 100%)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Conta Celebre</div>
            <span style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
              Rejeitada
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{user?.name}</div>
          <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>Verificação não aprovada</div>
        </PayoutCard>
        <div className="ca-card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Icon.AlertCircle style={{ width: 18, height: 18, color: '#EF4444', flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: '#991B1B', fontWeight: 600 }}>Verificação rejeitada pelo Pagar.me</div>
          </div>
          <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
            Entre em contato com o suporte da Celebre para mais informações sobre o processo de verificação.
          </div>
        </div>
      </div>
    </div>
  )
}
