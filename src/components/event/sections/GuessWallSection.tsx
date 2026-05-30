import { useEffect, useState } from 'react'
import type { StoredGuess } from '../../../lib/eventInteractStorage'
import { loadPoll } from '../../../lib/eventInteractStorage'
import { PREVIEW_GUESS_MESSAGES } from '../../../data/defaultSections'

interface Props {
  storageKey: string
  preview?: boolean
}

function guessLabel(guess: StoredGuess['guess']) {
  return guess === 'boy' ? 'Team menino' : 'Team menina'
}

export function GuessWallSection({ storageKey, preview }: Props) {
  const [guesses, setGuesses] = useState<StoredGuess[]>(() => loadPoll(storageKey).guesses)

  useEffect(() => {
    function sync(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      if (!detail || detail === storageKey) setGuesses(loadPoll(storageKey).guesses)
    }
    setGuesses(loadPoll(storageKey).guesses)
    window.addEventListener('celebre-poll-update', sync)
    return () => window.removeEventListener('celebre-poll-update', sync)
  }, [storageKey])

  const previewItems: StoredGuess[] = PREVIEW_GUESS_MESSAGES.map((item) => ({
    name: item.guestName,
    guess: item.guess,
    message: item.message,
    createdAt: 0,
  }))
  const display = guesses.length > 0 ? guesses : preview ? previewItems : []

  if (!display.length) return null

  return (
    <section className="ep-section ep-guess-wall">
      <span className="ep-kicker">Mural de palpites</span>
      <h2>O que cada um acha?</h2>
      <div className="ep-guess-wall__grid">
        {display.map((item, i) => (
          <article
            key={`${item.name}-${item.createdAt}-${i}`}
            className={`ep-guess-wall__card ep-guess-wall__card--${item.guess}`}
          >
            <span className="ep-guess-wall__badge">{guessLabel(item.guess)}</span>
            {item.message ? <p>{item.message}</p> : null}
            <cite>{item.name}</cite>
          </article>
        ))}
      </div>
    </section>
  )
}
