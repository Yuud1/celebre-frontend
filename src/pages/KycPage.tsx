import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthStepList } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { maskCPF, maskPhone, maskCEP, maskDate, maskPIXKey } from '../lib/mask'

const KYC_STEPS = ['Identidade', 'Endereço', 'Documentos', 'Recebimentos', 'Revisão']

// ─── Shell ────────────────────────────────────────────────────
function KycShell({
  step,
  children,
  footer,
}: {
  step: number
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const progress = (step / (KYC_STEPS.length - 1)) * 100

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderBottom: '1px solid #E2E8F0',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AuthLogo size={17} />
          <span style={{ width: 1, height: 22, background: '#E2E8F0' }} />
          <span style={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Verificação de identidade</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="ca-badge">
            <Icon.ShieldCheck style={{ width: 12, height: 12, color: '#10B981' }} />
            Conexão segura · TLS 1.3
          </span>
          <button style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon.X style={{ width: 13, height: 13 }} />
            Sair sem salvar
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside
          style={{
            background: '#fff',
            borderRight: '1px solid #E2E8F0',
            padding: '28px 18px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div className="ca-eyebrow" style={{ paddingLeft: 12, marginBottom: 14 }}>5 etapas · ~ 4 min</div>
          <AuthStepList items={KYC_STEPS} current={step} />

          <div style={{ marginTop: 'auto', padding: '14px 12px', background: '#F8FAFC', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>Progresso</span>
              <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 600 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: 6, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: progress + '%',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  borderRadius: 999,
                  transition: 'width .4s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 10, lineHeight: 1.4 }}>
              Suas informações são criptografadas e usadas apenas para verificação regulatória.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 11.5, color: '#94A3B8' }}>
            <Icon.Lock style={{ width: 12, height: 12 }} />
            LGPD · BACEN · ISO 27001
          </div>
        </aside>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '40px 56px' }}>
          {children}
          {footer && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36 }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Trust note ───────────────────────────────────────────────
function TrustNote({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'success' }) {
  const colors = {
    info: { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.2)', icon: '#6366F1', iconBg: 'rgba(99,102,241,0.12)' },
    success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', icon: '#10B981', iconBg: 'rgba(16,185,129,0.12)' },
  }
  const c = colors[tone]
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '14px 16px',
        background: c.bg,
        border: '1px solid ' + c.border,
        borderRadius: 14,
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: c.iconBg,
          color: c.icon,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon.Shield style={{ width: 16, height: 16 }} />
      </span>
      <div style={{ fontSize: 13, lineHeight: 1.55, color: '#334155' }}>{children}</div>
    </div>
  )
}

// ─── Upload card ──────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'validating' | 'success'

function UploadCard({
  icon,
  title,
  state,
  fileName,
  progress = 0,
}: {
  icon: React.ReactNode
  title: string
  state: UploadState
  fileName?: string
  progress?: number
}) {
  const isActive = state === 'uploading' || state === 'validating'
  const isDone = state === 'success'
  let cls = 'ca-upload'
  if (isActive) cls += ' ca-upload--active'
  if (isDone) cls += ' ca-upload--done'

  return (
    <div className={cls} style={{ minHeight: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: isDone ? 'rgba(16,185,129,0.14)' : '#fff',
            color: isDone ? '#10B981' : '#475569',
            border: isDone ? 'none' : '1px solid #E2E8F0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDone ? <Icon.Check style={{ width: 16, height: 16 }} /> : icon}
        </span>
        <span className={'ca-badge ' + (isDone ? 'ca-badge--success' : isActive ? 'ca-badge--violet' : '')}>
          {state === 'idle' && 'Aguardando'}
          {state === 'uploading' && 'Enviando…'}
          {state === 'validating' && 'Validando…'}
          {state === 'success' && 'Pronto'}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em', marginBottom: 6 }}>{title}</div>

        {state === 'idle' && (
          <>
            <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.55 }}>
              Arraste e solte ou clique para selecionar.
              <br />
              <span style={{ color: '#94A3B8' }}>JPG, PNG, PDF · até 10 MB</span>
            </div>
            <AuthBtn variant="ghost" style={{ marginTop: 14, height: 38, fontSize: 13 }} icon={<Icon.Upload style={{ width: 14, height: 14 }} />}>
              Selecionar arquivo
            </AuthBtn>
          </>
        )}

        {(state === 'uploading' || state === 'validating') && (
          <>
            <div style={{ fontSize: 12.5, color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>{fileName}</div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, color: '#475569' }}>
                  {state === 'uploading' ? 'Carregando' : 'Validando autenticidade'}
                </span>
                <span style={{ fontSize: 11.5, color: '#0F172A', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {state === 'validating' ? '—' : progress + '%'}
                </span>
              </div>
              <div style={{ height: 6, background: '#fff', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                {state === 'uploading' ? (
                  <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: 999 }} />
                ) : (
                  <div className="ca-shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 999 }} />
                )}
              </div>
            </div>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{ fontSize: 12.5, color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>{fileName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12.5, color: '#047857' }}>
              <Icon.ShieldCheck style={{ width: 14, height: 14 }} />
              Documento validado · qualidade ótima
            </div>
            <button style={{ marginTop: 10, fontSize: 12, color: '#6366F1', fontWeight: 500 }}>Trocar arquivo</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Review row ───────────────────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderTop: '1px solid #EEF2F7',
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: '#94A3B8', letterSpacing: '0.02em' }}>{label}</div>
        <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
      <button style={{ fontSize: 12.5, color: '#6366F1', fontWeight: 600, marginTop: 2 }}>Editar</button>
    </div>
  )
}

// ─── Step 0 — Dados pessoais ──────────────────────────────────
function StepIdentidade({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phone, setPhone] = useState('')
  const [nationality, setNationality] = useState('Brasileira')

  return (
    <KycShell
      step={0}
      footer={
        <>
          <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>Voltar</AuthBtn>
          <AuthBtn variant="primary" size="lg" onClick={onNext} iconRight={<Icon.ArrowRight style={{ width: 16, height: 16 }} />} style={{ minWidth: 220 }}>Continuar</AuthBtn>
        </>
      }
    >
      <div style={{ maxWidth: 620 }}>
        <div className="ca-eyebrow" style={{ marginBottom: 8 }}>Etapa 1 de 5</div>
        <h1 className="ca-display" style={{ fontSize: 30, marginBottom: 10 }}>Vamos verificar sua identidade</h1>
        <p style={{ fontSize: 14.5, color: '#64748B', marginBottom: 22, maxWidth: 520 }}>
          Para liberar saques e proteger seus convidados, precisamos confirmar quem você é. As informações seguem o padrão BACEN para contas de pagamento.
        </p>

        <TrustNote>
          <strong style={{ color: '#0F172A' }}>Por que pedimos isso? </strong>
          A verificação de identidade (KYC) é exigida por lei para qualquer plataforma que movimente dinheiro. Seus dados não são compartilhados com terceiros e podem ser excluídos a qualquer momento.
        </TrustNote>

        <div className="ca-card" style={{ padding: 28, marginTop: 24 }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Dados pessoais</h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 22px' }}>Devem coincidir exatamente com seu documento oficial.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AuthField label="Nome completo (como no documento)">
              <AuthInput icon={<Icon.User style={{ width: 16, height: 16 }} />} type="text" placeholder="Júlia Mendes Oliveira" value={fullName} onChange={e => setFullName(e.target.value)} />
            </AuthField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <AuthField label="CPF" hint="Apenas pessoa física por enquanto">
                <AuthInput icon={<Icon.Doc style={{ width: 16, height: 16 }} />} type="text" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} />
              </AuthField>
              <AuthField label="Data de nascimento">
                <AuthInput icon={<Icon.Calendar style={{ width: 16, height: 16 }} />} type="text" placeholder="dd/mm/aaaa" value={birthDate} onChange={e => setBirthDate(maskDate(e.target.value))} />
              </AuthField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <AuthField label="Telefone celular" hint="Usado para verificação em 2 etapas">
                <AuthInput icon={<Icon.Phone style={{ width: 16, height: 16 }} />} type="tel" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(maskPhone(e.target.value))} />
              </AuthField>
              <AuthField label="Nacionalidade">
                <AuthInput icon={<Icon.Globe style={{ width: 16, height: 16 }} />} type="text" value={nationality} onChange={e => setNationality(e.target.value)} />
              </AuthField>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #EEF2F7',
                marginTop: 6,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.ShieldCheck style={{ width: 14, height: 14, color: '#10B981' }} />
              </span>
              <span style={{ fontSize: 12.5, color: '#475569' }}>
                Validaremos seu CPF junto à Receita Federal automaticamente. Leva ~5 segundos.
              </span>
            </div>
          </div>
        </div>
      </div>
    </KycShell>
  )
}

// ─── Step 1 — Endereço ────────────────────────────────────────
function StepEndereco({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const [sameMailing, setSameMailing] = useState(true)
  const [zipCode, setZipCode] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [stateUF, setStateUF] = useState('')

  return (
    <KycShell
      step={1}
      footer={
        <>
          <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>Voltar</AuthBtn>
          <AuthBtn variant="primary" size="lg" onClick={onNext} iconRight={<Icon.ArrowRight style={{ width: 16, height: 16 }} />} style={{ minWidth: 220 }}>Continuar</AuthBtn>
        </>
      }
    >
      <div style={{ maxWidth: 620 }}>
        <div className="ca-eyebrow" style={{ marginBottom: 8 }}>Etapa 2 de 5</div>
        <h1 className="ca-display" style={{ fontSize: 30, marginBottom: 10 }}>Endereço residencial</h1>
        <p style={{ fontSize: 14.5, color: '#64748B', marginBottom: 28, maxWidth: 520 }}>
          Usado apenas para comprovação cadastral. Você pode informar o mesmo endereço do seu documento.
        </p>

        <div className="ca-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14 }}>
              <AuthField label="CEP" hint="Busca automática">
                <AuthInput
                  icon={<Icon.Pin style={{ width: 16, height: 16 }} />}
                  suffix={<Icon.Loader style={{ width: 14, height: 14, color: '#6366F1' }} />}
                  type="text"
                  placeholder="00000-000"
                  value={zipCode}
                  onChange={e => setZipCode(maskCEP(e.target.value))}
                />
              </AuthField>
              <AuthField label="Endereço (rua / avenida)">
                <AuthInput type="text" placeholder="Nome da rua ou avenida" value={street} onChange={e => setStreet(e.target.value)} />
              </AuthField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 14 }}>
              <AuthField label="Número">
                <AuthInput type="text" placeholder="000" value={streetNumber} onChange={e => setStreetNumber(e.target.value)} />
              </AuthField>
              <AuthField label="Complemento (opcional)">
                <AuthInput type="text" placeholder="Apto, Bloco..." value={complement} onChange={e => setComplement(e.target.value)} />
              </AuthField>
            </div>

            <AuthField label="Bairro">
              <AuthInput type="text" placeholder="Nome do bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
            </AuthField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 14 }}>
              <AuthField label="Cidade">
                <AuthInput icon={<Icon.Pin style={{ width: 16, height: 16 }} />} type="text" placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} />
              </AuthField>
              <AuthField label="Estado">
                <AuthInput type="text" placeholder="UF" maxLength={2} style={{ textTransform: 'uppercase' }} value={stateUF} onChange={e => setStateUF(e.target.value.toUpperCase())} />
              </AuthField>
            </div>

            <button
              type="button"
              className={'ca-check' + (sameMailing ? ' ca-check--on' : '')}
              onClick={() => setSameMailing(v => !v)}
            >
              <span className="ca-check__box">
                {sameMailing && <Icon.Check style={{ width: 10, height: 10 }} />}
              </span>
              <span>Este é também meu endereço para correspondências</span>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <TrustNote>
            <strong style={{ color: '#0F172A' }}>Privacidade: </strong>
            Seu endereço nunca é exibido na sua página de evento pública. Visível apenas para você e para nossa equipe de compliance.
          </TrustNote>
        </div>
      </div>
    </KycShell>
  )
}

// ─── Step 2 — Documentos ─────────────────────────────────────
function StepDocumentos({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <KycShell
      step={2}
      footer={
        <>
          <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>Voltar</AuthBtn>
          <AuthBtn variant="primary" size="lg" onClick={onNext} iconRight={<Icon.ArrowRight style={{ width: 16, height: 16 }} />} style={{ minWidth: 220 }}>Continuar</AuthBtn>
        </>
      }
    >
      <div style={{ maxWidth: 860 }}>
        <div className="ca-eyebrow" style={{ marginBottom: 8 }}>Etapa 3 de 5</div>
        <h1 className="ca-display" style={{ fontSize: 30, marginBottom: 10 }}>Envie seus documentos</h1>
        <p style={{ fontSize: 14.5, color: '#64748B', marginBottom: 24, maxWidth: 580 }}>
          Aceitamos RG ou CNH. As imagens devem estar nítidas, sem reflexos e com todas as bordas visíveis. A verificação leva até 24h úteis (média: 2 minutos).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <UploadCard
            icon={<Icon.Doc style={{ width: 18, height: 18 }} />}
            title="Frente do documento"
            state="success"
            fileName="rg-frente.jpg · 1.8 MB"
          />
          <UploadCard
            icon={<Icon.Doc style={{ width: 18, height: 18 }} />}
            title="Verso do documento"
            state="uploading"
            fileName="rg-verso.jpg · 2.1 MB"
            progress={68}
          />
          <UploadCard
            icon={<Icon.Camera style={{ width: 18, height: 18 }} />}
            title="Selfie com documento"
            state="validating"
            fileName="selfie.jpg · 3.4 MB"
          />
        </div>

        <div className="ca-card" style={{ padding: 24, marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Icon.ShieldCheck style={{ width: 16, height: 16, color: '#10B981' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14 }}>Como tirar a foto certa</span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#475569', fontSize: 13, lineHeight: 1.7 }}>
              <li>Mantenha o documento sobre fundo neutro</li>
              <li>Boa iluminação, sem flash direto</li>
              <li>Todas as bordas visíveis</li>
              <li>Sem reflexos ou cortes</li>
            </ul>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Icon.Camera style={{ width: 16, height: 16, color: '#6366F1' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14 }}>Selfie de verificação</span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#475569', fontSize: 13, lineHeight: 1.7 }}>
              <li>Segure o documento ao lado do rosto</li>
              <li>Rosto e documento devem estar legíveis</li>
              <li>Não use óculos escuros ou bonés</li>
              <li>Apenas a pessoa titular pode aparecer</li>
            </ul>
          </div>
        </div>
      </div>
    </KycShell>
  )
}

// ─── Step 3 — Recebimentos ────────────────────────────────────
function StepRecebimentos({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const [method, setMethod] = useState<'pix' | 'bank'>('pix')
  const [autoTransfer, setAutoTransfer] = useState(true)
  const keyTypes = ['CPF', 'E-mail', 'Telefone', 'Aleatória']
  const [keyType, setKeyType] = useState(0)
  const [pixKey, setPixKey] = useState('')

  return (
    <KycShell
      step={3}
      footer={
        <>
          <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>Voltar</AuthBtn>
          <AuthBtn variant="primary" size="lg" onClick={onNext} iconRight={<Icon.ArrowRight style={{ width: 16, height: 16 }} />} style={{ minWidth: 220 }}>Continuar</AuthBtn>
        </>
      }
    >
      <div style={{ maxWidth: 700 }}>
        <div className="ca-eyebrow" style={{ marginBottom: 8 }}>Etapa 4 de 5</div>
        <h1 className="ca-display" style={{ fontSize: 30, marginBottom: 10 }}>Para onde enviamos seu dinheiro?</h1>
        <p style={{ fontSize: 14.5, color: '#64748B', marginBottom: 24, maxWidth: 540 }}>
          Configure como deseja receber as contribuições do seu evento. Você pode editar ou adicionar contas a qualquer momento.
        </p>

        {/* Method picker */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <button
            type="button"
            className={'ca-pick' + (method === 'pix' ? ' ca-pick--on' : '')}
            onClick={() => setMethod('pix')}
            style={{ padding: 18 }}
          >
            {method === 'pix' && <span className="ca-pick__check"><Icon.Check style={{ width: 11, height: 11 }} /></span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: method === 'pix' ? 'linear-gradient(135deg,#32BCAD,#0D7269)' : '#F8FAFC',
                  color: method === 'pix' ? '#fff' : '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all .2s',
                }}
              >
                <Icon.Pix style={{ width: 22, height: 22 }} />
              </span>
              <div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  PIX
                  <span className="ca-badge ca-badge--success" style={{ padding: '2px 8px' }}>Recomendado</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>Repasse em até 30 segundos · sem taxa</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            className={'ca-pick' + (method === 'bank' ? ' ca-pick--on' : '')}
            onClick={() => setMethod('bank')}
            style={{ padding: 18 }}
          >
            {method === 'bank' && <span className="ca-pick__check"><Icon.Check style={{ width: 11, height: 11 }} /></span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: method === 'bank' ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : '#F8FAFC',
                  color: method === 'bank' ? '#fff' : '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all .2s',
                }}
              >
                <Icon.Bank style={{ width: 22, height: 22 }} />
              </span>
              <div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>Conta bancária</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>TED em D+1 · taxa zero</div>
              </div>
            </div>
          </button>
        </div>

        {method === 'pix' && (
          <div className="ca-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Icon.Pix style={{ width: 16, height: 16, color: '#0D7269' }} />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 600, margin: 0 }}>Chave PIX para recebimento</h3>
            </div>

            <AuthField label="Tipo de chave">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {keyTypes.map((k, i) => (
                  <button
                    key={k}
                    type="button"
                    className="ca-btn ca-btn--ghost"
                    style={{
                      height: 42,
                      fontSize: 13,
                      background: keyType === i ? '#0F172A' : '#fff',
                      color: keyType === i ? '#fff' : '#475569',
                      borderColor: keyType === i ? '#0F172A' : '#E2E8F0',
                    }}
                    onClick={() => setKeyType(i)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </AuthField>

            <div style={{ marginTop: 16 }}>
              <AuthField label="Chave PIX" hint="✓ Deve estar registrada no CPF informado" hintTone="ok">
                <AuthInput
                  icon={<Icon.Pix style={{ width: 16, height: 16 }} />}
                  suffix={<span style={{ color: '#10B981', fontWeight: 600, fontSize: 12 }}>✓ Validada</span>}
                  suffixPill
                  type="text"
                  placeholder="000.000.000-00"
                  value={pixKey}
                  onChange={e => setPixKey(maskPIXKey(e.target.value, keyTypes[keyType] as 'CPF' | 'E-mail' | 'Telefone' | 'Aleatória'))}
                />
              </AuthField>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: '14px 16px',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #EEF2F7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#fff',
                      border: '1px solid #E2E8F0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.User style={{ width: 14, height: 14, color: '#475569' }} />
                  </span>
                  <div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Titular conforme registro DICT</div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, marginTop: 1 }}>
                      Júlia M. Oliveira · Banco Inter
                    </div>
                  </div>
                </div>
                <span className="ca-badge ca-badge--success">
                  <Icon.Check style={{ width: 11, height: 11 }} />
                  Confere com CPF
                </span>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid #EEF2F7', margin: '20px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14 }}>Repasse automático</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>Transferir cada contribuição assim que recebida</div>
              </div>
              <button
                type="button"
                onClick={() => setAutoTransfer(v => !v)}
                style={{
                  width: 44,
                  height: 26,
                  borderRadius: 999,
                  background: autoTransfer ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#E2E8F0',
                  position: 'relative',
                  transition: 'background .2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: autoTransfer ? undefined : 3,
                    right: autoTransfer ? 3 : undefined,
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.18)',
                    transition: 'left .2s, right .2s',
                  }}
                />
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <TrustNote tone="success">
            <strong style={{ color: '#0F172A' }}>Repasse seguro: </strong>
            O dinheiro só sai da conta de garantia depois que o evento for verificado. Você recebe um comprovante a cada transferência.
          </TrustNote>
        </div>
      </div>
    </KycShell>
  )
}

// ─── Step 4 — Revisão ─────────────────────────────────────────
function StepRevisao({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <KycShell
      step={4}
      footer={
        <>
          <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>Voltar</AuthBtn>
          <AuthBtn
            variant="primary"
            size="lg"
            onClick={onNext}
            iconRight={<Icon.ShieldCheck style={{ width: 16, height: 16 }} />}
            style={{ minWidth: 260 }}
          >
            Finalizar verificação
          </AuthBtn>
        </>
      }
    >
      <div style={{ maxWidth: 740 }}>
        <div className="ca-eyebrow" style={{ marginBottom: 8 }}>Etapa 5 de 5 · Revisão</div>
        <h1 className="ca-display" style={{ fontSize: 30, marginBottom: 10 }}>Confirme antes de enviar</h1>
        <p style={{ fontSize: 14.5, color: '#64748B', marginBottom: 28, maxWidth: 540 }}>
          Revise todas as informações. Após o envio, nossa equipe de compliance analisa em até 24h úteis.
        </p>

        {/* Identidade */}
        <div className="ca-card" style={{ padding: '6px 24px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.User style={{ width: 16, height: 16, color: '#6366F1' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>Identidade</span>
            </div>
            <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 11, height: 11 }} /> Completo</span>
          </div>
          <ReviewRow label="Nome completo" value="Júlia Mendes Oliveira" />
          <ReviewRow label="CPF" value="123.456.789-00" />
          <ReviewRow label="Nascimento" value="14 de março de 1992" />
          <ReviewRow label="Telefone" value="+55 (48) 99876-5432" />
        </div>

        {/* Endereço */}
        <div className="ca-card" style={{ padding: '6px 24px 18px', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Pin style={{ width: 16, height: 16, color: '#6366F1' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>Endereço</span>
            </div>
            <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 11, height: 11 }} /> Completo</span>
          </div>
          <ReviewRow label="Endereço" value="Av. Beira-Mar Norte, 1820 · Apto 1204 — Bloco A" />
          <ReviewRow label="Cidade / Estado" value="Florianópolis, Santa Catarina · 88010-400" />
        </div>

        {/* Documentos */}
        <div className="ca-card" style={{ padding: '6px 24px 18px', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Doc style={{ width: 16, height: 16, color: '#6366F1' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>Documentos enviados</span>
            </div>
            <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 11, height: 11 }} /> 3 de 3</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, borderTop: '1px solid #EEF2F7', paddingTop: 14 }}>
            {[
              { t: 'Frente RG', f: 'rg-frente.jpg' },
              { t: 'Verso RG', f: 'rg-verso.jpg' },
              { t: 'Selfie', f: 'selfie.jpg' },
            ].map(d => (
              <div
                key={d.t}
                style={{ padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #EEF2F7' }}
              >
                <div className="ca-ph" style={{ height: 60, borderRadius: 8 }} />
                <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 600 }}>{d.t}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{d.f}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recebimentos */}
        <div className="ca-card" style={{ padding: '6px 24px 18px', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Pix style={{ width: 16, height: 16, color: '#6366F1' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15 }}>Recebimentos</span>
            </div>
            <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 11, height: 11 }} /> Completo</span>
          </div>
          <ReviewRow label="Chave PIX (CPF)" value="123.456.789-00 · Banco Inter" />
          <ReviewRow label="Repasse automático" value="Ativo · transferência imediata" />
        </div>

        {/* Terms */}
        <div style={{ marginTop: 24, padding: 18, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14 }}>
          <button
            type="button"
            className={'ca-check' + (agreed ? ' ca-check--on' : '')}
            onClick={() => setAgreed(v => !v)}
            style={{ alignItems: 'flex-start', gap: 10 }}
          >
            <span className="ca-check__box" style={{ marginTop: 2 }}>
              {agreed && <Icon.Check style={{ width: 10, height: 10 }} />}
            </span>
            <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
              Declaro que as informações fornecidas são verdadeiras e concordo com os{' '}
              <a href="#" style={{ color: '#6366F1', fontWeight: 500 }}>Termos de Conta de Pagamento</a>,{' '}
              <a href="#" style={{ color: '#6366F1', fontWeight: 500 }}>Política Anti-Lavagem (PLD)</a>{' '}
              e autorizo a consulta cadastral junto à Receita Federal e ao Banco Central.
            </span>
          </button>
        </div>
      </div>
    </KycShell>
  )
}

// ─── Success ──────────────────────────────────────────────────
function KycSuccess() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        height: '100%',
        background: 'linear-gradient(180deg, #FAFAFF 0%, #F5F3FF 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid #EEF2F7',
        }}
      >
        <AuthLogo />
        <button
          style={{ fontSize: 13, color: '#64748B' }}
          onClick={() => navigate('/dashboard')}
        >
          Ir para o painel →
        </button>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        {/* Left — celebration */}
        <div
          style={{
            padding: '64px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '12%',
              right: '8%',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />

          {/* Success ring */}
          <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
            <div
              className="ca-pulse-ring"
              style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(16,185,129,0.12)' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 50px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <Icon.Check style={{ width: 48, height: 48, color: '#fff' }} />
            </div>
          </div>

          <div className="ca-eyebrow" style={{ color: '#047857', marginBottom: 12 }}>Verificação enviada</div>
          <h1
            className="ca-display"
            style={{ fontSize: 44, lineHeight: 1.05, margin: '0 0 14px', maxWidth: 440 }}
          >
            Tudo pronto,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Júlia
            </span>
            .
          </h1>
          <p style={{ color: '#475569', fontSize: 16, margin: '0 0 32px', maxWidth: 460, lineHeight: 1.5 }}>
            Sua identidade foi enviada para análise. Você já pode começar a personalizar a página do seu evento — avisamos por e-mail assim que a verificação for concluída.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <AuthBtn
              variant="primary"
              size="lg"
              iconRight={<Icon.ArrowRight style={{ width: 18, height: 18 }} />}
              style={{ minWidth: 240 }}
              onClick={() => navigate('/criar')}
            >
              Personalizar minha página
            </AuthBtn>
            <AuthBtn variant="ghost" size="lg" onClick={() => navigate('/dashboard')}>
              Ver painel
            </AuthBtn>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 40, color: '#64748B', fontSize: 12.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.Mail style={{ width: 14, height: 14 }} /> Notificação por e-mail
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.Phone style={{ width: 14, height: 14 }} /> SMS de confirmação
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.ShieldCheck style={{ width: 14, height: 14, color: '#10B981' }} /> Conta protegida
            </div>
          </div>
        </div>

        {/* Right — timeline */}
        <div
          style={{
            padding: '64px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          <div className="ca-card ca-card--lift" style={{ padding: 28, maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 16 }}>Status da verificação</span>
              <span className="ca-badge ca-badge--warn">
                <span style={{ width: 6, height: 6, borderRadius: 999, background: '#F59E0B' }} />
                Em análise
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 22 }}>
              Tempo médio: <strong style={{ color: '#0F172A' }}>2 minutos</strong> · Limite: 24h úteis
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: 10, top: 16, bottom: 16, width: 2, background: '#E2E8F0' }} />
              {[
                { t: 'Informações enviadas', d: 'Agora · verificado', state: 'done' },
                { t: 'Verificação automática', d: 'Em andamento', state: 'active' },
                { t: 'Análise por compliance', d: 'Em até 24h', state: 'todo' },
                { t: 'Conta totalmente liberada', d: 'Saques desbloqueados', state: 'todo' },
              ].map((it, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 18 }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: -28,
                      top: 1,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: it.state === 'done' ? '#10B981' : '#fff',
                      border: it.state === 'active' ? '2px solid #6366F1' : it.state === 'todo' ? '2px solid #E2E8F0' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: it.state === 'active' ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none',
                    }}
                  >
                    {it.state === 'done' && <Icon.Check style={{ width: 12, height: 12 }} />}
                    {it.state === 'active' && <span style={{ width: 7, height: 7, borderRadius: 999, background: '#6366F1' }} />}
                  </span>
                  <div style={{ fontWeight: 600, fontSize: 14, color: it.state === 'todo' ? '#94A3B8' : '#0F172A' }}>{it.t}</div>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>{it.d}</div>
                </div>
              ))}
            </div>

            <hr style={{ border: 0, borderTop: '1px solid #EEF2F7', margin: '12px 0 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#475569' }}>
              <Icon.Info style={{ width: 14, height: 14, color: '#6366F1' }} />
              Enquanto verificamos, você pode receber contribuições — só os saques ficam temporariamente bloqueados.
            </div>
          </div>

          {/* Next steps */}
          <div
            style={{
              marginTop: 20,
              padding: 22,
              borderRadius: 18,
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.18)',
              maxWidth: 460,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Icon.Sparkle style={{ width: 14, height: 14, color: '#8B5CF6' }} />
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14 }}>Enquanto isso, comece por aqui</span>
            </div>
            {[
              ['Adicionar foto do casal', '2 min'],
              ['Definir lista de presentes', '5 min'],
              ['Compartilhar com a família', '1 min'],
            ].map(([t, m]) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#fff',
                  borderRadius: 10,
                  border: '1px solid rgba(99,102,241,0.12)',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: 'rgba(99,102,241,0.1)',
                      color: '#6366F1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.Plus style={{ width: 12, height: 12 }} />
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t}</span>
                </div>
                <span style={{ fontSize: 11.5, color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── KycPage ─────────────────────────────────────────────────
export function KycPage() {
  const [step, setStep] = useState(0)

  const next = () => setStep(s => s + 1)
  const prev = () => setStep(s => Math.max(0, s - 1))

  if (step === 5) {
    return (
      <div className="auth-page ca-root">
        <KycSuccess />
      </div>
    )
  }

  return (
    <div className="auth-page ca-root">
      {step === 0 && <StepIdentidade onPrev={prev} onNext={next} />}
      {step === 1 && <StepEndereco onPrev={prev} onNext={next} />}
      {step === 2 && <StepDocumentos onPrev={prev} onNext={next} />}
      {step === 3 && <StepRecebimentos onPrev={prev} onNext={next} />}
      {step === 4 && <StepRevisao onPrev={prev} onNext={next} />}
    </div>
  )
}
