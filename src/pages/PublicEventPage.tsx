import { useParams } from 'react-router-dom'
import { EventPageRenderer } from '../components/event/EventPageRenderer'
import { createDefaultContent, createThemeFromPalette, getDefaultTemplateByEventType } from '../templates/registry'
import type { BuilderState, EventTypeId } from '../types/event'

function loadPreviewState(): BuilderState | null {
  try {
    const raw = sessionStorage.getItem('celebre-builder')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function PublicEventPage() {
  const { slug } = useParams()
  const saved = loadPreviewState()
  const eventType = (saved?.eventType ?? 'casamento') as EventTypeId
  const template = getDefaultTemplateByEventType(eventType)
  const theme = saved?.theme ?? createThemeFromPalette('linen')
  const content = saved?.content ?? createDefaultContent(eventType)

  return (
    <div>
      <EventPageRenderer
        eventType={eventType}
        layout={template.layout}
        theme={theme}
        content={{
          ...content,
          subtitle: content.subtitle || slug || '',
        }}
      />
    </div>
  )
}
