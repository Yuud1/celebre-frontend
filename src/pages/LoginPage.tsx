import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'

const BAR_HEIGHTS = [28, 42, 36, 52, 48, 64, 58]

function MarketingPanel() {
  return (
    <div
      className="ca-panel"
      style={{
        background: 'radial-gradient(120% 80% at 0% 0%, #312E81 0%, #0F172A 60%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 52px',
        minHeight: '100%',
      }}
    >
      {/* Orbs */}
      <div
        className="ca-panel__orb"
        style={{ width: 420, height: 420, top: -80, left: -100, background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
      />
      <div
        className="ca-panel__orb"
        style={{ width: 280, height: 280, bottom: 80, right: -60, background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
      />
      <div
        className="ca-panel__orb"
        style={{ width: 200, height: 200, bottom: -40, left: 80, background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)', opacity: 0.3 }}
      />
      {/* Grid overlay */}
      <div className="ca-panel__grid" />

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AuthLogo invert size={20} />
      </div>

      {/* Floating cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, position: 'relative', zIndex: 1, marginTop: 48 }}>
        {/* Card 1 — Event stats */}
        <div
          className="ca-card ca-card--glass ca-floats"
          style={{ padding: '20px 22px', maxWidth: 300, '--r': '-3deg' } as React.CSSProperties}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: 4 }}>Casamento · Julia &amp; Marcos</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em' }}>R$ 8.420</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>arrecadados hoje</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Heart style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
          </div>
          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 72 }}>
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: h,
                  borderRadius: 5,
                  background: i === 5
                    ? 'linear-gradient(180deg, #6366F1, #8B5CF6)'
                    : '#E0E7FF',
                }}
              />
            ))}
          </div>
        </div>

        {/* Card 2 — Guest notification */}
        <div
          className="ca-card ca-card--glass ca-floats"
          style={{ padding: '16px 18px', maxWidth: 260, alignSelf: 'flex-end', '--r': '2deg', animationDelay: '-2s' } as React.CSSProperties}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.Check style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Novo presente confirmado</div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Fernanda · Jogo de panelas · R$ 340</div>
            </div>
          </div>
        </div>

        {/* Card 3 — Guests */}
        <div
          className="ca-card ca-card--glass ca-floats"
          style={{ padding: '16px 18px', maxWidth: 240, '--r': '-1.5deg', animationDelay: '-4s' } as React.CSSProperties}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: 10 }}>Convidados confirmados</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['#6366F1', '#EC4899', '#10B981', '#F59E0B'].map((c, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 999, background: c, border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>
                {['J', 'M', 'A', 'L'][i]}
              </div>
            ))}
            <div style={{ marginLeft: 6, fontSize: 13, fontWeight: 600, color: '#0F172A' }}>+84 confirmados</div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 40 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 12 }}>
          Celebre cada<br />momento especial.
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
          A plataforma completa para criar<br />sua lista de presentes e eventos.
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="auth-page ca-root" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr' }}>
      <MarketingPanel />

      {/* Right: form panel */}
      <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <AuthLogo size={18} />
            <div style={{ marginTop: 28 }}>
              <h1 className="ca-display" style={{ fontSize: 28, marginBottom: 8 }}>Bem-vindo de volta</h1>
              <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
                Não tem conta?{' '}
                <Link to="/criar-conta" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>Criar gratuitamente</Link>
              </p>
            </div>
          </div>

          {/* Social login */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <AuthBtn variant="ghost" style={{ flex: 1 }} icon={<Icon.Google style={{ width: 18, height: 18 }} />}>
              Google
            </AuthBtn>
            <AuthBtn variant="ghost" style={{ flex: 1 }} icon={<Icon.Apple style={{ width: 18, height: 18 }} />}>
              Apple
            </AuthBtn>
          </div>

          <div className="ca-or" style={{ marginBottom: 24 }}>ou</div>

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={e => e.preventDefault()}>
            <AuthField label="E-mail">
              <AuthInput
                icon={<Icon.Mail style={{ width: 18, height: 18 }} />}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </AuthField>

            <AuthField label="Senha">
              <AuthInput
                icon={<Icon.Lock style={{ width: 18, height: 18 }} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', color: '#64748B', cursor: 'pointer' }}
                  >
                    <Icon.Eye style={{ width: 16, height: 16 }} />
                  </button>
                }
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </AuthField>

            {/* Remember + Forgot */}
            <div className="ca-row ca-row--between" style={{ marginTop: -4 }}>
              <button
                type="button"
                className={'ca-check' + (remember ? ' ca-check--on' : '')}
                onClick={() => setRemember(v => !v)}
              >
                <span className="ca-check__box">
                  {remember && <Icon.Check style={{ width: 10, height: 10 }} />}
                </span>
                <span>Lembrar de mim</span>
              </button>
              <a href="#" style={{ fontSize: 13.5, color: '#6366F1', fontWeight: 500, textDecoration: 'none' }}>Esqueci a senha</a>
            </div>

            <AuthBtn variant="primary" block size="lg" style={{ marginTop: 8 }} iconRight={<Icon.ArrowRight style={{ width: 18, height: 18 }} />}>
              Entrar
            </AuthBtn>
          </form>

          {/* Trust footer */}
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: <Icon.Shield style={{ width: 13, height: 13 }} />, text: 'SSL seguro' },
              { icon: <Icon.ShieldCheck style={{ width: 13, height: 13 }} />, text: 'LGPD' },
              { icon: <Icon.Check style={{ width: 13, height: 13 }} />, text: 'Dados protegidos' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94A3B8' }}>
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
