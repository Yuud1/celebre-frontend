import { useRef, useState } from 'react'
import { Icon } from '../auth/AuthIcons'
import { PageHead } from '../../pages/DashboardPage'
import { Money } from './DashWidgets'
import { api } from '../../lib/api'

// ─── Gift Form Modal ──────────────────────────────────────────

interface GiftFormData {
  type: 'fixed' | 'contribution'
  name: string
  value: string
  description: string
}

const emptyForm: GiftFormData = { type: 'fixed', name: '', value: '', description: '' }

function giftToForm(gift: any): GiftFormData {
  return {
    type: gift.type ?? 'fixed',
    name: gift.name ?? '',
    value: String(gift.value ?? ''),
    description: gift.description ?? '',
  }
}

interface GiftFormModalProps {
  eventId: string
  gift?: any
  onClose: () => void
  onSaved: () => void
}

function GiftFormModal({ eventId, gift, onClose, onSaved }: GiftFormModalProps) {
  const isEdit = !!gift
  const [form, setForm] = useState<GiftFormData>(isEdit ? giftToForm(gift) : emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(gift?.imageUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 11px', borderRadius: 8, border: '1px solid var(--ca-line)',
    fontSize: 13, color: 'var(--ca-ink)', background: '#fff', boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
  const labelTextStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ca-muted)',
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    const parsedValue = parseFloat(form.value.replace(',', '.'))
    if (isNaN(parsedValue) || parsedValue <= 0) { setError('Informe um valor válido maior que zero.'); return }

    setSaving(true)
    setError('')
    try {
      let imageUrl = isEdit ? (gift.imageUrl ?? '') : ''
      if (imageFile) {
        const { url } = await api.uploadGiftImage(eventId, imageFile)
        imageUrl = url
      }

      const payload: Record<string, unknown> = {
        type: form.type,
        name: form.name.trim(),
        value: parsedValue,
      }
      if (form.description.trim()) payload.description = form.description.trim()
      if (imageUrl) payload.imageUrl = imageUrl

      if (isEdit) {
        await api.updateGift(eventId, gift.id, payload)
      } else {
        await api.createGift(eventId, payload)
      }
      onSaved()
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar presente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(15,23,42,0.18)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--ca-line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 17 }}>
              {isEdit ? 'Editar presente' : 'Novo presente'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 2 }}>
              {isEdit ? 'Altere as informações do presente.' : 'Adicione um presente fixo ou uma vaquinha coletiva.'}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--ca-line)', background: 'var(--ca-bg-soft)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ca-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 14, height: 14 }}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* Type toggle */}
          <div>
            <span style={labelTextStyle}>Tipo</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              {(['fixed', 'contribution'] as const).map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${form.type === t ? 'var(--ca-indigo)' : 'var(--ca-line)'}`,
                    background: form.type === t ? 'var(--ca-violet-50)' : '#fff',
                    color: form.type === t ? 'var(--ca-indigo)' : 'var(--ca-muted)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t === 'fixed' ? 'Presente fixo' : 'Vaquinha coletiva'}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, color: form.type === t ? 'var(--ca-indigo)' : 'var(--ca-muted-2)' }}>
                    {t === 'fixed' ? 'Item com valor definido' : 'Meta coletiva de arrecadação'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Nome do presente</span>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={form.type === 'fixed' ? 'Ex: Jogo de panelas, Liquidificador…' : 'Ex: Lua de mel, Reforma do quarto…'}
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>{form.type === 'fixed' ? 'Valor do presente (R$)' : 'Meta da vaquinha (R$)'}</span>
            <input
              style={inputStyle}
              type="number"
              min="0.01"
              step="0.01"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder="0,00"
            />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Descrição <span style={{ textTransform: 'none', fontWeight: 400 }}>(opcional)</span></span>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.55 }}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Uma breve descrição para os convidados…"
            />
          </label>

          {/* Image upload */}
          <div>
            <span style={labelTextStyle}>Imagem <span style={{ textTransform: 'none', fontWeight: 400 }}>(opcional)</span></span>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageChange} />
            {imagePreview ? (
              <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--ca-line)', position: 'relative' }}>
                <img src={imagePreview} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.92)', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Trocar
                  </button>
                  <button type="button" onClick={() => { setImagePreview(''); setImageFile(null) }} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.92)', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#EF4444' }}>
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: 8, width: '100%', padding: '18px 0', borderRadius: 10, border: '1.5px dashed var(--ca-line)', background: 'var(--ca-bg-soft)', cursor: 'pointer', fontSize: 13, color: 'var(--ca-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 22, height: 22, color: 'var(--ca-muted-2)' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Escolher imagem</span>
                <span style={{ fontSize: 11, color: 'var(--ca-muted-2)' }}>JPG, PNG ou WebP · até 5 MB</span>
              </button>
            )}
          </div>

          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#DC2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="ca-row" style={{ gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13 }} onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 18px', fontSize: 13 }} disabled={saving}>
              <Icon.Check style={{ width: 15, height: 15 }} />
              {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Adicionar presente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Gift Card ────────────────────────────────────────────────

interface GiftCardItemProps {
  gift: any
  onEdit: (gift: any) => void
  onDelete: (giftId: string) => void
}

function GiftCardItem({ gift, onEdit, onDelete }: GiftCardItemProps) {
  const isFixed = gift.type === 'fixed'
  const isPurchased = gift.isPurchased
  const collected = Number(gift.collected ?? 0)
  const goal = Number(gift.value ?? 0)
  const pct = isFixed
    ? (isPurchased ? 100 : 0)
    : (goal > 0 ? Math.min(100, (collected / goal) * 100) : 0)
  const typeLabel = gift.type === 'fixed' ? 'Fixo' : 'Coletivo'

  const iconBtnStyle: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 8,
    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
  }

  return (
    <div className="cd-gift">
      <div className="cd-gift__image ca-ph" style={{ position: 'relative' }}>
        {gift.imageUrl && (
          <img src={gift.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span className="ca-badge" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: 'none', color: 'var(--ca-ink)' }}>
            {typeLabel}
          </span>
          {isPurchased && (
            <span className="ca-badge ca-badge--success">
              <Icon.Check style={{ width: 11, height: 11 }} />Quitado
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(gift)} style={{ ...iconBtnStyle, color: 'var(--ca-indigo)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={() => onDelete(gift.id)} style={{ ...iconBtnStyle, color: '#EF4444' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14 }}>
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="cd-gift__body">
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{gift.name}</div>
        {gift.description && (
          <div style={{ fontSize: 12.5, color: 'var(--ca-muted)', marginTop: 4, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {gift.description}
          </div>
        )}
        <div className="ca-row ca-row--between" style={{ marginTop: 12, marginBottom: 8 }}>
          <Money value={isFixed ? (isPurchased ? goal : 0) : collected} size={17} />
          {goal > 0 && <span style={{ fontSize: 12, color: 'var(--ca-muted)', fontVariantNumeric: 'tabular-nums' }}>de R$ {goal.toLocaleString('pt-BR')}</span>}
        </div>
        <div className={'cd-progress' + (isPurchased ? ' cd-progress--success' : '')}>
          <div className="cd-progress__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="ca-row ca-row--between" style={{ marginTop: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--ca-muted)' }}>{isFixed ? (isPurchased ? 'Quitado' : 'Não quitado') : `${Math.round(pct)}% arrecadado`}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: isPurchased ? '#047857' : 'var(--ca-indigo)' }}>{Math.round(pct)}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Dash Gifts ───────────────────────────────────────────────

type FormState = null | { mode: 'create' } | { mode: 'edit'; gift: any }

interface DashGiftsProps { event: any | null; onReload: () => void }

export function DashGifts({ event, onReload }: DashGiftsProps) {
  const gifts: any[] = event?.gifts ?? []
  const [formState, setFormState] = useState<FormState>(null)

  const handleDelete = async (giftId: string) => {
    if (!event?.id) return
    if (!window.confirm('Remover este presente?')) return
    try {
      await api.deleteGift(event.id, giftId)
      onReload()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleSaved = () => {
    setFormState(null)
    onReload()
  }

  return (
    <>
      <PageHead
        eyebrow="Catálogo do evento"
        title="Presentes"
        sub={`${gifts.length} presente${gifts.length !== 1 ? 's' : ''} cadastrado${gifts.length !== 1 ? 's' : ''}.`}
        actions={
          <>
            {event?.slug && (
              <a href={`/p/${event.slug}`} target="_blank" rel="noreferrer" className="ca-btn ca-btn--ghost" style={{ height: 38, padding: '0 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon.Eye style={{ width: 15, height: 15 }} />Ver página pública
              </a>
            )}
            {event?.id && (
              <button className="ca-btn ca-btn--primary" style={{ height: 38, padding: '0 16px', fontSize: 13 }} onClick={() => setFormState({ mode: 'create' })}>
                <Icon.Sparkle style={{ width: 15, height: 15 }} />Novo presente
              </button>
            )}
          </>
        }
      />

      <div className="cd-grid-gifts" style={{ gap: 16 }}>
        {gifts.map((g: any) => (
          <GiftCardItem
            key={g.id}
            gift={g}
            onEdit={gift => setFormState({ mode: 'edit', gift })}
            onDelete={handleDelete}
          />
        ))}
        {gifts.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--ca-muted)', fontSize: 14 }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--ca-violet-100)', color: 'var(--ca-indigo)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.Sparkle style={{ width: 22, height: 22 }} />
              </span>
            </div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--ca-ink)', marginBottom: 6 }}>
              Nenhum presente ainda
            </div>
            <div style={{ maxWidth: 340, margin: '0 auto 20px' }}>
              Adicione presentes fixos ou vaquinhas coletivas para os seus convidados contribuírem.
            </div>
            {event?.id && (
              <button className="ca-btn ca-btn--primary" style={{ height: 40, padding: '0 20px', fontSize: 13 }} onClick={() => setFormState({ mode: 'create' })}>
                <Icon.Sparkle style={{ width: 15, height: 15 }} />Adicionar primeiro presente
              </button>
            )}
          </div>
        )}
      </div>

      {formState && event?.id && (
        <GiftFormModal
          eventId={event.id}
          gift={formState.mode === 'edit' ? formState.gift : undefined}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
