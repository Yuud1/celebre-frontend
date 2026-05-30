import type { HomeStatsBlock } from '../../../types/event'
import { formatDate } from '../../../lib/format'

interface Props {
  data: HomeStatsBlock
  hosts: string
}

export function HomeStatsSection({ data, hosts }: Props) {
  return (
    <section className="ep-section ep-home-stats">
      <span className="ep-kicker">Nossa casa</span>
      <h2>{hosts || 'Nossa casa'} em números</h2>
      {data.tagline ? <p className="ep-section-lead">{data.tagline}</p> : null}
      <div className="ep-home-stats__grid">
        <article>
          <strong>{data.rooms}</strong>
          <span>cômodos</span>
        </article>
        <article>
          <strong>{data.city}</strong>
          <span>cidade</span>
        </article>
        <article>
          <strong>{data.moveInDate ? formatDate(data.moveInDate).split(',')[0] : 'Em breve'}</strong>
          <span>mudança</span>
        </article>
      </div>
    </section>
  )
}
