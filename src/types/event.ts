export type EventTypeId =
  | 'casamento'
  | 'cha-bebe'
  | 'cha-revelacao'
  | 'cha-panela'

export type LayoutId = 'wedding' | 'baby' | 'reveal' | 'home'

export type GiftType = 'fixed' | 'contribution'

export type HomeRoomId = 'cozinha' | 'sala' | 'quarto' | 'banheiro' | 'lavanderia'

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
  isPurchased?: boolean
  room?: HomeRoomId
}

export interface TimelineItem {
  year: string
  title: string
  text: string
}

export interface CeremonyBlock {
  ceremonyTime?: string
  ceremonyPlace: string
  ceremonyAddress?: string
  receptionTime?: string
  receptionPlace?: string
  receptionAddress?: string
  dressCode?: string
}

export interface CoupleStoryBlock {
  intro?: string
  timeline: TimelineItem[]
}

export interface PregnancyBlock {
  dueDate?: string
  currentWeek?: number
}

export interface HomeRoom {
  id: HomeRoomId
  name: string
  icon: string
}

export interface ChecklistItem {
  id: string
  label: string
  giftId?: string
}

export interface HomeStatsBlock {
  rooms: number
  city: string
  moveInDate?: string
  tagline?: string
}

export interface EventSections {
  coupleStory?: CoupleStoryBlock
  ceremony?: CeremonyBlock
  pregnancy?: PregnancyBlock
  homeStats?: HomeStatsBlock
  homeRooms?: HomeRoom[]
  checklist?: ChecklistItem[]
  /** Mapeamento nome do presente → cômodo (persiste após publicação) */
  giftRoomByName?: Partial<Record<string, HomeRoomId>>
}

export interface EventTheme {
  paletteId: string
  primary: string
  secondary: string
  background: string
  accent: string
  ink: string
  fontScale: number
  fontFamily?: string
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
  sections?: EventSections
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
