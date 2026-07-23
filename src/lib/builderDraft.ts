import type { BuilderState, EventSections, EventTheme, EventTypeId, GiftItem, GiftType, HomeRoomId } from '../types/event'
import { createThemeFromPalette, PALETTES, resolveEventContent, toDraftPayload } from '../templates/registry'
import { api } from './api'

interface DraftPayloadShape {
  name?: string
  description?: string
  eventDate?: string
  coverUrl?: string
  eventType?: EventTypeId
  templateId?: string
  theme?: EventTheme
  hosts?: string
  subtitle?: string
  location?: string
  signature?: string
  sections?: EventSections
  gifts?: Array<{
    type: GiftType
    name: string
    value: number
    meta?: number
    description?: string
    imageUrl?: string
    room?: HomeRoomId
  }>
}

const STORAGE_KEY = 'celebre-builder-v2'

export function loadBuilderStateFromStorage(): BuilderState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BuilderState
  } catch {
    return null
  }
}

function saveBuilderState(state: BuilderState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export async function syncBuilderDraftFromStorage(): Promise<string | null> {
  const state = loadBuilderStateFromStorage()
  if (!state?.eventType || !state.templateId || !state.theme) return null

  const payload = toDraftPayload({
    eventType: state.eventType,
    templateId: state.templateId,
    theme: state.theme,
    content: state.content,
  })

  if (state.draftId) {
    await api.updateDraft(state.draftId, payload)
    return state.draftId
  }

  const draft = await api.createDraft(payload)
  saveBuilderState({ ...state, draftId: draft.id })
  return draft.id
}

/** Backend é fonte de verdade: reconstrói o BuilderState a partir do draft
 * salvo no servidor. sessionStorage continua sendo só o cache local (usado
 * como estado inicial rápido antes dessa chamada resolver). */
export async function hydrateFromDraft(draftId: string): Promise<BuilderState | null> {
  try {
    const draft = await api.getDraft(draftId)
    if (!draft || draft.status !== 'draft') return null

    const payload = draft.payload as DraftPayloadShape
    if (!payload.eventType || !payload.templateId) return null

    const eventType = payload.eventType
    const gifts: GiftItem[] = (payload.gifts ?? []).map((g) => ({
      id: crypto.randomUUID(),
      type: g.type,
      name: g.name,
      value: g.value,
      meta: g.meta,
      description: g.description,
      imageUrl: g.imageUrl,
      room: g.room,
    }))

    const content = resolveEventContent(eventType, {
      name: payload.name ?? '',
      subtitle: payload.subtitle ?? '',
      hosts: payload.hosts ?? '',
      eventDate: payload.eventDate ?? '',
      location: payload.location ?? '',
      message: payload.description ?? '',
      signature: payload.signature ?? '',
      coverUrl: payload.coverUrl ?? '',
      sections: payload.sections,
      gifts,
    })

    return {
      step: 2,
      eventType,
      templateId: payload.templateId,
      theme: payload.theme ?? createThemeFromPalette(PALETTES[0].id),
      content,
      draftId: draft.id,
    }
  } catch {
    return null
  }
}

export function isCheckoutPublishRedirect(redirect: string | null): boolean {
  if (!redirect) return false
  try {
    const url = new URL(redirect, window.location.origin)
    return url.pathname === '/criar/checkout' && url.searchParams.get('publish') === '1'
  } catch {
    return redirect.startsWith('/criar/checkout') && redirect.includes('publish=1')
  }
}

export const CHECKOUT_PUBLISH_REDIRECT = '/criar/checkout?publish=1'
