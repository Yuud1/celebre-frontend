import { Link } from 'react-router-dom'

const features = [
  'Pagina personalizada por tipo de evento',
  'Lista com presentes fixos e vaquinhas',
  'Checkout de publicacao',
  'Dashboard com link e arrecadacao',
]

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <span className="home-kicker">SaaS para celebracoes</span>
          <h1>Crie uma pagina bonita para receber presentes e contribuicoes.</h1>
          <p>
            Casamento, cha de bebe, revelacao ou panela. O anfitriao monta a pagina,
            publica, compartilha o link e acompanha tudo pelo painel.
          </p>
          <div className="home-actions">
            <Link to="/criar" className="btn btn-primary">
              Criar evento
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Ver painel
            </Link>
          </div>
        </div>

        <div className="home-preview" aria-hidden="true">
          <div className="home-preview__bar">
            <span />
            <span />
            <span />
          </div>
          <div className="home-preview__hero">
            <small>Cha de bebe · 07.03.26</small>
            <strong>Olivia</strong>
          </div>
          <div className="home-preview__cards">
            <div>
              <span>Quarto do bebe</span>
              <strong>R$ 8.000</strong>
            </div>
            <div>
              <span>Kit higiene</span>
              <strong>R$ 380</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div>
          <span className="home-kicker">Produto completo</span>
          <h2>Do builder ao pagamento, sem gambiarra para o convidado.</h2>
        </div>
        <div className="home-feature-grid">
          {features.map((feature, index) => (
            <article key={feature}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{feature}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
