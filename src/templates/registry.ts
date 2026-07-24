import type {
  EventContent,
  EventTheme,
  EventTypeDefinition,
  EventTypeId,
  TemplateDefinition,
} from '../types/event'
import { applyGiftRooms, createDefaultSections, mergeSections } from '../data/defaultSections'
import { createThemeFromPalette, getPaletteById } from '../lib/themeCatalog'

export { createThemeFromPalette, getPaletteById }

export const EVENT_TYPES: EventTypeDefinition[] = [
  {
    id: 'casamento',
    label: 'Casamento',
    emoji: '💍',
    description: 'Uma lista elegante para presentes, cotas e lua de mel.',
  },
  {
    id: 'cha-bebe',
    label: 'Chá de bebê',
    emoji: '👶',
    description: 'Uma página delicada para enxoval, quarto e recadinhos.',
  },
  {
    id: 'cha-revelacao',
    label: 'Chá revelação',
    emoji: '🎀',
    description: 'Uma experiência leve para celebrar a descoberta com todos.',
  },
  {
    id: 'cha-panela',
    label: 'Chá de panela',
    emoji: '🏠',
    description: 'Presentes e vaquinhas para montar o primeiro lar.',
  },
]

const giftsByType: Record<EventTypeId, EventContent['gifts']> = {
  casamento: [
    { id: 'g1', type: 'contribution', name: 'Lua de mel no Chile', value: 1200000, meta: 1200000, description: 'Atacama, Valparaiso e alguns jantares sem pressa.', featured: true },
    { id: 'g2', type: 'fixed', name: 'Aparelho de jantar', value: 128000, description: 'Servico para receber a familia nos domingos.' },
    { id: 'g3', type: 'fixed', name: 'Maquina de espresso', value: 289000, description: 'Cafe bom para a casa nova.' },
    { id: 'g4', type: 'contribution', name: 'Moveis da sala', value: 800000, meta: 800000, description: 'Uma casa com cara de comeco.' },
  ],
  'cha-bebe': [
    { id: 'g1', type: 'contribution', name: 'Quarto da Olivia', value: 800000, meta: 800000, description: 'Berco, comoda, poltrona e enxoval.', featured: true },
    { id: 'g2', type: 'fixed', name: 'Kit higiene', value: 38000, description: 'Porcelana, bandeja e potinhos.' },
    { id: 'g3', type: 'fixed', name: 'Fraldas do primeiro mes', value: 29000, description: 'O basico que salva os primeiros dias.' },
    { id: 'g4', type: 'contribution', name: 'Carrinho de bebe', value: 540000, meta: 540000, description: 'Passeios com conforto desde cedo.' },
  ],
  'cha-revelacao': [
    { id: 'g1', type: 'contribution', name: 'Enxoval surpresa', value: 420000, meta: 420000, description: 'Depois da revelacao, a gente completa as primeiras escolhas.', featured: true },
    { id: 'g2', type: 'fixed', name: 'Decoracao do cha', value: 52000, description: 'Mesa, arranjos e os detalhes do momento.' },
    { id: 'g3', type: 'fixed', name: 'Body neutro', value: 16000, description: 'Para guardar a primeira lembranca.' },
    { id: 'g4', type: 'contribution', name: 'Primeiros cuidados', value: 250000, meta: 250000, description: 'Farmacinha, bolsas, manta e banho.' },
  ],
  'cha-panela': [
    { id: 'g1', type: 'fixed', name: 'Jogo de panelas', value: 89000, description: 'O primeiro jantar da casa nova.', room: 'cozinha' },
    { id: 'g2', type: 'contribution', name: 'Moveis da cozinha', value: 650000, meta: 650000, description: 'Armarios, bancada e uma mesa cheia.', featured: true, room: 'cozinha' },
    { id: 'g3', type: 'fixed', name: 'Liquidificador premium', value: 32000, description: 'Para receitas de todo dia.', room: 'cozinha' },
    { id: 'g4', type: 'fixed', name: 'Jogo de cama', value: 54000, description: 'Aconchego para inaugurar a fase nova.', room: 'quarto' },
  ],
}

const contentByType: Record<EventTypeId, EventContent> = {
  casamento: {
    name: 'Ana & Lucas',
    subtitle: '12 de outubro de 2026',
    hosts: 'Ana e Lucas',
    eventDate: '2026-10-12',
    location: 'Trancoso, BA',
    message:
      'A nossa casa esta comecando junto com a nossa historia. Se quiser participar desse capitulo, escolhemos alguns presentes e cotas que vao virar memorias reais.',
    signature: 'Com carinho, Ana e Lucas',
    coverUrl: '',
    gifts: giftsByType.casamento,
  },
  'cha-bebe': {
    name: 'Olivia',
    subtitle: 'Chá de bebê',
    hosts: 'Ana e Lucas',
    eventDate: '2026-03-07',
    location: 'Vila Madalena, SP',
    message:
      'Estamos preparando cada canto para receber a Olivia. Essa pagina junta os presentes, as vaquinhas e os recados que queremos guardar para mostrar a ela um dia.',
    signature: 'Ana e Lucas',
    coverUrl: '',
    gifts: giftsByType['cha-bebe'],
  },
  'cha-revelacao': {
    name: 'A grande descoberta',
    subtitle: 'Cha revelacao',
    hosts: 'Marina e Pedro',
    eventDate: '2026-06-14',
    location: 'Jardim da familia',
    message:
      'Antes de sabermos a cor do laco ou do carrinho, ja sabemos o tamanho do amor. Venha participar desse dia e deixar uma lembranca para o nosso bebe.',
    signature: 'Marina e Pedro',
    coverUrl: '',
    gifts: giftsByType['cha-revelacao'],
  },
  'cha-panela': {
    name: 'Casa da Julia e do Rafa',
    subtitle: 'Chá de panela',
    hosts: 'Julia e Rafael',
    eventDate: '2026-08-22',
    location: 'Pinheiros, SP',
    message:
      'A casa ainda tem eco, cheiro de tinta e muitos planos. Se quiser ajudar a transformar o espaco em lar, deixamos uma lista simples e afetiva.',
    signature: 'Julia e Rafael',
    coverUrl: '',
    gifts: giftsByType['cha-panela'],
  },
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'casamento-editorial',
    eventType: 'casamento',
    name: 'Editorial',
    description: 'Hero cinematografico, lista elegante e cotas coletivas.',
    layout: 'wedding',
    previewGradient: 'linear-gradient(135deg, #2d2723, #c77b5a)',
    defaultContent: contentByType.casamento,
  },
  {
    id: 'bebe-soft-bloom',
    eventType: 'cha-bebe',
    name: 'Soft Bloom',
    description: 'Visual delicado com espacos para enxoval, quarto e recados.',
    layout: 'baby',
    previewGradient: 'linear-gradient(135deg, #fbf4f1, #bc7467)',
    defaultContent: contentByType['cha-bebe'],
  },
  {
    id: 'revelacao-modern',
    eventType: 'cha-revelacao',
    name: 'Reveal',
    description: 'Pagina clara, moderna e com destaque para o momento da revelacao.',
    layout: 'reveal',
    previewGradient: 'linear-gradient(135deg, #56758a, #e4a08f)',
    defaultContent: contentByType['cha-revelacao'],
  },
  {
    id: 'panela-home',
    eventType: 'cha-panela',
    name: 'Home',
    description: 'Estetica de casa nova com foco em presentes para o lar.',
    layout: 'home',
    previewGradient: 'linear-gradient(135deg, #6f7f62, #d39a71)',
    defaultContent: contentByType['cha-panela'],
  },
]

export function getTemplateById(id: string) {
  return TEMPLATES.find((t) => t.id === id)
}

export function getDefaultTemplateByEventType(eventType: EventTypeId) {
  return TEMPLATES.find((t) => t.eventType === eventType) ?? TEMPLATES[0]
}

export function createDefaultContent(eventType: EventTypeId): EventContent {
  const content = structuredClone(contentByType[eventType])
  content.sections = createDefaultSections(eventType, content)
  return applyGiftRooms(content)
}

export function resolveEventContent(
  eventType: EventTypeId,
  partial: Partial<EventContent>,
): EventContent {
  const base = createDefaultContent(eventType)
  const merged: EventContent = {
    ...base,
    ...partial,
    gifts: partial.gifts ?? base.gifts,
    sections: mergeSections(eventType, { ...base, ...partial }, partial.sections),
  }
  return applyGiftRooms(merged)
}

export function toDraftPayload(state: {
  eventType: EventTypeId
  templateId: string
  theme: EventTheme
  content: EventContent
}) {
  return {
    name: state.content.name,
    description: state.content.message,
    eventDate: state.content.eventDate || undefined,
    coverUrl: state.content.coverUrl || undefined,
    eventType: state.eventType,
    templateId: state.templateId,
    theme: state.theme,
    hosts: state.content.hosts,
    subtitle: state.content.subtitle,
    location: state.content.location,
    signature: state.content.signature,
    sections: state.content.sections,
    gifts: state.content.gifts.map((g) => ({
      type: g.type,
      name: g.name,
      value: g.value,
      meta: g.type === 'contribution' ? g.meta ?? g.value : undefined,
      description: g.description,
      imageUrl: g.imageUrl,
      room: g.room,
    })),
  }
}
