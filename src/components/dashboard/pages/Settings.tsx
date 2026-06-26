import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { Icon } from '../../auth/AuthIcons'
import { PageHead } from '../../../pages/DashboardPage'
import { DashBtn } from '../DashBtn'

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
    <div className="rounded-2xl p-6 text-white relative overflow-hidden mb-4" style={{ background: gradient }}>
      <div className="absolute w-[180px] h-[180px] rounded-full -top-[50px] -right-[30px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)' }} />
      <div className="relative">{children}</div>
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
        <div className="max-w-[520px] w-full">
          <div className="bg-white rounded-2xl border border-slate-200 p-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-[10px] bg-indigo-500/10 inline-flex items-center justify-center">
                <Icon.Bank style={{ width: 18, height: 18, color: '#6366F1' }} />
              </span>
              <div>
                <div className="font-semibold text-[14px]">Conta bancária</div>
                <div className="text-[12.5px] text-slate-500">Nenhuma conta configurada</div>
              </div>
            </div>
            <p className="text-[13.5px] text-slate-500 leading-relaxed mb-5">
              Configure sua conta bancária para receber os valores arrecadados nos seus eventos.
            </p>
            <DashBtn variant="primary" onClick={() => navigate('/verificacao')}>
              Configurar conta bancária
            </DashBtn>
          </div>
        </div>
      </div>
    )
  }

  if (kycStatus === 'recipient_created') {
    return (
      <div>
        <PageHead eyebrow="Conta" title="Configurações" />
        <div className="max-w-[520px] w-full">
          <PayoutCard gradient="linear-gradient(140deg,#312E81 0%,#4338CA 45%,#7C3AED 100%)">
            <div className="flex justify-between items-start mb-5">
              <div className="text-[12px] font-semibold opacity-70 tracking-[0.08em] uppercase">Conta Celebre</div>
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#FDE68A', border: '1px solid rgba(251,191,36,0.3)' }}>
                Em verificação
              </span>
            </div>
            <div className="font-display text-xl font-bold">{user?.name}</div>
            <div className="text-[13px] opacity-65 mt-1">Verificação em andamento pelo Pagar.me</div>
          </PayoutCard>
          <div className="bg-white rounded-2xl border border-slate-200 p-[16px_18px] flex items-center gap-3">
            <Icon.RefreshCw style={{ width: 18, height: 18, color: '#6366F1', flexShrink: 0 }} />
            <div className="text-[13px] text-slate-500 leading-snug">
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
        <div className="max-w-[520px] w-full">
          <PayoutCard gradient="linear-gradient(140deg,#312E81 0%,#4338CA 45%,#6D28D9 100%)">
            <div className="flex justify-between items-start mb-5">
              <div className="text-[12px] font-semibold opacity-70 tracking-[0.08em] uppercase">Conta Celebre</div>
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.2)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.3)' }}>
                KYC aprovado
              </span>
            </div>
            <div className="font-display text-xl font-bold">{user?.name}</div>
            <div className="text-[13px] opacity-65 mt-1">Finalize adicionando sua conta bancária</div>
          </PayoutCard>
          <div className="bg-white rounded-2xl border border-slate-200 p-[16px_18px] flex items-center justify-between gap-3">
            <div className="text-[13px] text-slate-500">
              Identidade verificada. Adicione uma conta bancária para receber saques.
            </div>
            <DashBtn variant="primary" onClick={() => navigate('/verificacao')} className="h-9 !px-4 !text-[13px] shrink-0">
              Adicionar conta
            </DashBtn>
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
        <div className="max-w-[520px] w-full">
          <PayoutCard gradient="linear-gradient(140deg,#0F172A 0%,#1E293B 55%,#334155 100%)">
            <div className="flex justify-between items-start mb-5">
              <div className="text-[12px] font-semibold opacity-70 tracking-[0.08em] uppercase">Conta Celebre</div>
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'rgba(52,211,153,0.2)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.3)' }}>
                <Icon.Check style={{ width: 10, height: 10 }} />Verificado
              </span>
            </div>
            <div className="font-display text-xl font-bold">{user?.name}</div>
            <div className="text-[13px] opacity-65 mt-1 font-mono">{bname ?? user?.bankCode}</div>
          </PayoutCard>
          <div className="bg-white rounded-2xl border border-slate-200 p-[16px_18px]">
            <div className="flex items-center gap-2.5">
              <Icon.ShieldCheck style={{ width: 18, height: 18, color: '#10B981', flexShrink: 0 }} />
              <div className="text-[13px] text-emerald-900 font-medium">Conta bancária verificada e ativa</div>
            </div>
            <div className="text-[12.5px] text-slate-500 mt-1.5">
              Seus saques serão transferidos diretamente para a conta bancária cadastrada no Pagar.me.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHead eyebrow="Conta" title="Configurações" />
      <div className="max-w-[520px]">
        <PayoutCard gradient="linear-gradient(140deg,#1E293B 0%,#27272A 55%,#3F3F46 100%)">
          <div className="flex justify-between items-start mb-5">
            <div className="text-[12px] font-semibold opacity-70 tracking-[0.08em] uppercase">Conta Celebre</div>
            <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)' }}>
              Rejeitada
            </span>
          </div>
          <div className="font-display text-xl font-bold">{user?.name}</div>
          <div className="text-[13px] opacity-65 mt-1">Verificação não aprovada</div>
        </PayoutCard>
        <div className="bg-white rounded-2xl border border-slate-200 p-[16px_18px]">
          <div className="flex items-center gap-2.5 mb-2">
            <Icon.AlertCircle style={{ width: 18, height: 18, color: '#EF4444', flexShrink: 0 }} />
            <div className="text-[13px] text-red-900 font-semibold">Verificação rejeitada pelo Pagar.me</div>
          </div>
          <div className="text-[12.5px] text-slate-500 leading-relaxed">
            Entre em contato com o suporte da Celebre para mais informações sobre o processo de verificação.
          </div>
        </div>
      </div>
    </div>
  )
}
