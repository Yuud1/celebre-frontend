import type { EventContent, EventTheme } from '../../types/event'
import type { EditableField } from '../../types/editor'
import { fieldLabel, giftFieldId } from '../../types/editor'
import { ImagePicker } from './ImagePicker'
import { api } from '../../lib/api'
import { FONT_OPTIONS } from '../../data/fontOptions'

interface Props {
  field: EditableField
  content: EventContent
  theme: EventTheme
  onContent: (patch: Partial<EventContent>) => void
  onTheme: (patch: Partial<EventTheme>) => void
  onGift: (id: string, patch: Partial<EventContent['gifts'][0]>) => void
  onAddGift: (type: 'fixed' | 'contribution') => void
  onRemoveGift: (id: string) => void
}

export function FieldEditor({
  field,
  content,
  theme,
  onContent,
  onTheme,
  onGift,
  onRemoveGift,
}: Props) {
  if (field === 'appearance') {
    return (
      <div className="field-editor">
        <label>
          Cor principal
          <input type="color" value={theme.primary} onChange={(e) => onTheme({ primary: e.target.value })} />
        </label>
        <label>
          Cor de destaque
          <input type="color" value={theme.accent} onChange={(e) => onTheme({ accent: e.target.value })} />
        </label>
        <label>
          Fundo da pagina
          <input type="color" value={theme.background} onChange={(e) => onTheme({ background: e.target.value })} />
        </label>
        <label>
          Cor do texto
          <input type="color" value={theme.ink} onChange={(e) => onTheme({ ink: e.target.value })} />
        </label>
        <label>
          Tipografia
          <select
            value={theme.fontFamily ?? ''}
            onChange={(e) => onTheme({ fontFamily: e.target.value || undefined })}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tamanho do texto ({Math.round(theme.fontScale * 100)}%)
          <input
            type="range"
            min={0.85}
            max={1.2}
            step={0.05}
            value={theme.fontScale}
            onChange={(e) => onTheme({ fontScale: Number(e.target.value) })}
          />
        </label>
      </div>
    )
  }

  if (field.startsWith('gift:')) {
    const giftId = field.slice(5)
    const gift = content.gifts.find((g) => g.id === giftId)
    if (!gift) return <p className="field-editor__empty">Presente nao encontrado.</p>

    return (
      <div className="field-editor">
        <label>
          Tipo
          <select
            value={gift.type}
            onChange={(e) => onGift(giftId, { type: e.target.value as 'fixed' | 'contribution' })}
          >
            <option value="fixed">Presente fixo</option>
            <option value="contribution">Vaquinha</option>
          </select>
        </label>
        <label>
          Nome
          <input value={gift.name} onChange={(e) => onGift(giftId, { name: e.target.value })} />
        </label>
        <label>
          Valor (R$)
          <input
            type="number"
            value={gift.value}
            onChange={(e) => onGift(giftId, { value: Number(e.target.value) })}
          />
        </label>
        {gift.type === 'contribution' ? (
          <label>
            Meta (R$)
            <input
              type="number"
              value={gift.meta ?? gift.value}
              onChange={(e) => onGift(giftId, { meta: Number(e.target.value) })}
            />
          </label>
        ) : null}
        <label>
          Descricao
          <input
            value={gift.description ?? ''}
            onChange={(e) => onGift(giftId, { description: e.target.value })}
          />
        </label>
        <ImagePicker
          label="Foto do presente"
          value={gift.imageUrl ?? ''}
          onChange={(imageUrl) => onGift(giftId, { imageUrl })}
          hint="Opcional"
          uploadFn={api.uploadDraftImage}
        />
        <button type="button" className="btn btn-ghost" onClick={() => onRemoveGift(giftId)}>
          Remover presente
        </button>
      </div>
    )
  }

  if (field === 'coupleStory') {
    const coupleStory = content.sections?.coupleStory
    const timeline = coupleStory?.timeline ?? []

    function updateCoupleStory(patch: Partial<NonNullable<EventContent['sections']>['coupleStory']>) {
      onContent({
        sections: {
          ...content.sections,
          coupleStory: {
            intro: coupleStory?.intro ?? '',
            timeline: timeline,
            ...coupleStory,
            ...patch,
          },
        },
      })
    }

    function updateTimelineItem(index: number, patch: { year?: string; title?: string; text?: string }) {
      const next = [...timeline]
      const current = next[index]
      if (!current) return
      next[index] = { ...current, ...patch }
      updateCoupleStory({ timeline: next })
    }

    function addTimelineItem() {
      const next = [...timeline, { year: '2026', title: 'Novo momento', text: 'Conte aqui esse capítulo.' }]
      updateCoupleStory({ timeline: next })
    }

    function removeTimelineItem(index: number) {
      const next = timeline.filter((_, i) => i !== index)
      updateCoupleStory({ timeline: next })
    }

    return (
      <div className="field-editor">
        <label>
          Introdução
          <textarea
            value={coupleStory?.intro ?? ''}
            onChange={(e) => updateCoupleStory({ intro: e.target.value })}
            autoFocus
          />
        </label>

        {timeline.map((item, index) => (
          <div key={`${item.year}-${item.title}-${index}`} className="gift-editor">
            <label>
              Ano
              <input value={item.year} onChange={(e) => updateTimelineItem(index, { year: e.target.value })} />
            </label>
            <label>
              Título
              <input value={item.title} onChange={(e) => updateTimelineItem(index, { title: e.target.value })} />
            </label>
            <label>
              Texto
              <textarea value={item.text} onChange={(e) => updateTimelineItem(index, { text: e.target.value })} />
            </label>
            <button type="button" className="btn btn-ghost" onClick={() => removeTimelineItem(index)}>
              Remover momento
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-secondary" onClick={addTimelineItem}>
          + Adicionar momento
        </button>
      </div>
    )
  }

  if (field === 'ceremony') {
    const ceremony = content.sections?.ceremony

    function updateCeremony(patch: Partial<NonNullable<EventContent['sections']>['ceremony']>) {
      onContent({
        sections: {
          ...content.sections,
          ceremony: {
            ceremonyPlace: ceremony?.ceremonyPlace ?? content.location,
            ...ceremony,
            ...patch,
          },
        },
      })
    }

    return (
      <div className="field-editor">
        <label>
          Horário da cerimônia
          <input
            value={ceremony?.ceremonyTime ?? ''}
            onChange={(e) => updateCeremony({ ceremonyTime: e.target.value })}
            autoFocus
          />
        </label>
        <label>
          Local da cerimônia
          <input
            value={ceremony?.ceremonyPlace ?? ''}
            onChange={(e) => updateCeremony({ ceremonyPlace: e.target.value })}
          />
        </label>
        <label>
          Endereço da cerimônia
          <input
            value={ceremony?.ceremonyAddress ?? ''}
            onChange={(e) => updateCeremony({ ceremonyAddress: e.target.value })}
          />
        </label>
        <label>
          Horário da recepção
          <input
            value={ceremony?.receptionTime ?? ''}
            onChange={(e) => updateCeremony({ receptionTime: e.target.value })}
          />
        </label>
        <label>
          Local da recepção
          <input
            value={ceremony?.receptionPlace ?? ''}
            onChange={(e) => updateCeremony({ receptionPlace: e.target.value })}
          />
        </label>
        <label>
          Endereço da recepção
          <input
            value={ceremony?.receptionAddress ?? ''}
            onChange={(e) => updateCeremony({ receptionAddress: e.target.value })}
          />
        </label>
        <label>
          Traje
          <input
            value={ceremony?.dressCode ?? ''}
            onChange={(e) => updateCeremony({ dressCode: e.target.value })}
          />
        </label>
      </div>
    )
  }

  const label = fieldLabel(field)

  return (
    <div className="field-editor">
      {field === 'name' && (
        <label>
          {label}
          <input value={content.name} onChange={(e) => onContent({ name: e.target.value })} autoFocus />
        </label>
      )}
      {field === 'subtitle' && (
        <label>
          {label}
          <input value={content.subtitle} onChange={(e) => onContent({ subtitle: e.target.value })} autoFocus />
        </label>
      )}
      {field === 'hosts' && (
        <label>
          {label}
          <input value={content.hosts} onChange={(e) => onContent({ hosts: e.target.value })} autoFocus />
        </label>
      )}
      {field === 'eventDate' && (
        <label>
          {label}
          <input
            type="date"
            value={content.eventDate}
            onChange={(e) => onContent({ eventDate: e.target.value })}
            autoFocus
          />
        </label>
      )}
      {field === 'location' && (
        <label>
          {label}
          <input value={content.location} onChange={(e) => onContent({ location: e.target.value })} autoFocus />
        </label>
      )}
      {field === 'message' && (
        <label>
          {label}
          <textarea value={content.message} onChange={(e) => onContent({ message: e.target.value })} autoFocus />
        </label>
      )}
      {field === 'signature' && (
        <label>
          {label}
          <input value={content.signature} onChange={(e) => onContent({ signature: e.target.value })} autoFocus />
        </label>
      )}
      {field === 'coverUrl' && (
        <ImagePicker
          label={label}
          value={content.coverUrl}
          onChange={(coverUrl) => onContent({ coverUrl })}
          hint="Importe uma foto do seu dispositivo"
          uploadFn={api.uploadDraftImage}
        />
      )}
    </div>
  )
}

export function GiftsQuickActions({
  onAddGift,
}: {
  onAddGift: (type: 'fixed' | 'contribution') => void
}) {
  return (
    <div className="field-editor field-editor--row">
      <button type="button" className="btn btn-secondary" onClick={() => onAddGift('fixed')}>
        + Presente fixo
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => onAddGift('contribution')}>
        + Vaquinha
      </button>
    </div>
  )
}

// re-export for gift id helper
export { giftFieldId }
