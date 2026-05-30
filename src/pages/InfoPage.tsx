import { Link } from 'react-router-dom'
import { AuthLogo } from '../components/auth/AuthShared'
import { INFO_NAV, INFO_PAGES, type InfoPageKind } from '../data/infoContent'

export type { InfoPageKind }

function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="info-page__list">
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function InfoBlock({
  paragraphs,
  bullets,
}: {
  paragraphs?: string[]
  bullets?: string[]
}) {
  return (
    <>
      {paragraphs?.map(text => (
        <p key={text}>{text}</p>
      ))}
      {bullets?.length ? <InfoList items={bullets} /> : null}
    </>
  )
}

export function InfoPage({ kind }: { kind: InfoPageKind }) {
  const page = INFO_PAGES[kind]

  return (
    <div className="info-page-wrap">
      <article className="info-page">
        <header className="info-page__hero">
          <h1>{page.title}</h1>
          <p className="info-page__lead">{page.subtitle}</p>
          <p className="info-page__updated">Última atualização: {page.updatedAt}</p>
        </header>

        <nav className="info-page__nav" aria-label="Páginas institucionais">
          {INFO_NAV.map(item => (
            <Link
              key={item.kind}
              to={`/${item.kind}`}
              className={'info-page__nav-link' + (item.kind === kind ? ' is-active' : '')}
              aria-current={item.kind === kind ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="info-page__body">
          {page.sections.map(section => (
            <section key={section.id} id={section.id} className="info-page__section">
              <h2>{section.title}</h2>
              <InfoBlock paragraphs={section.paragraphs} bullets={section.bullets} />
              {section.subsections?.map(sub => (
                <div key={sub.title} className="info-page__subsection">
                  <h3>{sub.title}</h3>
                  <InfoBlock paragraphs={sub.paragraphs} bullets={sub.bullets} />
                </div>
              ))}
            </section>
          ))}
        </div>

        {page.showCta ? (
          <div className="info-page__cta">
            <p>Pronto para criar a página do seu evento?</p>
            <Link to="/criar" className="home-btn home-btn--grad">
              Criar evento
            </Link>
          </div>
        ) : null}
      </article>

      <footer className="home-footer info-page__footer">
        <div className="home-footer__brand">
          <Link to="/" className="home-footer__logo-link">
            <AuthLogo size={17} />
            <span className="home-footer__logo">
              cele<span>bre</span>
            </span>
          </Link>
          <p>Páginas de presentes e eventos com pagamentos integrados.</p>
        </div>
        <nav className="home-footer__links" aria-label="Institucional">
          {INFO_NAV.map(item => (
            <Link key={item.kind} to={`/${item.kind}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  )
}
