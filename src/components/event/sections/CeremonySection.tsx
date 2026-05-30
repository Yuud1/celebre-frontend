import type { CeremonyBlock } from '../../../types/event'

interface Props {
  data: CeremonyBlock
}

export function CeremonySection({ data }: Props) {
  return (
    <section className="ep-section ep-ceremony">
      <span className="ep-kicker">Programação</span>
      <h2>Cerimônia & recepção</h2>
      <div className="ep-ceremony__grid">
        <article className="ep-ceremony__card">
          <span className="ep-ceremony__icon">💒</span>
          <h3>Cerimônia</h3>
          {data.ceremonyTime ? <strong>{data.ceremonyTime}</strong> : null}
          <p>{data.ceremonyPlace}</p>
          {data.ceremonyAddress ? <small>{data.ceremonyAddress}</small> : null}
        </article>
        <article className="ep-ceremony__card">
          <span className="ep-ceremony__icon">🥂</span>
          <h3>Recepção</h3>
          {data.receptionTime ? <strong>{data.receptionTime}</strong> : null}
          <p>{data.receptionPlace ?? 'Após a cerimônia'}</p>
          {data.receptionAddress ? <small>{data.receptionAddress}</small> : null}
        </article>
      </div>
      {data.dressCode ? (
        <p className="ep-ceremony__dress">
          <span>Traje</span> {data.dressCode}
        </p>
      ) : null}
    </section>
  )
}
