import { useRef, useState } from 'react'
import { Icon } from '../../../auth/AuthIcons'
import { PageHead } from '../../../../pages/DashboardPage'
import { DashBtn } from '../../DashBtn'
import { api } from '../../../../lib/api'
import { cn } from '@/lib/utils'
import { GiftCardItem } from './components/GiftCardItemProps'

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
    value: String((gift.value ?? 0) / 100),
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

  const inputCls = 'w-full px-2.5 py-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-indigo-400 box-border'
  const labelTextCls = 'text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500'

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
        value: Math.round(parsedValue * 100),
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
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-[4px] z-[1000] flex items-center justify-center p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-[0_24px_60px_rgba(15,23,42,0.18)] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="font-display font-semibold text-[17px]">
              {isEdit ? 'Editar presente' : 'Novo presente'}
            </div>
            <div className="text-[12.5px] text-slate-500 mt-0.5">
              {isEdit ? 'Altere as informações do presente.' : 'Adicione um presente fixo ou uma vaquinha coletiva.'}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 inline-flex items-center justify-center text-slate-500 cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 14, height: 14 }}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 overflow-y-auto">
          {/* Type toggle */}
          <div>
            <span className={labelTextCls}>Tipo</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(['fixed', 'contribution'] as const).map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={cn(
                    'px-3.5 py-2.5 rounded-[10px] border-[1.5px] cursor-pointer text-left transition-all',
                    form.type === t ? 'border-indigo-500 bg-indigo-50/60 text-indigo-600' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                  )}
                >
                  <div className="font-semibold text-[13px]">{t === 'fixed' ? 'Presente fixo' : 'Vaquinha coletiva'}</div>
                  <div className="text-[11px] font-normal mt-0.5 opacity-80">
                    {t === 'fixed' ? 'Item com valor definido' : 'Meta coletiva de arrecadação'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelTextCls}>Nome do presente</span>
            <input
              className={inputCls}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={form.type === 'fixed' ? 'Ex: Jogo de panelas, Liquidificador…' : 'Ex: Lua de mel, Reforma do quarto…'}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelTextCls}>{form.type === 'fixed' ? 'Valor do presente (R$)' : 'Meta da vaquinha (R$)'}</span>
            <input className={inputCls} type="number" min="0.01" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0,00" />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelTextCls}>Descrição <span className="normal-case font-normal">(opcional)</span></span>
            <textarea className={cn(inputCls, 'resize-y min-h-[72px] leading-[1.55]')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Uma breve descrição para os convidados…" />
          </label>

          {/* Image upload */}
          <div>
            <span className={labelTextCls}>Imagem <span className="normal-case font-normal">(opcional)</span></span>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            {imagePreview ? (
              <div className="mt-2 rounded-[10px] overflow-hidden border border-slate-200 relative">
                <img src={imagePreview} alt="" className="w-full h-[140px] object-cover block" />
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-2.5 py-1 rounded-lg bg-white/90 border-0 text-[12px] font-semibold cursor-pointer">Trocar</button>
                  <button type="button" onClick={() => { setImagePreview(''); setImageFile(null) }} className="px-2.5 py-1 rounded-lg bg-white/90 border-0 text-[12px] font-semibold cursor-pointer text-red-500">Remover</button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full py-[18px] rounded-[10px] border-[1.5px] border-dashed border-slate-200 bg-slate-50 cursor-pointer text-[13px] text-slate-500 flex flex-col items-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[22px] h-[22px] text-slate-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Escolher imagem</span>
                <span className="text-[11px] text-slate-400">JPG, PNG ou WebP · até 5 MB</span>
              </button>
            )}
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200/60 text-red-700 text-[13px]">{error}</div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <DashBtn type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancelar</DashBtn>
            <DashBtn type="submit" variant="primary" disabled={saving}>
              <Icon.Check style={{ width: 15, height: 15 }} />
              {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Adicionar presente'}
            </DashBtn>
          </div>
        </form>
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
              <DashBtn variant="ghost" as="a" href={`/p/${event.slug}`} target="_blank" rel="noreferrer">
                <Icon.Eye style={{ width: 15, height: 15 }} />Ver página pública
              </DashBtn>
            )}
            {event?.id && (
              <DashBtn variant="primary" onClick={() => setFormState({ mode: 'create' })}>
                <Icon.Sparkle style={{ width: 15, height: 15 }} />Novo presente
              </DashBtn>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 nav:grid-cols-3 gap-4">
        {gifts.map((g: any) => (
          <GiftCardItem
            key={g.id}
            gift={g}
            onEdit={gift => setFormState({ mode: 'edit', gift })}
            onDelete={handleDelete}
          />
        ))}
        {gifts.length === 0 && (
          <div className="col-span-full text-center py-[60px] text-slate-500 text-[14px]">
            <div className="mb-4">
              <span className="w-[52px] h-[52px] rounded-[14px] bg-violet-100 text-indigo-500 inline-flex items-center justify-center">
                <Icon.Sparkle style={{ width: 22, height: 22 }} />
              </span>
            </div>
            <div className="font-display font-semibold text-[16px] text-slate-900 mb-1.5">Nenhum presente ainda</div>
            <div className="max-w-[340px] mx-auto mb-5">
              Adicione presentes fixos ou vaquinhas coletivas para os seus convidados contribuírem.
            </div>
            {event?.id && (
              <DashBtn variant="primary" onClick={() => setFormState({ mode: 'create' })}>
                <Icon.Sparkle style={{ width: 15, height: 15 }} />Adicionar primeiro presente
              </DashBtn>
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
