import type { CoupleStoryBlock } from '../../../types/event'

interface Props {
  data: CoupleStoryBlock
}

export function CoupleStorySection({ data }: Props) {
  if (!data.timeline.length) return null

  return (
    <section className="ep-section ep-couple-story">
      <span className="ep-kicker">Nossa história</span>
      <h2>Como chegamos até aqui</h2>
      {data.intro ? <p className="ep-section-lead">{data.intro}</p> : null}
      <ol className="ep-timeline">
        {data.timeline.map((item) => (
          <li key={`${item.year}-${item.title}`} className="ep-timeline__item">
            <span className="ep-timeline__year">{item.year}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
