export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function getCountdown(targetIso: string, now = Date.now()): CountdownParts {
  if (!targetIso) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }

  const target = new Date(targetIso + 'T12:00:00').getTime()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, done: false }
}
