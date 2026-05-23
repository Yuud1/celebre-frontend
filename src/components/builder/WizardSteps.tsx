const LABELS = ['Tipo', 'Cores', 'Preview']

interface Props {
  current: number
}

export function WizardSteps({ current }: Props) {
  return (
    <div className="wizard-steps" role="list">
      {LABELS.map((label, i) => (
        <span
          key={label}
          role="listitem"
          className={
            'wizard-step' +
            (i === current ? ' is-active' : '') +
            (i < current ? ' is-done' : '')
          }
        >
          {i + 1}. {label}
        </span>
      ))}
    </div>
  )
}
