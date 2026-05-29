import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'

function AuthError({ message }: { message: string }) {
  return (
    <div className="auth-alert auth-alert--error">{message}</div>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      setError('Informe seu e-mail')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.forgotPassword({ email: normalized })
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível enviar o link'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page ca-root login-page auth-theme--celebre">
      <div className="login-page__form">
        <div className="login-page__form-inner">
          <Link to="/login" className="auth-back-link">
            <Icon.ArrowLeft style={{ width: 16, height: 16 }} />
            Voltar ao login
          </Link>

          <div style={{ marginBottom: 32 }}>
            <AuthLogo size={18} />
            <div style={{ marginTop: 28 }}>
              {sent ? (
                <>
                  <div className="auth-success-icon" aria-hidden="true">
                    <Icon.Mail style={{ width: 28, height: 28 }} />
                  </div>
                  <h1 className="ca-display login-headline">Verifique seu e-mail</h1>
                  <p className="register-lead" style={{ marginBottom: 0 }}>
                    Se existir uma conta com <strong>{email}</strong>, você receberá um link para redefinir sua senha em alguns minutos.
                  </p>
                  <p className="auth-hint" style={{ marginTop: 16 }}>
                    Não encontrou? Confira a caixa de spam ou tente outro e-mail.
                  </p>
                  <AuthBtn
                    type="button"
                    variant="primary"
                    block
                    size="lg"
                    style={{ marginTop: 24 }}
                    onClick={() => { setSent(false); setError('') }}
                  >
                    Tentar outro e-mail
                  </AuthBtn>
                  <Link to="/login" className="auth-btn-link" style={{ marginTop: 16 }}>
                    Voltar para entrar
                  </Link>
                </>
              ) : (
                <>
                  <h1 className="ca-display login-headline">Esqueceu a senha?</h1>
                  <p className="register-lead" style={{ marginBottom: 0 }}>
                    Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
                  </p>
                </>
              )}
            </div>
          </div>

          {!sent && (
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <AuthField label="E-mail">
                <AuthInput
                  icon={<Icon.Mail style={{ width: 18, height: 18 }} />}
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </AuthField>

              {error ? <AuthError message={error} /> : null}

              <AuthBtn
                type="submit"
                variant="primary"
                block
                size="lg"
                disabled={loading}
                style={{ marginTop: 4 }}
                iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}
              >
                {loading ? 'Enviando...' : 'Enviar link'}
              </AuthBtn>
            </form>
          )}

          {!sent && (
            <p className="register-auth-switch" style={{ marginTop: 24 }}>
              Lembrou a senha? <Link to="/login">Entrar</Link>
            </p>
          )}
        </div>
      </div>

      <AuthVisualPanel />
    </div>
  )
}
