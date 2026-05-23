import { Link, useSearchParams } from 'react-router-dom'

const PUBLICATION_FEE = 49

const UPSELLS = [
  { id: 'domain', label: 'Domínio personalizado', price: 'Em breve', note: 'seuevento.com.br' },
  { id: 'premium', label: 'Template premium', price: '+ R$ 29', note: 'Layouts exclusivos' },
  { id: 'brand', label: 'Remover marca Celebre', price: '+ R$ 19', note: 'Página 100% sua' },
]

export function CheckoutPage() {
  const [params] = useSearchParams()
  const draftId = params.get('draft')
  const hasToken = !!localStorage.getItem('celebre-token')

  return (
    <div className="checkout-box">
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Publicar seu evento</h1>
      <p style={{ color: 'var(--cb-muted)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
        Taxa única de lançamento para colocar sua página no ar. Depois do pagamento,
        você configura conta Asaas e PIX no painel.
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

      {!hasToken ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--cb-primary)', marginBottom: '1rem' }}>
          Faça login ou cadastre-se para concluir o pagamento. Seu rascunho está salvo neste navegador.
        </p>
      ) : null}

      <button type="button" className="btn btn-primary" style={{ width: '100%' }} disabled={!hasToken}>
        {hasToken ? 'Pagar e publicar' : 'Entrar para pagar'}
      </button>

      {draftId ? (
        <p style={{ fontSize: '0.75rem', color: 'var(--cb-muted)', marginTop: 8 }}>
          Rascunho: {draftId.slice(0, 8)}…
        </p>
      ) : null}

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
