import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { syncBuilderDraftFromStorage } from '../lib/builderDraft'
import { derivePlanFeatures, type ApiPlan } from '../lib/plans'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function CheckoutPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const draftId = params.get('draft')
  const publishIntent = params.get('publish') === '1'

  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [syncingDraft, setSyncingDraft] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [chargeUrl, setChargeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedPlanName = localStorage.getItem('celebre_plan')
    api.listPlans().then((data) => {
      setPlans(data as ApiPlan[])
      if (savedPlanName) {
        const match = data.find(p => p.name === savedPlanName)
        if (match) setSelectedPlanId(match.id)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (authLoading || !user || draftId || !publishIntent) return

    setSyncingDraft(true)
    setError(null)
    syncBuilderDraftFromStorage()
      .then((id) => {
        if (id) {
          setParams({ draft: id }, { replace: true })
        } else {
          setError('Não foi possível carregar o rascunho. Volte ao editor e tente novamente.')
        }
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Erro ao salvar rascunho.')
      })
      .finally(() => setSyncingDraft(false))
  }, [authLoading, user, draftId, publishIntent, setParams])

  useEffect(() => {
    if (!draftId || !chargeUrl) return

    const interval = setInterval(async () => {
      try {
        const { status, eventSlug } = await api.getDraftStatus(draftId)
        if (status === 'published' && eventSlug) {
          clearInterval(interval)
          localStorage.removeItem('celebre_plan')
          navigate('/dashboard', { replace: true })
        }
      } catch {
        // ignore transient poll errors
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [draftId, chargeUrl, navigate])

  async function handlePublish() {
    if (!draftId) return
    setPublishing(true)
    setError(null)
    try {
      const { chargeUrl: url } = await api.publishDraft(draftId, selectedPlanId ?? undefined)
      setChargeUrl(url)
      window.open(url, '_blank')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao gerar cobrança. Tente novamente.')
    } finally {
      setPublishing(false)
    }
  }

  const busy = syncingDraft || authLoading
  const selectedPlan = plans.find(p => p.id === selectedPlanId)

  return (
    <div style={{ padding: '2rem var(--page-gutter) 4rem' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>
          Publicar seu evento
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--cb-muted)', margin: '0 0 2.5rem', lineHeight: 1.5 }}>
          Escolha o plano e coloque sua página no ar.
        </p>

        {plans.length > 0 && !chargeUrl && (
          <div style={{ marginBottom: '2rem' }}>
            <div className="home-pricing-track">
              <div className="home-pricing" role="radiogroup" aria-label="Planos disponíveis">
                {plans.map(plan => (
                  <article
                    key={plan.id}
                    className={[
                      'home-price-card',
                      plan.name === 'pro' ? 'home-price-card--popular' : '',
                      selectedPlanId === plan.id ? 'home-price-card--active' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => {
                      setSelectedPlanId(plan.id)
                      localStorage.setItem('celebre_plan', plan.name)
                    }}
                    style={{ cursor: 'pointer' }}
                    role="radio"
                    aria-checked={selectedPlanId === plan.id}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setSelectedPlanId(plan.id)}
                  >
                    {plan.name === 'pro' && <span className="home-price-card__tag">Popular</span>}
                    <h3>{plan.label}</h3>
                    <div className="home-price-card__price">
                      <strong>R$ {((plan.displayPrice ?? plan.publicationFee) / 100).toFixed(2).replace('.', ',')}</strong>
                      <span>/por evento</span>
                    </div>
                    <ul>
                      {derivePlanFeatures(plan).slice(0, 5).map(f => (
                        <li key={f}><CheckIcon />{f}</li>
                      ))}
                    </ul>
                    <div
                      className={selectedPlanId === plan.id
                        ? 'home-btn home-btn--grad home-btn--block'
                        : 'home-btn home-btn--outline home-btn--block'}
                      style={{ marginTop: 'auto', pointerEvents: 'none' }}
                    >
                      {selectedPlanId === plan.id ? '✓ Selecionado' : 'Selecionar'}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="checkout-box" style={{ marginTop: 0 }}>
          {selectedPlan && !chargeUrl && (
            <div style={{ padding: '0.875rem 1rem', background: 'var(--cb-bg)', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>{selectedPlan.label}</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--cb-muted)' }}>
                  Taxa única de publicação
                </p>
              </div>
              <strong style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                R$ {((selectedPlan.displayPrice ?? selectedPlan.publicationFee) / 100).toFixed(2).replace('.', ',')}
              </strong>
            </div>
          )}

          {!selectedPlan && plans.length > 0 && !chargeUrl && (
            <p style={{ color: 'var(--cb-muted)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
              Selecione um plano acima para continuar.
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handlePublish}
            disabled={busy || publishing || !draftId || !!chargeUrl || !selectedPlanId}
          >
            {busy
              ? 'Preparando rascunho...'
              : publishing
                ? 'Gerando cobrança...'
                : chargeUrl
                  ? 'Aguardando pagamento...'
                  : 'Pagar e publicar'}
          </button>

          {chargeUrl && (
            <p style={{ fontSize: '0.85rem', color: 'var(--cb-muted)', marginTop: 8 }}>
              <a href={chargeUrl} target="_blank" rel="noreferrer">
                Abrir link de pagamento
              </a>
              {' · '}Confirmação automática em alguns segundos após o pagamento.
            </p>
          )}

          {error && (
            <p style={{ fontSize: '0.85rem', color: '#c0392b', marginTop: 8 }}>{error}</p>
          )}

          {!draftId && !busy && !publishIntent && (
            <p style={{ fontSize: '0.85rem', color: 'var(--cb-muted)', marginTop: 8 }}>
              Rascunho não encontrado.{' '}
              <Link to="/criar">Voltar ao editor</Link>
            </p>
          )}

          {draftId && !chargeUrl && (
            <p style={{ fontSize: '0.75rem', color: 'var(--cb-muted)', marginTop: 8 }}>
              Rascunho: {draftId.slice(0, 8)}…
            </p>
          )}

          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
            <Link to="/dashboard">Ir para o painel</Link>
            {' · '}
            <Link to="/criar">Voltar ao editor</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
