import type { GuestMessage } from '../../../pages/PublicEventPage'
import { PREVIEW_BABY_MESSAGES } from '../../../data/defaultSections'

interface Props {
  messages: GuestMessage[]
  babyName: string
  preview?: boolean
}

export function BabyMemorialSection({ messages, babyName, preview }: Props) {
  const display =
    messages.length > 0
      ? messages
      : preview
        ? PREVIEW_BABY_MESSAGES
        : []

  if (!display.length) return null

  const name = babyName || 'bebê'

  return (
    <section className="ep-section ep-baby-memorial">
      <span className="ep-kicker">Mural</span>
      <h2>Recados para {name}</h2>
      <p className="ep-section-lead">
        Mensagens guardadas com carinho para mostrar quando {name} crescer.
      </p>
      <div className="ep-memories__grid">
        {display.map((m, i) => (
          <blockquote key={i} className="ep-baby-memorial__card">
            <span className="ep-baby-memorial__to">Querido(a) {name},</span>
            {m.message}
            <cite>— {m.guestName}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
