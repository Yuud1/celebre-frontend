export type GenderGuess = 'boy' | 'girl'

export interface StoredGuess {
  name: string
  guess: GenderGuess
  message?: string
  createdAt: number
}

export interface PollStorage {
  boy: number
  girl: number
  guesses: StoredGuess[]
  userVote?: GenderGuess
}

const PREFIX = 'celebre-interact-'

function key(storageKey: string) {
  return `${PREFIX}${storageKey}`
}

export function loadPoll(storageKey: string): PollStorage {
  try {
    const raw = localStorage.getItem(key(storageKey))
    if (!raw) return { boy: 0, girl: 0, guesses: [] }
    return JSON.parse(raw) as PollStorage
  } catch {
    return { boy: 0, girl: 0, guesses: [] }
  }
}

export function savePoll(storageKey: string, data: PollStorage) {
  localStorage.setItem(key(storageKey), JSON.stringify(data))
  window.dispatchEvent(new CustomEvent('celebre-poll-update', { detail: storageKey }))
}

export function castVote(
  storageKey: string,
  guess: GenderGuess,
  name: string,
  message?: string,
): PollStorage {
  const current = loadPoll(storageKey)
  if (current.userVote) return current

  const entry: StoredGuess = {
    name: name.trim() || 'Convidado',
    guess,
    message: message?.trim() || undefined,
    createdAt: Date.now(),
  }

  const next: PollStorage = {
    boy: current.boy + (guess === 'boy' ? 1 : 0),
    girl: current.girl + (guess === 'girl' ? 1 : 0),
    guesses: [entry, ...current.guesses].slice(0, 48),
    userVote: guess,
  }

  savePoll(storageKey, next)
  return next
}

export function pollPercentages(poll: PollStorage) {
  const total = poll.boy + poll.girl
  if (total === 0) return { boy: 50, girl: 50, total: 0 }
  return {
    boy: Math.round((poll.boy / total) * 100),
    girl: Math.round((poll.girl / total) * 100),
    total,
  }
}
