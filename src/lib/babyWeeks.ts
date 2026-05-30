export interface BabyWeekInfo {
  week: number
  size: string
  emoji: string
  detail: string
}

const WEEKS: BabyWeekInfo[] = [
  { week: 8, size: 'Framboesa', emoji: '🫐', detail: 'O coração já bate forte.' },
  { week: 12, size: 'Limão', emoji: '🍋', detail: 'Os reflexos começam a aparecer.' },
  { week: 16, size: 'Abacate', emoji: '🥑', detail: 'Movimentos mais perceptíveis.' },
  { week: 20, size: 'Banana', emoji: '🍌', detail: 'Metade da jornada!' },
  { week: 24, size: 'Milho', emoji: '🌽', detail: 'O bebê ouve vozes familiares.' },
  { week: 28, size: 'Berinjela', emoji: '🍆', detail: 'Olhos que respondem à luz.' },
  { week: 32, size: 'Abóbora', emoji: '🎃', detail: 'Ganhando peso a cada dia.' },
  { week: 36, size: 'Melancia pequena', emoji: '🍉', detail: 'Quase pronto para o mundo.' },
  { week: 40, size: 'Melancia', emoji: '🍉', detail: 'Chegada iminente!' },
]

export function getBabyWeekInfo(week: number): BabyWeekInfo {
  const clamped = Math.max(4, Math.min(40, week))
  let best = WEEKS[0]
  for (const entry of WEEKS) {
    if (entry.week <= clamped) best = entry
  }
  return { ...best, week: clamped }
}

export function weeksUntilDue(dueDate: string): number {
  if (!dueDate) return 0
  const due = new Date(dueDate + 'T12:00:00').getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((due - now) / (7 * 24 * 60 * 60 * 1000)))
}

export function pregnancyProgress(week: number): number {
  return Math.min(100, Math.round((week / 40) * 100))
}
