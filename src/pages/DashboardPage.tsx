import { Link } from 'react-router-dom'

export function DashboardPage() {
  const mockSlug = 'ana-e-lucas'
  const shareUrl = `${window.location.origin}/p/${mockSlug}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem' }}>Painel</h1>
        <p style={{ color: 'var(--cb-muted)', margin: 0 }}>
          Gerencie seu evento após a publicação
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Link para compartilhar</h3>
          <p style={{ fontSize: '0.85rem', wordBreak: 'break-all', color: 'var(--cb-muted)' }}>
            {shareUrl}
          </p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={copyLink}>
            Copiar link
          </button>
        </div>

        <div className="dashboard-card">
          <h3>Arrecadação</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--cb-primary)' }}>
            R$ 0
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--cb-muted)', margin: 0 }}>
            Atualiza quando convidados confirmarem pagamento
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Configurar recebimentos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--cb-muted)', lineHeight: 1.5 }}>
            Após publicar, configure CPF, conta Asaas e chave PIX para receber as contribuições
            (split automático — a plataforma retém a taxa).
          </p>
          <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }}>
            Configurar Asaas
          </button>
        </div>

        <div className="dashboard-card">
          <h3>Contribuições recentes</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--cb-muted)' }}>
            Nenhuma contribuição ainda. Compartilhe o link!
          </p>
        </div>
      </div>

      <p style={{ textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
        <Link to="/criar">Criar outro evento</Link>
      </p>
    </div>
  )
}
