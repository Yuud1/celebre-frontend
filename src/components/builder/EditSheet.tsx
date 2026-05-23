import type { EventContent, EventTheme } from '../../types/event'
import type { EditableField } from '../../types/editor'
import { fieldLabel } from '../../types/editor'
import { FieldEditor } from './FieldEditor'

interface Props {
  open: boolean
  field: EditableField | null
  content: EventContent
  theme: EventTheme
  onClose: () => void
  onContent: (patch: Partial<EventContent>) => void
  onTheme: (patch: Partial<EventTheme>) => void
  onGift: (id: string, patch: Partial<EventContent['gifts'][0]>) => void
  onAddGift: (type: 'fixed' | 'contribution') => void
  onRemoveGift: (id: string) => void
}

export function EditSheet({
  open,
  field,
  content,
  theme,
  onClose,
  onContent,
  onTheme,
  onGift,
  onAddGift,
  onRemoveGift,
}: Props) {
  if (!field) return null

  return (
    <div className={'edit-sheet-root' + (open ? ' is-open' : '')} aria-hidden={!open}>
      <button type="button" className="edit-sheet-backdrop" aria-label="Fechar" onClick={onClose} />
      <div className="edit-sheet" role="dialog" aria-modal="true" aria-labelledby="edit-sheet-title">
        <div className="edit-sheet__handle" aria-hidden="true" />
        <header className="edit-sheet__header">
          <h2 id="edit-sheet-title">{fieldLabel(field)}</h2>
          <button type="button" className="edit-sheet__close" onClick={onClose}>
            Pronto
          </button>
        </header>
        <div className="edit-sheet__body">
          <FieldEditor
            field={field}
            content={content}
            theme={theme}
            onContent={onContent}
            onTheme={onTheme}
            onGift={onGift}
            onAddGift={onAddGift}
            onRemoveGift={onRemoveGift}
          />
        </div>
      </div>
    </div>
  )
}
