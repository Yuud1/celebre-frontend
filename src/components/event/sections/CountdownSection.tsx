import { useEffect, useState } from 'react'
import { getCountdown } from '../../../lib/countdown'

interface Props {
  targetDate: string
  kicker: string
  title: string
  doneLabel: string
}

export function CountdownSection({ targetDate, kicker, title, doneLabel }: Props) {
  const [parts, setParts] = useState(() => getCountdown(targetDate))

  useEffect(() => {
    const id = window.setInterval(() => setParts(getCountdown(targetDate)), 1000)
    return () => window.clearInterval(id)
  }, [targetDate])

  if (!targetDate) return null

  return (
    <section className="ep-section ep-countdown">
      <span className="ep-kicker">{kicker}</span>
      <h2>{title}</h2>
      {parts.done ? (
        <p className="ep-countdown__done">{doneLabel}</p>
      ) : (
        <div className="ep-countdown__grid" aria-live="polite">
          {[
            { value: parts.days, label: 'Dias' },
            { value: parts.hours, label: 'Horas' },
            { value: parts.minutes, label: 'Min' },
            { value: parts.seconds, label: 'Seg' },
          ].map((item) => (
            <div className="ep-countdown__cell" key={item.label}>
              <strong>{String(item.value).padStart(2, '0')}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
