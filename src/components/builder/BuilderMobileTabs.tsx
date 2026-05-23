type MobilePanel = 'chat' | 'preview'

interface BuilderMobileTabsProps {
  active: MobilePanel
  onChange: (panel: MobilePanel) => void
  previewReady?: boolean
}

export function BuilderMobileTabs({ active, onChange, previewReady }: BuilderMobileTabsProps) {
  return (
    <nav className="ai-mobile-tabs" aria-label="Alternar entre chat e preview">
      <button
        type="button"
        className={'ai-mobile-tabs__btn' + (active === 'chat' ? ' is-active' : '')}
        onClick={() => onChange('chat')}
        aria-current={active === 'chat' ? 'page' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4.5 4.5V16H6.5A2.5 2.5 0 0 1 4 13.5v-8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Chat
      </button>
      <button
        type="button"
        className={'ai-mobile-tabs__btn' + (active === 'preview' ? ' is-active' : '')}
        onClick={() => onChange('preview')}
        aria-current={active === 'preview' ? 'page' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Preview
        {previewReady ? <span className="ai-mobile-tabs__dot" aria-hidden="true" /> : null}
      </button>
    </nav>
  )
}
