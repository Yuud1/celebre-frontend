import type { ReactNode, KeyboardEvent } from 'react'
import type { EditableField } from '../../types/editor'

interface Props {
  field: EditableField
  editable?: boolean
  active?: boolean
  onSelect?: (field: EditableField) => void
  className?: string
  children: ReactNode
  as?: 'inline' | 'block'
}

export function EditableSpot({
  field,
  editable,
  active,
  onSelect,
  className = '',
  children,
  as = 'inline',
}: Props) {
  if (!editable) return <>{children}</>

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(field)
    }
  }

  const Tag = as === 'block' ? 'div' : 'span'
  const classes =
    'ep-editable' +
    (as === 'block' ? ' ep-editable--block' : '') +
    (active ? ' is-active' : '') +
    (className ? ` ${className}` : '')

  return (
    <Tag
      role="button"
      tabIndex={0}
      className={classes}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(field)
      }}
      onKeyDown={handleKey}
    >
      {children}
      <span className="ep-editable__hint" aria-hidden="true">
        Editar
      </span>
    </Tag>
  )
}
