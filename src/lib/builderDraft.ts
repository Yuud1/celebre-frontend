import type { BuilderState } from '../types/event'
import { toDraftPayload } from '../templates/registry'
import { api } from './api'

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
