import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLogo, AuthBtn, AuthField, AuthInput, AuthVisualPanel } from '../components/auth/AuthShared'
import { Icon } from '../components/auth/AuthIcons'
import { api } from '../lib/api'

interface InvitePeek {
  email: string
  eventName: string
  hostName: string
  hasAccount: boolean
  accepted: boolean
}

export function AcceptCoHostInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [peek, setPeek] = useState<InvitePeek | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoadError('Link de convite inválido.')
      setLoading(false)
      return
    }
    api.peekAdminInvite(token)
      .then(setPeek)
      .catch((e: any) => setLoadError(e.message ?? 'Convite inválido ou expirado.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (peek && !peek.hasAccount) {
      if (!name.trim() || password.length < 8) {
        setSubmitError('Preencha nome e uma senha com pelo menos 8 caracteres.')
        return
      }
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.acceptAdminInvite(token, peek?.hasAccount ? undefined : { name: name.trim(), password })
      setDone(true)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Erro ao aceitar convite.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 overflow-auto grid nav:grid-cols-[1fr_1.05fr] min-h-dvh bg-white font-display">
      <div className="flex flex-col overflow-y-auto bg-[#fffefe]">
        <div className="flex-1 flex flex-col justify-center px-[clamp(18px,4vw,52px)] py-10">
          <div className="w-full max-w-[440px] mx-auto">
            <div className="mb-1">
              <AuthLogo size={17} />
            </div>

            {loading && (
              <p className="text-sm text-slate-500 mt-8">Carregando convite…</p>
            )}

            {!loading && loadError && (
              <>
                <h2 className="font-display text-[26px] font-semibold tracking-tight text-slate-950 mt-6 mb-2">
                  Convite indisponível
                </h2>
                <div className="text-[13px] text-red-500 px-3 py-2 bg-red-50 rounded-lg border border-red-200 mb-4">
                  {loadError}
                </div>
                <Link to="/login" className="font-semibold text-indigo-600 hover:underline text-sm">
                  Ir para o login
                </Link>
              </>
            )}

            {!loading && peek && !done && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mt-5 mb-2.5">
                  Convite de co-anfitrião
                </p>
                <h2 className="font-display text-[26px] font-semibold tracking-tight text-slate-950 mb-1">
                  {peek.hostName ? `${peek.hostName} te chamou pra co-organizar` : 'Você foi convidado(a)'}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Evento <strong>{peek.eventName}</strong> · convite para <strong>{peek.email}</strong>
                </p>

                <form className="flex flex-col gap-4" onSubmit={handleAccept} noValidate>
                  {!peek.hasAccount && (
                    <>
                      <AuthField label="Nome completo">
                        <AuthInput
                          icon={<Icon.User style={{ width: 18, height: 18 }} />}
                          type="text" placeholder="Seu nome"
                          value={name} onChange={e => setName(e.target.value)}
                          autoComplete="name"
                        />
                      </AuthField>
                      <AuthField label="Senha">
                        <AuthInput
                          icon={<Icon.Lock style={{ width: 18, height: 18 }} />}
                          type="password" placeholder="Mínimo 8 caracteres"
                          value={password} onChange={e => setPassword(e.target.value)}
                          autoComplete="new-password"
                        />
                      </AuthField>
                    </>
                  )}

                  {submitError && (
                    <div className="text-[13px] text-red-500 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                      {submitError}
                    </div>
                  )}

                  <AuthBtn
                    type="submit" variant="primary" block size="lg"
                    disabled={submitting}
                    iconRight={!submitting && <Icon.ArrowRight style={{ width: 18, height: 18 }} />}
                  >
                    {submitting ? 'Aceitando…' : 'Aceitar convite'}
                  </AuthBtn>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <AuthVisualPanel />
    </div>
  )
}
