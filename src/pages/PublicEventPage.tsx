import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EventPageRenderer } from '../components/event/EventPageRenderer'
import { getTemplateById, getDefaultTemplateByEventType } from '../templates/registry'
import type { EventContent, EventTheme, EventTypeId, LayoutId } from '../types/event'
import { api } from '../lib/api'

const LAYOUT_LABELS: Record<LayoutId, string> = {
  wedding: 'Casamento',
  baby: 'Chá de Bebê',
  reveal: 'Chá Revelação',
  home: 'Chá de Panela',
}

interface ResolvedEvent {
  eventType: EventTypeId
  layout: LayoutId
  theme: EventTheme
  content: EventContent
}

function mapApiResponse(event: any): ResolvedEvent {
  const data = event.data ?? {}
  const eventType = (data.eventType ?? 'casamento') as EventTypeId
  const template = getTemplateById(data.templateId) ?? getDefaultTemplateByEventType(eventType)
  const theme = data.theme as EventTheme

  const content: EventContent = {
    name: data.name ?? '',
    subtitle: data.subtitle ?? '',
    hosts: data.hosts ?? '',
    eventDate: data.eventDate ?? event.eventDate ?? '',
    location: data.location ?? '',
    message: data.description ?? '',
    signature: data.signature ?? '',
    coverUrl: data.coverUrl ?? event.coverUrl ?? '',
    gifts: (event.gifts ?? []).map((g: any) => ({
      id: g.id,
      type: g.type,
      name: g.name,
      value: Number(g.value),
      meta: g.meta != null ? Number(g.meta) : undefined,
      description: g.description ?? undefined,
      imageUrl: g.imageUrl ?? undefined,
      featured: false,
      collected: Number(g.collected ?? 0),
    })),
  }

  return { eventType, layout: template.layout, theme, content }
}

export function PublicEventPage() {
  const { slug } = useParams<{ slug: string }>()
  const [resolved, setResolved] = useState<ResolvedEvent | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    api.getPublicEvent(slug)
      .then((event: any) => {
        const r = mapApiResponse(event)
        setResolved(r)
        document.title = `${LAYOUT_LABELS[r.layout]} — ${r.content.name}`
      })
      .catch(() => setNotFound(true))
    return () => { document.title = 'Celebre' }
  }, [slug])

  if (notFound) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--cb-muted)' }}>
        Evento não encontrado.
      </div>
    )
  }

  if (!resolved) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--cb-muted)' }}>
        Carregando...
      </div>
    )
  }

  return (
    <EventPageRenderer
      eventType={resolved.eventType}
      layout={resolved.layout}
      theme={resolved.theme}
      content={resolved.content}
    />
  )
}
