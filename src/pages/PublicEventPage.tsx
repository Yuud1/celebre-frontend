import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EventPageRenderer } from '../components/event/EventPageRenderer'
import { ContributionModal } from '../components/event/ContributionModal'
import { getTemplateById, getDefaultTemplateByEventType, resolveEventContent } from '../templates/registry'
import type { EventContent, EventTheme, EventTypeId, GiftItem, LayoutId } from '../types/event'
import type { GalleryImage } from '../components/event/sections/GallerySection'
import { api } from '../lib/api'

const LAYOUT_LABELS: Record<LayoutId, string> = {
  wedding: 'Casamento',
  baby: 'Chá de Bebê',
  reveal: 'Chá Revelação',
  home: 'Chá de Panela',
}

export interface GuestMessage {
  message: string
  guestName: string
}

interface ResolvedEvent {
  eventType: EventTypeId
  layout: LayoutId
  theme: EventTheme
  content: EventContent
  messages: GuestMessage[]
}

function normalizeDateInput(value: unknown): string {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function mapApiResponse(event: any): ResolvedEvent {
  const data = event.data ?? {}
  const eventType = (data.eventType ?? 'casamento') as EventTypeId
  const template = getTemplateById(data.templateId) ?? getDefaultTemplateByEventType(eventType)
  const theme = data.theme as EventTheme

  const content: EventContent = resolveEventContent(eventType, {
    name: data.name ?? '',
    subtitle: data.subtitle ?? '',
    hosts: data.hosts ?? '',
    eventDate: normalizeDateInput(data.eventDate ?? event.eventDate),
    location: data.location ?? '',
    message: data.description ?? '',
    signature: data.signature ?? '',
    coverUrl: data.coverUrl ?? event.coverUrl ?? '',
    sections: data.sections,
    gifts: (event.gifts ?? []).map((g: any) => {
      const draftGift = (data.gifts ?? []).find((dg: { name: string }) => dg.name === g.name)
      return {
        id: g.id,
        type: g.type,
        name: g.name,
        value: Number(g.value),
        meta: g.meta != null ? Number(g.meta) : undefined,
        description: g.description ?? undefined,
        imageUrl: g.imageUrl ?? undefined,
        featured: false,
        collected: Number(g.collected ?? 0),
        isPurchased: !!g.isPurchased,
        room: draftGift?.room ?? data.sections?.giftRoomByName?.[g.name],
      }
    }),
  })

  const messages: GuestMessage[] = (event.messages ?? []).map((m: any) => ({
    message: m.message,
    guestName: m.guestName,
  }))

  return { eventType, layout: template.layout, theme, content, messages }
}

export function PublicEventPage() {
  const { slug } = useParams<{ slug: string }>()
  const [resolved, setResolved] = useState<ResolvedEvent | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [activeGift, setActiveGift] = useState<GiftItem | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])

  useEffect(() => {
    if (!slug) return
    api.getPublicEvent(slug)
      .then((event: any) => {
        const r = mapApiResponse(event)
        setResolved(r)
        document.title = `${LAYOUT_LABELS[r.layout]} — ${r.content.name}`
      })
      .catch(() => setNotFound(true))
    api.getPublicGallery(slug)
      .then((images: any[]) => setGalleryImages(images))
      .catch(() => setGalleryImages([]))
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
    <>
      <EventPageRenderer
        eventType={resolved.eventType}
        layout={resolved.layout}
        theme={resolved.theme}
        content={resolved.content}
        messages={resolved.messages}
        eventSlug={slug}
        onGiftAction={setActiveGift}
        galleryImages={galleryImages}
      />
      <ContributionModal gift={activeGift} onClose={() => setActiveGift(null)} />
    </>
  )
}
