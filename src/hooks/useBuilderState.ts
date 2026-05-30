import { useCallback, useEffect, useState } from 'react'
import type { BuilderState, EventContent, EventTheme, EventTypeId } from '../types/event'
import { insertGift } from '../lib/gifts'
import {
  createDefaultContent,
  createThemeFromPalette,
  getDefaultTemplateByEventType,
  resolveEventContent,
} from '../templates/registry'

const STORAGE_KEY = 'celebre-builder-v2'

export function clearBuilderStorage() {
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem('celebre-builder')
  sessionStorage.removeItem('celebre-template-preview')
}

function loadState(): BuilderState {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('reset') === '1') {
      clearBuilderStorage()
      return initialState
    }
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return normalizeState(JSON.parse(raw))
  } catch {
    return initialState
  }
}

const initialContent: EventContent = {
  name: '',
  subtitle: '',
  hosts: '',
  eventDate: '',
  location: '',
  message: '',
  signature: '',
  coverUrl: '',
  gifts: [],
}

const initialState: BuilderState = {
  step: 0,
  eventType: null,
  templateId: null,
  theme: null,
  content: initialContent,
  draftId: null,
}

const MAX_STEP = 2

function normalizeState(raw: Partial<BuilderState>): BuilderState {
  const merged: BuilderState = {
    ...initialState,
    ...raw,
    content: { ...initialContent, ...raw.content },
  }

  if (merged.step > MAX_STEP) merged.step = MAX_STEP

  if (merged.eventType && merged.content) {
    merged.content = resolveEventContent(merged.eventType, merged.content)
  }

  if (!merged.eventType || !merged.templateId) {
    merged.step = 0
    if (!merged.eventType) {
      merged.templateId = null
      merged.theme = null
    }
    return merged
  }

  if (merged.step >= 2 && !merged.theme) {
    merged.step = 1
    return merged
  }

  if (merged.step === 1 && merged.theme) {
    merged.step = 2
  }

  return merged
}

export function useBuilderState() {
  const [state, setState] = useState<BuilderState>(loadState)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setStep = useCallback((step: number) => {
    setState((s) => ({ ...s, step }))
  }, [])

  const selectEventType = useCallback((eventType: EventTypeId) => {
    const template = getDefaultTemplateByEventType(eventType)
    setState((s) => ({
      ...s,
      eventType,
      templateId: template.id,
      content: createDefaultContent(eventType),
      step: 1,
    }))
  }, [])

  const selectTemplate = useCallback((templateId: string) => {
    setState((s) => {
      if (!s.eventType) return s
      return {
        ...s,
        templateId,
        content: createDefaultContent(s.eventType),
        step: 2,
      }
    })
  }, [])

  const selectPalette = useCallback((paletteId: string) => {
    setState((s) => ({
      ...s,
      theme: createThemeFromPalette(paletteId),
      step: 2,
    }))
  }, [])

  const updateTheme = useCallback((patch: Partial<EventTheme>) => {
    setState((s) => ({
      ...s,
      theme: s.theme ? { ...s.theme, ...patch } : s.theme,
    }))
  }, [])

  const updateContent = useCallback((patch: Partial<EventContent>) => {
    setState((s) => ({
      ...s,
      content: { ...s.content, ...patch },
    }))
  }, [])

  const updateGift = useCallback((id: string, patch: Partial<EventContent['gifts'][0]>) => {
    setState((s) => ({
      ...s,
      content: {
        ...s.content,
        gifts: s.content.gifts.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      },
    }))
  }, [])

  const addGift = useCallback((type: 'fixed' | 'contribution', options?: { featured?: boolean }) => {
    const id = crypto.randomUUID()
    const gift = {
      id,
      type,
      name: type === 'fixed' ? 'Novo presente' : 'Nova vaquinha',
      value: type === 'fixed' ? 100 : 1000,
      meta: type === 'contribution' ? 1000 : undefined,
      description: '',
      featured: options?.featured ?? false,
    }
    setState((s) => ({
      ...s,
      content: {
        ...s.content,
        gifts: insertGift(s.content.gifts, gift),
      },
    }))
    return id
  }, [])

  const removeGift = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      content: {
        ...s.content,
        gifts: s.content.gifts.filter((g) => g.id !== id),
      },
    }))
  }, [])

  const setDraftId = useCallback((draftId: string) => {
    setState((s) => ({ ...s, draftId }))
  }, [])

  const reset = useCallback(() => {
    clearBuilderStorage()
    setState(initialState)
  }, [])

  return {
    state,
    setStep,
    selectEventType,
    selectTemplate,
    selectPalette,
    updateTheme,
    updateContent,
    updateGift,
    addGift,
    removeGift,
    setDraftId,
    reset,
  }
}
