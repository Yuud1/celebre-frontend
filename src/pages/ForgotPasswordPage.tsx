import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!normalized) { setError('Informe seu e-mail'); return }
    setLoading(true)
    setError('')
    try {
      await api.forgotPassword({ email: normalized })
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 overflow-auto grid nav:grid-cols-[1fr_1.05fr] min-h-dvh bg-white font-display">
      {/* Form column */}
      <div className="flex flex-col items-center justify-center px-[clamp(18px,4vw,52px)] py-[clamp(24px,5vw,48px)] overflow-y-auto bg-[#fffefe]">
        <div className="w-full max-w-[400px]">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 mb-6 text-[13.5px] font-medium text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Icon.ArrowLeft style={{ width: 16, height: 16 }} />
            Voltar ao login
          </Link>

          <div className="mb-8">
            <AuthLogo size={18} />
            <div className="mt-7">
              {sent ? (
                <>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5 bg-primary/10 text-primary">
                    <Icon.Mail style={{ width: 28, height: 28 }} />
                  </div>
                  <h1 className="font-display text-[28px] font-semibold tracking-tight text-slate-950 mb-2">
                    Verifique seu e-mail
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed mb-0">
                    Se existir uma conta com <strong className="text-slate-800 font-semibold">{email}</strong>, você
                    receberá um link para redefinir sua senha em alguns minutos.
                  </p>
                  <p className="text-xs text-slate-400 mt-4 leading-[1.55]">
                    Não encontrou? Confira a caixa de spam ou tente outro e-mail.
                  </p>
                  <AuthBtn
                    type="button"
                    variant="primary"
                    block
                    size="lg"
                    className="mt-6"
                    onClick={() => { setSent(false); setError('') }}
                  >
                    Tentar outro e-mail
                  </AuthBtn>
                  <Link
                    to="/login"
                    className="block text-center mt-4 text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Voltar para entrar
                  </Link>
                </>
              ) : (
                <>
                  <h1 className="font-display text-[28px] font-semibold tracking-tight text-slate-950 mb-2">
                    Esqueceu a senha?
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
                  </p>
                </>
              )}
            </div>
          </div>

          {!sent && (
            <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit} noValidate>
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

              {error && (
                <div className="text-[13px] text-red-500 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <AuthBtn
                type="submit"
                variant="primary"
                block
                size="lg"
                className="mt-1"
                disabled={loading}
                iconRight={!loading && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}
              >
                {loading ? 'Enviando...' : 'Enviar link'}
              </AuthBtn>
            </form>
          )}

          {!sent && (
            <p className="mt-6 text-sm text-slate-500 text-center">
              Lembrou a senha?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                Entrar
              </Link>
            </p>
          )}
        </div>
      </div>

      <AuthVisualPanel />
    </div>
  )
}
