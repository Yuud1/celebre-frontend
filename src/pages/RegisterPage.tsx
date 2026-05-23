import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthStepBar } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { maskCPF } from '../lib/mask'

const STEP_LABELS = ['Conta', 'Tipo de evento', 'Informações', 'Template']

// ─── Shell ────────────────────────────────────────────────────
function RegisterShell({ step, total = 4, dense = false, children }: { step: number; total?: number; dense?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <AuthLogo size={17} />
        <div style={{ flex: 1, maxWidth: 280 }}>
          <AuthStepBar total={total} current={step} />
        </div>
        <span style={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 500 }}>Passo {step + 1} de {total}</span>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/login" style={{ fontSize: 13.5, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>
            Já tem conta? <span style={{ color: '#6366F1', fontWeight: 600 }}>Entrar</span>
          </Link>
        </div>
      </div>

      {/* Sub-bar with step labels */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        {STEP_LABELS.map((label, i) => {
          const done = i < step
          const active = i === step
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '10px 0',
                borderBottom: active ? '2px solid #6366F1' : '2px solid transparent',
                fontSize: 12.5,
                fontWeight: active ? 600 : 500,
                color: active ? '#0F172A' : done ? '#64748B' : '#94A3B8',
                transition: 'all .15s',
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  background: done ? '#10B981' : active ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : '#E2E8F0',
                  color: done || active ? '#fff' : '#94A3B8',
                  flexShrink: 0,
                }}
              >
                {done ? <Icon.Check style={{ width: 9, height: 9 }} /> : i + 1}
              </span>
              {label}
            </div>
          )
        })}
      </div>

      {/* Content grid */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: dense ? '1fr' : '1fr 1fr' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Side panel ───────────────────────────────────────────────
function RegisterSidePanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 60%, #FDF4FF 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 40px',
      }}
    >
      {/* Blurred orbs */}
      <div style={{ position: 'absolute', width: 300, height: 300, top: -80, right: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 200, height: 200, bottom: 40, left: -60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Step 1 ───────────────────────────────────────────────────
function Step1({ onNext }: { onNext: () => void }) {
  const [showPass, setShowPass] = useState(false)
  const [terms, setTerms] = useState(false)
  const [cpf, setCpf] = useState('')

  return (
    <>
      {/* Form side */}
      <div style={{ overflowY: 'auto', padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380 }}>
          <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Passo 1 · Crie sua conta</div>
          <h2 className="ca-display" style={{ fontSize: 28, marginBottom: 8 }}>Comece gratuitamente</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>Crie sua conta e monte sua página em minutos.</p>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={e => e.preventDefault()}>
            <AuthField label="Nome completo">
              <AuthInput icon={<Icon.User style={{ width: 18, height: 18 }} />} type="text" placeholder="Seu nome" />
            </AuthField>

            <AuthField label="E-mail">
              <AuthInput icon={<Icon.Mail style={{ width: 18, height: 18 }} />} type="email" placeholder="seu@email.com" />
            </AuthField>

            <AuthField label="CPF">
              <AuthInput icon={<Icon.Doc style={{ width: 18, height: 18 }} />} type="text" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} />
            </AuthField>

            <AuthField label="Senha">
              <AuthInput
                icon={<Icon.Lock style={{ width: 18, height: 18 }} />}
                suffix={
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ display: 'flex', alignItems: 'center', color: '#64748B' }}>
                    <Icon.Eye style={{ width: 16, height: 16 }} />
                  </button>
                }
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
              />
              {/* Password strength */}
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i < 3 ? '#10B981' : '#E2E8F0' }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 500 }}>Forte</div>
            </AuthField>

            {/* Terms */}
            <button
              type="button"
              className={'ca-check' + (terms ? ' ca-check--on' : '')}
              onClick={() => setTerms(v => !v)}
              style={{ alignItems: 'flex-start', gap: 10 }}
            >
              <span className="ca-check__box" style={{ marginTop: 1 }}>
                {terms && <Icon.Check style={{ width: 10, height: 10 }} />}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                Aceito os{' '}
                <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 500 }}>Termos de Uso</a>
                {' '}e a{' '}
                <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 500 }}>Política de Privacidade</a>
              </span>
            </button>

            <AuthBtn variant="primary" block size="lg" style={{ marginTop: 8 }} iconRight={<Icon.ArrowRight style={{ width: 18, height: 18 }} />} onClick={onNext}>
              Continuar
            </AuthBtn>
          </form>
        </div>
      </div>

      {/* Side panel */}
      <RegisterSidePanel>
        <div className="ca-eyebrow" style={{ marginBottom: 12 }}>Por que Celebre</div>
        <h3 className="ca-display" style={{ fontSize: 22, marginBottom: 20 }}>Tudo que você precisa para celebrar</h3>

        {/* URL preview card */}
        <div className="ca-card ca-card--lift" style={{ padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>celebre.app/</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>julia-e-marcos</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <span className="ca-badge ca-badge--success"><Icon.Check style={{ width: 10, height: 10 }} />Disponível</span>
            <span className="ca-badge ca-badge--violet"><Icon.Sparkle style={{ width: 10, height: 10 }} />Personalizado</span>
          </div>
        </div>

        {/* Features */}
        {[
          { icon: <Icon.Heart style={{ width: 16, height: 16, color: '#EC4899' }} />, title: 'Lista de presentes', desc: 'Receba presentes de qualquer pessoa, de qualquer lugar' },
          { icon: <Icon.Shield style={{ width: 16, height: 16, color: '#10B981' }} />, title: 'Pagamentos seguros', desc: 'PIX, cartão e transferência com proteção total' },
          { icon: <Icon.Sparkle style={{ width: 16, height: 16, color: '#6366F1' }} />, title: 'Página personalizada', desc: 'Design bonito pronto em minutos' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: '#64748B' }}>{f.desc}</div>
            </div>
          </div>
        ))}

        {/* Stats */}
        <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', gap: 20, borderTop: '1px solid rgba(99,102,241,0.15)' }}>
          {[
            { val: '4.5K+', label: 'eventos' },
            { val: 'R$ 18M', label: 'arrecadados' },
            { val: '4.9 ★', label: 'avaliação' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: 11.5, color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </RegisterSidePanel>
    </>
  )
}

// ─── Step 2 ───────────────────────────────────────────────────
const EVENT_TYPES = [
  {
    id: 'wedding',
    label: 'Casamento',
    desc: 'Lista de presentes, site do casal e RSVP',
    icon: <Icon.Heart style={{ width: 22, height: 22, color: '#EC4899' }} />,
    phVariant: 'ca-ph--violet',
  },
  {
    id: 'baby',
    label: 'Chá de bebê',
    desc: 'Lista de enxoval e presentes para o bebê',
    icon: <Icon.Baby style={{ width: 22, height: 22, color: '#6366F1' }} />,
    phVariant: 'ca-ph',
  },
  {
    id: 'home',
    label: 'Novo lar',
    desc: 'Monte sua casa dos sonhos com ajuda de todos',
    icon: <Icon.Home style={{ width: 22, height: 22, color: '#fff' }} />,
    phVariant: 'ca-ph--dark',
  },
]

function Step2({ eventType, setEventType, onPrev, onNext }: { eventType: string; setEventType: (v: string) => void; onPrev: () => void; onNext: () => void }) {
  return (
    <div style={{ overflowY: 'auto', padding: '48px 52px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 520 }}>
        <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Passo 2 · Tipo de evento</div>
        <h2 className="ca-display" style={{ fontSize: 28, marginBottom: 8 }}>O que vamos celebrar?</h2>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>Escolha o tipo de evento para personalizar sua experiência.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {EVENT_TYPES.map(et => (
            <button
              key={et.id}
              type="button"
              className={'ca-pick' + (eventType === et.id ? ' ca-pick--on' : '')}
              onClick={() => setEventType(et.id)}
            >
              {eventType === et.id && (
                <span className="ca-pick__check">
                  <Icon.Check style={{ width: 11, height: 11 }} />
                </span>
              )}
              <div className={'ca-ph ' + et.phVariant} style={{ height: 80, marginBottom: 14, borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                  {et.icon}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{et.label}</div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45 }}>{et.desc}</div>
            </button>
          ))}
        </div>

        {/* Coming soon row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 32 }}>
          <Icon.Sparkle style={{ width: 16, height: 16, color: '#94A3B8' }} />
          <span style={{ fontSize: 13, color: '#64748B' }}>Mais tipos de eventos em breve — Aniversário, Formatura e mais.</span>
          <span className="ca-badge ca-badge--violet" style={{ marginLeft: 'auto' }}>Em breve</span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>
            Voltar
          </AuthBtn>
          <AuthBtn variant="primary" onClick={onNext} iconRight={<Icon.ArrowRight style={{ width: 16, height: 16 }} />} style={{ flex: 1 }}>
            Continuar
          </AuthBtn>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────────────────────
function Step3({ slug, setSlug, onPrev, onNext }: { slug: string; setSlug: (v: string) => void; onPrev: () => void; onNext: () => void }) {
  return (
    <>
      {/* Form */}
      <div style={{ overflowY: 'auto', padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380 }}>
          <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Passo 3 · Informações</div>
          <h2 className="ca-display" style={{ fontSize: 28, marginBottom: 8 }}>Detalhes do evento</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>Personalize as informações do seu evento.</p>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={e => e.preventDefault()}>
            <AuthField label="Nome do evento">
              <AuthInput type="text" placeholder="Ex: Julia & Marcos" />
            </AuthField>

            <AuthField label="URL pública" hint="✓ Disponível" hintTone="ok">
              <AuthInput
                icon={<Icon.Link style={{ width: 18, height: 18 }} />}
                suffix={<span style={{ color: '#10B981', fontWeight: 600, fontSize: 12 }}>Disponível ✓</span>}
                suffixPill
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="julia-e-marcos"
              />
            </AuthField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <AuthField label="Data do evento">
                <AuthInput icon={<Icon.Calendar style={{ width: 18, height: 18 }} />} type="date" />
              </AuthField>
              <AuthField label="Cidade">
                <AuthInput icon={<Icon.Pin style={{ width: 18, height: 18 }} />} type="text" placeholder="São Paulo" />
              </AuthField>
            </div>
          </form>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>
              Voltar
            </AuthBtn>
            <AuthBtn variant="primary" onClick={onNext} iconRight={<Icon.ArrowRight style={{ width: 16, height: 16 }} />} style={{ flex: 1 }}>
              Continuar
            </AuthBtn>
          </div>
        </div>
      </div>

      {/* Side panel with URL preview */}
      <RegisterSidePanel>
        <div className="ca-eyebrow" style={{ marginBottom: 12 }}>Prévia da URL</div>
        <div className="ca-card ca-card--lift" style={{ padding: '20px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Seu link personalizado</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#6366F1', fontWeight: 500, wordBreak: 'break-all' }}>
            celebre.app/<span style={{ color: '#0F172A', fontWeight: 700 }}>{slug || 'seu-evento'}</span>
          </div>
        </div>

        {/* Mini event page mockup */}
        <div className="ca-card" style={{ overflow: 'hidden', borderRadius: 16 }}>
          <div style={{ height: 80, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Julia &amp; Marcos</div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>Lista de presentes · 48 itens</div>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: '#F1F5F9', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, marginBottom: 4, width: ['70%', '55%', '80%'][i] }} />
                  <div style={{ height: 6, background: '#F1F5F9', borderRadius: 4, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </RegisterSidePanel>
    </>
  )
}

// ─── Step 4 ───────────────────────────────────────────────────
type Template = 'minimal' | 'elegant' | 'modern'

const TEMPLATES: { id: Template; label: string; style: { bg: string; card: string; ink: string; font: string; hero: string; btn: string; btnRadius: number } }[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    style: {
      bg: 'linear-gradient(135deg,#F8FAFC,#E2E8F0)',
      card: '#FFFFFF',
      ink: '#0F172A',
      font: 'Inter',
      hero: 'linear-gradient(135deg,#E2E8F0,#CBD5E1)',
      btn: '#0F172A',
      btnRadius: 999,
    },
  },
  {
    id: 'elegant',
    label: 'Elegant',
    style: {
      bg: 'linear-gradient(135deg,#EDE4D3,#D6C5A8)',
      card: '#FAF4E8',
      ink: '#3F2A1D',
      font: 'Instrument Serif, Georgia, serif',
      hero: 'linear-gradient(135deg,#C7A887,#8B6543)',
      btn: '#3F2A1D',
      btnRadius: 999,
    },
  },
  {
    id: 'modern',
    label: 'Modern',
    style: {
      bg: 'linear-gradient(135deg,#EEF2FF,#FAF5FF)',
      card: '#FFFFFF',
      ink: '#0F172A',
      font: 'Space Grotesk',
      hero: 'linear-gradient(135deg,#6366F1,#A855F7)',
      btn: 'linear-gradient(90deg,#6366F1,#8B5CF6)',
      btnRadius: 8,
    },
  },
]

function Step4({ template, setTemplate, onPrev, onFinish }: { template: Template; setTemplate: (v: Template) => void; onPrev: () => void; onFinish: () => void }) {
  return (
    <div style={{ overflowY: 'auto', padding: '48px 52px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 600 }}>
        <div className="ca-eyebrow" style={{ marginBottom: 10 }}>Passo 4 · Template</div>
        <h2 className="ca-display" style={{ fontSize: 28, marginBottom: 8 }}>Escolha o visual</h2>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>Você pode mudar a qualquer momento.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          {TEMPLATES.map(t => {
            const on = template === t.id
            return (
              <button
                key={t.id}
                type="button"
                className={'ca-pick' + (on ? ' ca-pick--on' : '')}
                onClick={() => setTemplate(t.id)}
                style={{ padding: 0, overflow: 'hidden', borderRadius: 18 }}
              >
                {on && (
                  <span className="ca-pick__check">
                    <Icon.Check style={{ width: 11, height: 11 }} />
                  </span>
                )}
                {/* Template preview */}
                <div style={{ background: t.style.bg, padding: '16px 12px 12px', minHeight: 140 }}>
                  <div style={{ background: t.style.hero, borderRadius: 8, height: 44, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', fontFamily: t.style.font, opacity: 0.9 }}>Julia &amp; Marcos</span>
                  </div>
                  <div style={{ background: t.style.card, borderRadius: 6, padding: '8px 8px 10px' }}>
                    {[...Array(2)].map((_, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: t.style.hero, opacity: 0.5, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 5, background: t.style.ink, opacity: 0.15, borderRadius: 3, marginBottom: 3, width: '70%' }} />
                          <div style={{ height: 4, background: t.style.ink, opacity: 0.08, borderRadius: 3, width: '45%' }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 6, height: 22, borderRadius: t.style.btnRadius, background: t.style.btn, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 8, color: '#fff', fontWeight: 600, fontFamily: t.style.font }}>Presentear</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '10px 14px 12px', textAlign: 'left' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{t.label}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: t.style.font }}>{t.style.font.split(',')[0]}</div>
                </div>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AuthBtn variant="ghost" onClick={onPrev} icon={<Icon.ArrowLeft style={{ width: 16, height: 16 }} />}>
            Voltar
          </AuthBtn>
          <button
            type="button"
            style={{ fontSize: 13.5, color: '#64748B', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500, padding: '0 4px', background: 'none', border: 'none' }}
            onClick={onFinish}
          >
            Pular por agora
          </button>
          <AuthBtn variant="primary" onClick={onFinish} iconRight={<Icon.ArrowRight style={{ width: 16, height: 16 }} />} style={{ flex: 1 }}>
            Criar minha página
          </AuthBtn>
        </div>
      </div>
    </div>
  )
}

// ─── RegisterPage ─────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [eventType, setEventType] = useState('wedding')
  const [slug, setSlug] = useState('julia-e-marcos')
  const [template, setTemplate] = useState<Template>('elegant')

  const next = () => setStep(s => s + 1)
  const prev = () => setStep(s => s - 1)
  const finish = () => navigate('/verificacao')

  return (
    <div className="auth-page ca-root">
      <RegisterShell step={step} total={4} dense={step === 1 || step === 3}>
        {step === 0 && <Step1 onNext={next} />}
        {step === 1 && <Step2 eventType={eventType} setEventType={setEventType} onPrev={prev} onNext={next} />}
        {step === 2 && <Step3 slug={slug} setSlug={setSlug} onPrev={prev} onNext={next} />}
        {step === 3 && <Step4 template={template} setTemplate={setTemplate} onPrev={prev} onFinish={finish} />}
      </RegisterShell>
    </div>
  )
}
