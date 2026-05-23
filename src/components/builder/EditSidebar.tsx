import type { EventContent, EventTheme } from '../../types/event'
import { ImagePicker } from './ImagePicker'

interface Props {
  content: EventContent
  theme: EventTheme
  onContent: (patch: Partial<EventContent>) => void
  onTheme: (patch: Partial<EventTheme>) => void
  onGift: (id: string, patch: Partial<EventContent['gifts'][0]>) => void
  onAddGift: (type: 'fixed' | 'contribution') => void
  onRemoveGift: (id: string) => void
}

export function EditSidebar({
  content,
  theme,
  onContent,
  onTheme,
  onGift,
  onAddGift,
  onRemoveGift,
}: Props) {
  return (
    <aside className="edit-panel">
      <h3 style={{ margin: 0, fontSize: '1rem' }}>Personalizar</h3>

      <label>
        Nome do evento
        <input
          value={content.name}
          onChange={(e) => onContent({ name: e.target.value })}
        />
      </label>

      <label>
        Subtítulo (ex: Casamento)
        <input
          value={content.subtitle}
          onChange={(e) => onContent({ subtitle: e.target.value })}
        />
      </label>

      <label>
        Anfitriões
        <input
          value={content.hosts}
          onChange={(e) => onContent({ hosts: e.target.value })}
        />
      </label>

      <label>
        Data
        <input
          type="date"
          value={content.eventDate}
          onChange={(e) => onContent({ eventDate: e.target.value })}
        />
      </label>

      <label>
        Local
        <input
          value={content.location}
          onChange={(e) => onContent({ location: e.target.value })}
        />
      </label>

      <label>
        Mensagem
        <textarea
          value={content.message}
          onChange={(e) => onContent({ message: e.target.value })}
        />
      </label>

      <label>
        Assinatura
        <input
          value={content.signature}
          onChange={(e) => onContent({ signature: e.target.value })}
        />
      </label>

      <ImagePicker
        label="Foto de capa"
        value={content.coverUrl}
        onChange={(coverUrl) => onContent({ coverUrl })}
        hint="Importe uma foto do seu dispositivo"
      />

      <hr style={{ border: 0, borderTop: '1px solid var(--cb-border)', margin: '0.5rem 0' }} />

      <label>
        Cor principal
        <input
          type="color"
          value={theme.primary}
          onChange={(e) => onTheme({ primary: e.target.value })}
        />
      </label>

      <label>
        Cor de destaque
        <input
          type="color"
          value={theme.accent}
          onChange={(e) => onTheme({ accent: e.target.value })}
        />
      </label>

      <label>
        Fundo da página
        <input
          type="color"
          value={theme.background}
          onChange={(e) => onTheme({ background: e.target.value })}
        />
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

      <hr style={{ border: 0, borderTop: '1px solid var(--cb-border)', margin: '0.5rem 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.9rem' }}>Presentes</strong>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => onAddGift('fixed')}>
            + Fixo
          </button>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => onAddGift('contribution')}>
            + Vaquinha
          </button>
        </div>
      </div>

      {content.gifts.map((gift) => (
        <div key={gift.id} className="gift-editor">
          <select
            value={gift.type}
            onChange={(e) => onGift(gift.id, { type: e.target.value as 'fixed' | 'contribution' })}
          >
            <option value="fixed">Presente fixo</option>
            <option value="contribution">Vaquinha</option>
          </select>
          <input
            value={gift.name}
            placeholder="Nome"
            onChange={(e) => onGift(gift.id, { name: e.target.value })}
          />
          <input
            type="number"
            value={gift.value}
            placeholder="Valor (R$)"
            onChange={(e) => onGift(gift.id, { value: Number(e.target.value) })}
          />
          {gift.type === 'contribution' ? (
            <input
              type="number"
              value={gift.meta ?? gift.value}
              placeholder="Meta (R$)"
              onChange={(e) => onGift(gift.id, { meta: Number(e.target.value) })}
            />
          ) : null}
          <input
            value={gift.description ?? ''}
            placeholder="Descrição"
            onChange={(e) => onGift(gift.id, { description: e.target.value })}
          />
          <ImagePicker
            label="Foto"
            value={gift.imageUrl ?? ''}
            onChange={(imageUrl) => onGift(gift.id, { imageUrl })}
          />
          <button type="button" className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => onRemoveGift(gift.id)}>
            Remover
          </button>
        </div>
      ))}
    </aside>
  )
}
