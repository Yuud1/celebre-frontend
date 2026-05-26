export type EventTypeId =
  | 'casamento'
  | 'cha-bebe'
  | 'cha-revelacao'
  | 'cha-panela'

export type LayoutId = 'wedding' | 'baby' | 'reveal' | 'home'

export type GiftType = 'fixed' | 'contribution'

export interface GiftItem {
  id: string
  type: GiftType
  name: string
  value: number
  meta?: number
  description?: string
  imageUrl?: string
  featured?: boolean
  collected?: number
}

export interface EventTheme {
  paletteId: string
  primary: string
  secondary: string
  background: string
  accent: string
  ink: string
  fontScale: number
}

export interface EventContent {
  name: string
  subtitle: string
  hosts: string
  eventDate: string
  location: string
  message: string
  signature: string
  coverUrl: string
  gifts: GiftItem[]
}

export interface BuilderState {
  step: number
  eventType: EventTypeId | null
  templateId: string | null
  theme: EventTheme | null
  content: EventContent
  draftId: string | null
}

export interface TemplateDefinition {
  id: string
  eventType: EventTypeId
  name: string
  description: string
  layout: LayoutId
  previewGradient: string
  defaultContent: Partial<EventContent>
}

export interface PaletteDefinition {
  id: string
  name: string
  primary: string
  secondary: string
  background: string
  accent: string
  ink: string
}

export interface EventTypeDefinition {
  id: EventTypeId
  label: string
  emoji: string
  description: string
}
