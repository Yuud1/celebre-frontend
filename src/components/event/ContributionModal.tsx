import { useEffect, useRef, useState } from 'react'
import type { GiftItem } from '../../types/event'
import { api } from '../../lib/api'
import { formatCurrency } from '../../lib/format'
import { maskPhone } from '../../lib/mask'

interface Props {
  gift: GiftItem | null
  onClose: () => void
}

type Step = 'form' | 'loading' | 'payment'

function stripCpf(value: string) {
  return value.replace(/\D/g, '')
}

export function ContributionModal({ gift, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<Step>('form')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestCpf, setGuestCpf] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [amount, setAmount] = useState(0)
  const [message, setMessage] = useState('')
  const [chargeUrl, setChargeUrl] = useState('')
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (gift) {
      setStep('form')
      setGuestName('')
      setGuestEmail('')
      setGuestCpf('')
      setGuestPhone('')
      setAmount(gift.type === 'contribution' ? (gift.meta ?? gift.value) : gift.value)
      setMessage('')
      setChargeUrl('')
      setPixQrCodeUrl(undefined)
      setError(null)
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [gift])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gift) return
    const cpf = stripCpf(guestCpf)
    if (cpf.length !== 11) {
      setError('CPF inválido. Digite os 11 dígitos.')
      return
    }
    const phone = guestPhone.replace(/\D/g, '')
    if (phone.length < 10 || phone.length > 11) {
      setError('Telefone inválido. Digite o DDD + número.')
      return
    }
    setStep('loading')
    setError(null)
    try {
      const res = await api.createContribution({
        giftId: gift.id,
        amount,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestCpf: cpf,
        guestPhone: phone,
        message: message.trim() || undefined,
        paymentMethod: 'PIX',
      })
      setChargeUrl(res.chargeUrl)
      setPixQrCodeUrl(res.pixQrCodeUrl)
      setStep('payment')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar cobrança. Tente novamente.')
      setStep('form')
    }
  }

  if (!gift) return null

  const isFixed = gift.type === 'fixed'
  const goal = gift.meta ?? gift.value
  const busy = step === 'loading'

  return (
    <dialog ref={dialogRef} className="contribution-modal" onCancel={onClose}>
      <div className="contribution-modal__card">
        <button type="button" className="contribution-modal__close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <p className="contribution-modal__kicker">{isFixed ? 'Presentear' : 'Contribuir'}</p>
        <h2 className="contribution-modal__title">{gift.name}</h2>

        {step === 'form' || step === 'loading' ? (
          <form onSubmit={handleSubmit} className="contribution-modal__form">
            <label>
              Seu nome
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Como quer ser identificado"
                required
                autoFocus
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
              <small>Você receberá a confirmação de pagamento por aqui</small>
            </label>

            <label>
              CPF
              <input
                value={guestCpf}
                onChange={(e) => setGuestCpf(e.target.value)}
                placeholder="000.000.000-00"
                required
                disabled={busy}
                inputMode="numeric"
              />
            </label>

            <label>
              Telefone
              <input
                value={guestPhone}
                onChange={(e) => setGuestPhone(maskPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                required
                disabled={busy}
                inputMode="tel"
              />
            </label>

            {isFixed ? (
              <div className="contribution-modal__fixed-value">
                <span>Valor</span>
                <strong>{formatCurrency(gift.value)}</strong>
              </div>
            ) : (
              <label>
                Valor da contribuição (R$)
                <input
                  type="number"
                  min={1}
                  max={Math.floor(goal / 100)}
                  step={1}
                  value={Math.round(amount / 100)}
                  onChange={(e) => setAmount(Math.round(Number(e.target.value) * 100))}
                  required
                  disabled={busy}
                />
                <small>Meta: {formatCurrency(goal)}</small>
              </label>
            )}

            <label>
              Recado (opcional)
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Deixe uma mensagem para os anfitriões"
                rows={3}
                disabled={busy}
              />
            </label>

            <p className="contribution-modal__method">Pagamento via PIX</p>

            {error ? <p className="contribution-modal__error">{error}</p> : null}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={busy || !guestName.trim() || !guestEmail.trim() || !guestCpf.trim() || !guestPhone.trim()}
            >
              {busy
                ? 'Gerando cobrança...'
                : `${isFixed ? 'Presentear' : 'Contribuir'} com ${formatCurrency(isFixed ? gift.value : amount)}`}
            </button>
          </form>
        ) : (
          <div className="contribution-modal__payment">
            <p>Cobrança gerada! Acesse o link abaixo para pagar via PIX. Você também receberá a confirmação no seu e-mail.</p>
            <a
              href={chargeUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ display: 'block', textAlign: 'center' }}
            >
              Abrir cobrança PIX
            </a>
            {pixQrCodeUrl ? (
              <div className="contribution-modal__qr">
                <p>Ou escaneie o QR code:</p>
                <img src={pixQrCodeUrl} alt="QR Code PIX" />
              </div>
            ) : null}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </dialog>
  )
}
