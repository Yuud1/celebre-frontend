interface Props {
  label: string
  onClick: () => void
  variant?: 'card' | 'row'
}

export function SectionAddButton({ label, onClick, variant = 'card' }: Props) {
  return (
    <button
      type="button"
      className={'ep-section-add' + (variant === 'row' ? ' ep-section-add--row' : '')}
      onClick={onClick}
      aria-label={label}
    >
      <span className="ep-section-add__icon" aria-hidden="true">
        +
      </span>
      <span className="ep-section-add__label">{label}</span>
    </button>
  )
}
