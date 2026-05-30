import type { PregnancyBlock } from '../../../types/event'
import { getBabyWeekInfo, pregnancyProgress, weeksUntilDue } from '../../../lib/babyWeeks'

interface Props {
  data: PregnancyBlock
  babyName: string
}

export function PregnancySection({ data, babyName }: Props) {
  const week = data.currentWeek ?? 32
  const weekInfo = getBabyWeekInfo(week)
  const progress = pregnancyProgress(week)
  const weeksLeft = data.dueDate ? weeksUntilDue(data.dueDate) : Math.max(0, 40 - week)

  return (
    <section className="ep-section ep-pregnancy">
      <div className="ep-pregnancy__gestation">
        <span className="ep-kicker">Gestação</span>
        <h2>Semana {week}</h2>
        <p className="ep-section-lead">
          {weeksLeft > 0
            ? `Faltam ${weeksLeft} semanas para conhecer ${babyName || 'o bebê'}.`
            : `A chegada de ${babyName || 'o bebê'} está bem pertinho.`}
        </p>
        <div className="ep-progress ep-progress--tall">
          <div className="ep-progress__fill" style={{ width: `${progress}%` }} />
        </div>
        <small>{progress}% da jornada · 40 semanas</small>
      </div>

      <div className="ep-pregnancy__size">
        <span className="ep-kicker">Tamanho esta semana</span>
        <div className="ep-pregnancy__size-card">
          <span className="ep-pregnancy__emoji" aria-hidden="true">{weekInfo.emoji}</span>
          <div>
            <h3>Como {weekInfo.size.toLowerCase()}</h3>
            <p>{weekInfo.detail}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
