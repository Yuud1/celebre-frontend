import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { syncBuilderDraftFromStorage } from '../lib/builderDraft'

const PUBLICATION_FEE = 49

const UPSELLS = [
  { id: 'domain', label: 'Domínio personalizado', price: 'Em breve', note: 'seuevento.com.br' },
  { id: 'premium', label: 'Template premium', price: '+ R$ 29', note: 'Layouts exclusivos' },
  { id: 'brand', label: 'Remover marca Celebre', price: '+ R$ 19', note: 'Página 100% sua' },
]

export function CheckoutPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const draftId = params.get('draft')
  const publishIntent = params.get('publish') === '1'

  const [syncingDraft, setSyncingDraft] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [chargeUrl, setChargeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  // Poll for publication after payment is initiated
  useEffect(() => {
    if (!draftId || !chargeUrl) return

    const interval = setInterval(async () => {
      try {
        const { status, eventSlug } = await api.getDraftStatus(draftId)
        if (status === 'published' && eventSlug) {
          clearInterval(interval)
          navigate(`/verificacao?redirect=${encodeURIComponent(`/p/${eventSlug}`)}`, { replace: true })
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
      const { chargeUrl: url } = await api.publishDraft(draftId)
      setChargeUrl(url)
      window.open(url, '_blank')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao gerar cobrança. Tente novamente.')
    } finally {
      setPublishing(false)
    }
  }

  const busy = syncingDraft || authLoading

  return (
    <div className="checkout-box">
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Publicar seu evento</h1>
      <p style={{ color: 'var(--cb-muted)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
        Taxa única de lançamento para colocar sua página no ar. Depois do pagamento,
        você configura a conta bancária para receber os presentes.
      </p>

      <div
        style={{
          padding: '1rem',
          background: 'var(--cb-bg)',
          borderRadius: 10,
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
          <span>Taxa de publicação</span>
          <span>R$ {PUBLICATION_FEE},00</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--cb-muted)', margin: '0.5rem 0 0' }}>
          Link compartilhável · lista de presentes · contribuições via Asaas
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={handlePublish}
        disabled={busy || publishing || !draftId || !!chargeUrl}
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

      <h2 style={{ fontSize: '1rem', margin: '2rem 0 0.5rem' }}>Extras (pós-compra)</h2>
      <ul className="upsell-list">
        {UPSELLS.map((u) => (
          <li key={u.id} className="upsell-item">
            <div>
              <strong>{u.label}</strong>
              <br />
              <span style={{ fontSize: '0.8rem', color: 'var(--cb-muted)' }}>{u.note}</span>
            </div>
            <span>{u.price}</span>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
        <Link to="/dashboard">Ir para o painel</Link>
        {' · '}
        <Link to="/criar">Voltar ao editor</Link>
      </p>
    </div>
  )
}
