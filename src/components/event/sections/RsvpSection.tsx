import { useState } from 'react'
import { api } from '../../../lib/api'

interface Props {
  eventSlug: string
}

type Step = 'form' | 'sending' | 'done'

export function RsvpSection({ eventSlug }: Props) {
  const [step, setStep] = useState<Step>('form')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [attending, setAttending] = useState<'confirmed' | 'declined'>('confirmed')
  const [plusOnes, setPlusOnes] = useState(0)
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const busy = step === 'sending'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('sending')
    setError(null)
    try {
      await api.submitRsvp(eventSlug, {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        status: attending,
        plusOnes: attending === 'confirmed' ? plusOnes : 0,
        dietaryRestrictions: dietaryRestrictions.trim() || undefined,
        message: message.trim() || undefined,
      })
      setStep('done')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao enviar confirmação. Tente novamente.')
      setStep('form')
    }
  }

  return (
    <section className="ep-section ep-rsvp">
      <span className="ep-kicker">Presença</span>
      <h2>Confirme sua presença</h2>

      {step === 'done' ? (
        <p className="ep-rsvp__done">
          {attending === 'confirmed'
            ? 'Presença confirmada! Mal podemos esperar para celebrar com você. 🎉'
            : 'Resposta registrada. Sentiremos sua falta!'}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="ep-rsvp__form">
          <label>
            Seu nome
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Como quer ser identificado"
              required
              disabled={busy}
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={busy}
            />
          </label>

          <div className="ep-rsvp__attending">
            <label>
              <input
                type="radio"
                name="attending"
                checked={attending === 'confirmed'}
                onChange={() => setAttending('confirmed')}
                disabled={busy}
              />
              Vou comparecer
            </label>
            <label>
              <input
                type="radio"
                name="attending"
                checked={attending === 'declined'}
                onChange={() => setAttending('declined')}
                disabled={busy}
              />
              Não poderei ir
            </label>
          </div>

          {attending === 'confirmed' ? (
            <>
              <label>
                Acompanhantes
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={plusOnes}
                  onChange={(e) => setPlusOnes(Math.max(0, Number(e.target.value)))}
                  disabled={busy}
                />
              </label>

              <label>
                Restrições alimentares (opcional)
                <input
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="Ex: vegetariano, alergia a amendoim"
                  disabled={busy}
                />
              </label>
            </>
          ) : null}

          <label>
            Mensagem (opcional)
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Deixe uma mensagem para os anfitriões"
              rows={3}
              disabled={busy}
            />
          </label>

          {error ? <p className="ep-rsvp__error">{error}</p> : null}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy || !guestName.trim() || !guestEmail.trim()}
          >
            {busy ? 'Enviando...' : 'Confirmar resposta'}
          </button>
        </form>
      )}
    </section>
  )
}
