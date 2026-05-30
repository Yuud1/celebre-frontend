import { useEffect, useState } from 'react'
import type { PollStorage } from '../../../lib/eventInteractStorage'
import { castVote, loadPoll, pollPercentages } from '../../../lib/eventInteractStorage'

interface Props {
  storageKey: string
  preview?: boolean
}

export function GenderPollSection({ storageKey, preview }: Props) {
  const [poll, setPoll] = useState<PollStorage>(() => loadPoll(storageKey))
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const perc = pollPercentages(poll)

  useEffect(() => {
    setPoll(loadPoll(storageKey))
    function sync(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      if (!detail || detail === storageKey) setPoll(loadPoll(storageKey))
    }
    window.addEventListener('celebre-poll-update', sync)
    return () => window.removeEventListener('celebre-poll-update', sync)
  }, [storageKey])

  function vote(guess: 'boy' | 'girl') {
    if (preview || poll.userVote) return
    const next = castVote(storageKey, guess, name, message)
    setPoll(next)
    setMessage('')
  }

  return (
    <section className="ep-section ep-gender-poll">
      <span className="ep-kicker">Palpite</span>
      <h2>Team menino ou team menina?</h2>
      <p className="ep-section-lead">
        {preview
          ? 'No preview, a votação fica desativada. Na página publicada, convidados registram o palpite.'
          : poll.userVote
            ? 'Obrigado por participar! Seu palpite entrou na contagem.'
            : 'Registre seu palpite antes da grande revelação.'}
      </p>

      <div className="ep-gender-poll__bar" aria-hidden="true">
        <div className="ep-gender-poll__boy" style={{ width: `${perc.boy}%` }} />
        <div className="ep-gender-poll__girl" style={{ width: `${perc.girl}%` }} />
      </div>
      <div className="ep-gender-poll__stats">
        <span>Menino {perc.boy}% · {poll.boy} votos</span>
        <span>Menina {perc.girl}% · {poll.girl} votos</span>
      </div>

      {!poll.userVote && !preview ? (
        <div className="ep-gender-poll__form">
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ep-input"
          />
          <input
            type="text"
            placeholder="Recado opcional (ex: vai ser menina!)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="ep-input"
          />
          <div className="ep-gender-poll__actions">
            <button type="button" className="ep-btn ep-btn--boy" onClick={() => vote('boy')}>
              Team menino
            </button>
            <button type="button" className="ep-btn ep-btn--girl" onClick={() => vote('girl')}>
              Team menina
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
