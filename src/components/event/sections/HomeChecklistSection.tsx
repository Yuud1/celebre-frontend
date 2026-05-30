import type { ChecklistItem, GiftItem } from '../../../types/event'

interface Props {
  items: ChecklistItem[]
  gifts: GiftItem[]
}

export function HomeChecklistSection({ items, gifts }: Props) {
  if (!items.length) return null

  const fulfilledCount = items.filter((item) => isFulfilled(item, gifts)).length
  const progress = Math.round((fulfilledCount / items.length) * 100)

  return (
    <section className="ep-section ep-home-checklist">
      <span className="ep-kicker">Checklist</span>
      <h2>A casa está {progress}% completa</h2>
      <div className="ep-progress ep-progress--tall">
        <div className="ep-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <ul className="ep-home-checklist__list">
        {items.map((item) => {
          const done = isFulfilled(item, gifts)
          return (
            <li key={item.id} className={done ? 'is-done' : undefined}>
              <span className="ep-home-checklist__check" aria-hidden="true">
                {done ? '✓' : '○'}
              </span>
              <span>{item.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function isFulfilled(item: ChecklistItem, gifts: GiftItem[]) {
  if (item.giftId) {
    const gift = gifts.find((g) => g.id === item.giftId)
    if (gift?.type === 'fixed') return !!gift.isPurchased
    if (gift?.type === 'contribution') {
      const goal = gift.meta ?? gift.value
      return goal > 0 && (gift.collected ?? 0) >= goal
    }
  }
  return false
}
