import { Link } from 'react-router-dom'

const PAGES = {
  sobre: {
    title: 'Sobre o Celebre',
    paragraphs: [
      'O Celebre ajuda você a criar páginas de presentes e eventos com pagamentos integrados, de forma simples e elegante.',
      'Nossa missão é tornar cada celebração mais especial, conectando convidados, presentes e memórias em um só lugar.',
    ],
  },
  diretrizes: {
    title: 'Diretrizes',
    paragraphs: [
      'Use o Celebre apenas para eventos e arrecadações legítimas, com informações claras para seus convidados.',
      'Não publique conteúdo ofensivo, enganoso ou que viole direitos de terceiros.',
      'Respeite a privacidade dos participantes e utilize dados de pagamento apenas para o fim declarado na sua página.',
    ],
  },
  politicas: {
    title: 'Políticas',
    paragraphs: [
      'Tratamos seus dados com responsabilidade e apenas para operar a plataforma, processar pagamentos e melhorar o serviço.',
      'Você pode solicitar atualização ou exclusão de informações da sua conta entrando em contato com nosso suporte.',
      'Esta página será atualizada conforme novas funcionalidades e obrigações legais forem incorporadas ao produto.',
    ],
  },
} as const

export type InfoPageKind = keyof typeof PAGES

export function InfoPage({ kind }: { kind: InfoPageKind }) {
  const page = PAGES[kind]

  return (
    <article className="info-page">
      <Link to="/" className="info-page__back">
        ← Voltar para a home
      </Link>
      <h1>{page.title}</h1>
      {page.paragraphs.map(text => (
        <p key={text}>{text}</p>
      ))}
    </article>
  )
}
