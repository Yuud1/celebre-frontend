import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLogo } from '../components/auth/AuthShared'

const FEATURE_CARDS = [
  {
    title: 'Página do seu jeito',
    desc: 'Templates elegantes, paletas prontas e preview em tempo real para cada tipo de celebração.',
    image: '/img-01.webp',
    imageAlt: 'Exemplo de página personalizada no Celebre',
  },
  {
    title: 'Lista inteligente',
    desc: 'Presentes fixos, vaquinhas e destaques — tudo organizado para seus convidados presentearem com facilidade.',
    image: '/img02.webp',
    imageAlt: 'Exemplo de lista de presentes no Celebre',
  },
  {
    title: 'Pagamentos seguros',
    desc: 'PIX e cartão com repasse automático. Você configura uma vez e recebe direto na sua conta.',
    image: '/img03.webp',
    imageAlt: 'Exemplo de pagamentos no Celebre',
  },
]

const PLANS = [
  {
    name: 'Essencial',
    price: 'R$ 11,99',
    period: '/por evento',
    features: ['1 evento publicado', 'Lista de presentes', 'Página personalizada', 'Suporte por e-mail'],
    cta: 'Escolher plano',
    href: '/criar-conta',
    popular: false,
  },
  {
    name: 'Celebre Pro',
    price: 'R$ 15,99',
    period: '/por evento',
    features: ['Tudo do Essencial', 'Domínio personalizado', 'Templates premium', 'Relatórios avançados', 'Suporte prioritário'],
    cta: 'Publicar evento',
    href: '/criar',
    popular: true,
  },
  {
    name: 'Premium',
    price: 'R$ 22,99',
    period: '/por evento',
    features: ['Tudo do Pro', 'Múltiplos eventos', 'White-label', 'API de integração', 'Gerente dedicado'],
    cta: 'Escolher plano',
    href: '/criar-conta',
    popular: false,
  },
]

const TESTIMONIALS = [
  { name: 'Julia M.', role: 'Casamento · SP', text: 'Montamos nossa lista em uma tarde. Os convidados elogiaram o visual e a facilidade do PIX.', stars: 5, photo: '/casais/casal-01.webp' },
  { name: 'Fernanda R.', role: 'Chá de bebê', text: 'A página ficou linda e recebemos presentes de parentes que moram longe. Super prático!', stars: 5, photo: '/casais/casal-02.webp' },
  { name: 'Marcos & Ana', role: 'Revelação', text: 'Compartilhamos o link no WhatsApp e em minutos já tinha contribuição entrando.', stars: 5, photo: '/casais/casal-03.webp' },
  { name: 'Camila T.', role: 'Panelas', text: 'O painel mostra tudo claramente: quem presenteou, quanto entrou e o saldo disponível.', stars: 5, photo: '/casais/casal-04.webp' },
  { name: 'Rafael S.', role: 'Aniversário', text: 'Interface limpa, fácil de usar. Até minha mãe conseguiu presentear sem ajuda.', stars: 5, photo: '/casais/casal-07.webp' },
]

const FAQ_ITEMS = [
  {
    q: 'Como funciona o Celebre?',
    a: 'Você escolhe o tipo de celebração, personaliza a página, publica o link e começa a receber presentes e contribuições dos convidados.',
  },
  {
    q: 'Posso editar minha página depois de publicar?',
    a: 'Sim. Você pode ajustar textos, fotos, lista de presentes e aparência sempre que precisar antes e durante o evento.',
  },
  {
    q: 'Quais formas de pagamento os convidados podem usar?',
    a: 'Atualmente o checkout aceita PIX e gera o link/QR para pagamento com segurança.',
  },
  {
    q: 'Preciso saber design para criar minha página?',
    a: 'Não. Os templates já vêm prontos e você só personaliza o conteúdo principal da forma mais simples possível.',
  },
  {
    q: 'Em quanto tempo minha página fica pronta?',
    a: 'Em poucos minutos. O fluxo guiado ajuda a configurar tipo de evento, paleta, tipografia e conteúdo rapidamente.',
  },
]

type Testimonial = (typeof TESTIMONIALS)[number]

function TestimonialAvatar({
  photo,
  name,
  className,
}: {
  photo: string
  name: string
  className?: string
}) {
  return (
    <div className={className}>
      <img src={photo} alt={name} loading="lazy" decoding="async" />
    </div>
  )
}

function TestimonialCard({
  item,
  className = 'home-testimonial',
  stack,
}: {
  item: Testimonial
  className?: string
  stack?: number
}) {
  return (
    <article className={className} data-stack={stack}>
      <div className="home-testimonial__head">
        <TestimonialAvatar photo={item.photo} name={item.name} className="home-testimonial__avatar" />
        <div className="home-testimonial__who">
          <strong>{item.name}</strong>
          <span>{item.role}</span>
        </div>
      </div>
      <Stars count={item.stars} />
      <p className="home-testimonial__text">&ldquo;{item.text}&rdquo;</p>
    </article>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function TestimonialsSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mq.matches || reduced.matches) return

    const id = window.setInterval(() => {
      setActive(current => (current + 1) % TESTIMONIALS.length)
    }, 4500)

    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="home-testimonials">
      <div className="home-testimonials__grid home-testimonials__grid--desktop">
        {TESTIMONIALS.map(item => (
          <TestimonialCard key={item.name} item={item} />
        ))}
      </div>

      <div className="home-testimonials-carousel" aria-live="polite" aria-atomic="true">
        {TESTIMONIALS.map((item, index) => {
          const stack =
            (index - active + TESTIMONIALS.length) % TESTIMONIALS.length

          return (
            <TestimonialCard
              key={item.name}
              item={item}
              className="home-testimonial home-testimonial--stack"
              stack={stack}
            />
          )
        })}
      </div>
    </div>
  )
}

function Stars({ count }: { count: number }) {
  return (
    <div className="home-stars" aria-label={`${count} estrelas`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export function HomePage() {
  const pricingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = pricingRef.current
    if (!track || !window.matchMedia('(max-width: 900px)').matches) return
    const popular = track.querySelector<HTMLElement>('.home-price-card--popular')
    if (!popular) return
    const left = popular.offsetLeft - (track.clientWidth - popular.offsetWidth) / 2
    track.scrollTo({ left: Math.max(0, left), behavior: 'auto' })
  }, [])

  return (
    <div className="home-page">
      <section className="home-hero">
        <span className="home-badge">Plataforma para celebrações</span>
        <h1>Crie páginas lindas para receber presentes e contribuições</h1>
        <p className="home-hero__lead">
          Casamentos, chás, revelações e panelas. Monte sua página, publique o link e acompanhe cada presente pelo painel.
        </p>

        <div className="home-hero__cta">
          <Link to="/criar" className="home-btn home-btn--grad">Criar minha página grátis</Link>
        </div>

        <div className="home-hero__visual" aria-hidden="true">
          <div className="home-hero__glow">
            <div className="home-hero__orb home-hero__orb--lilac" />
            <div className="home-hero__orb home-hero__orb--rose" />
            <div className="home-hero__orb home-hero__orb--core" />
          </div>
          <div className="home-hero__center">
            <img
              src="/img08.webp"
              alt=""
              className="home-hero__center-img"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="home-hero__feature home-hero__feature--tl">
            <img
              src="/img06.webp"
              alt=""
              className="home-hero__feature-img"
              loading="lazy"
              decoding="async"
            />
            <div className="home-float home-float--overlay">
              <div className="home-float__avatar">J</div>
              <div>
                <strong>Julia &amp; Marcos</strong>
                <span>Casamento · R$ 8.420</span>
              </div>
            </div>
          </div>

          <div className="home-hero__feature home-hero__feature--tr">
            <img
              src="/img05.webp"
              alt=""
              className="home-hero__feature-img"
              loading="lazy"
              decoding="async"
            />
            <div className="home-float home-float--overlay">
              <div className="home-float__avatar">O</div>
              <div>
                <strong>Olivia</strong>
                <span>Chá de bebê · 48 presentes</span>
              </div>
            </div>
          </div>

          <div className="home-hero__feature home-hero__feature--br">
            <img
              src="/img07.webp"
              alt=""
              className="home-hero__feature-img"
              loading="lazy"
              decoding="async"
            />
            <div className="home-float home-float--overlay">
              <div className="home-float__avatar">R</div>
              <div>
                <strong>Revelação</strong>
                <span>R$ 2.150 hoje</span>
              </div>
            </div>
          </div>

          <div className="home-hero__feature home-hero__feature--bl">
            <img
              src="/img04.webp"
              alt=""
              className="home-hero__feature-img"
              loading="lazy"
              decoding="async"
            />
            <div className="home-float home-float--overlay">
              <div className="home-float__avatar">A</div>
              <div>
                <strong>Ana &amp; Pedro</strong>
                <span>Nova contribuição ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section" id="recursos">
        <div className="home-section__head">
          <span className="home-badge">Recursos</span>
          <h2>Tudo que você precisa para celebrar com estilo</h2>
          <p>Do primeiro rascunho ao saque no PIX — sem planilha, sem link quebrado e sem dor de cabeça para o convidado.</p>
        </div>

        <div className="home-features">
          {FEATURE_CARDS.map(card => (
            <article key={card.title} className="home-feature-card">
              <div className="home-feature-card__media">
                <img src={card.image} alt={card.imageAlt} loading="lazy" decoding="async" />
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-showcase" aria-label="Painel Celebre">
        <img
          src="/img04.webp"
          alt="Painel do Celebre para gerenciar convidados, presentes e recebimentos"
          loading="lazy"
          decoding="async"
        />
      </section>

      <section className="home-section" id="planos">
        <div className="home-section__head">
          <span className="home-badge">Planos</span>
          <h2>Escolha como quer celebrar</h2>
          <p>Planos a partir de R$ 11,99 por evento. Publique quando estiver pronto, sem taxa escondida.</p>
        </div>

        <div className="home-pricing-track">
          <div className="home-pricing" ref={pricingRef} aria-label="Planos disponíveis">
          {PLANS.map(plan => (
            <article key={plan.name} className={'home-price-card' + (plan.popular ? ' home-price-card--popular' : '')}>
              {plan.popular && <span className="home-price-card__tag">Popular</span>}
              <h3>{plan.name}</h3>
              <div className="home-price-card__price">
                <strong>{plan.price}</strong>
                {plan.period && <span>{plan.period}</span>}
              </div>
              <ul>
                {plan.features.map(f => (
                  <li key={f}><CheckIcon />{f}</li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={'home-btn' + (plan.popular ? ' home-btn--grad home-btn--block' : ' home-btn--outline home-btn--block')}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="home-section" id="depoimentos">
        <div className="home-section__head">
          <span className="home-badge">Depoimentos</span>
          <h2>Quem celebra com a gente recomenda</h2>
          <p>Famílias e casais que transformaram convites em experiências bonitas e práticas.</p>
        </div>

        <TestimonialsSection />
      </section>

      <section className="home-section" id="faq">
        <div className="home-section__head">
          <span className="home-badge">FAQ</span>
          <h2>Perguntas frequentes</h2>
          <p>Respostas rápidas para te ajudar a criar, publicar e gerir sua celebração no Celebre.</p>
        </div>

        <div className="home-faq" aria-label="Perguntas frequentes">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="home-faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="home-footer">
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
          <Link to="/sobre">Sobre</Link>
          <Link to="/diretrizes">Diretrizes</Link>
          <Link to="/politicas">Políticas</Link>
        </nav>
      </footer>
    </div>
  )
}
