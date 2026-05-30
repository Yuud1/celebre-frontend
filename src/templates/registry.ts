import type {
  EventContent,
  EventTheme,
  EventTypeDefinition,
  EventTypeId,
  PaletteDefinition,
  TemplateDefinition,
} from '../types/event'

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

export const PALETTES: PaletteDefinition[] = [
  {
    id: 'linen',
    name: 'Linen',
    primary: '#7c4f3f',
    secondary: '#2d2723',
    background: '#f7f2ea',
    accent: '#c77b5a',
    ink: '#211b17',
  },
  {
    id: 'sage',
    name: 'Sage',
    primary: '#6f7f62',
    secondary: '#2d3728',
    background: '#f5f3ec',
    accent: '#d8a35d',
    ink: '#20231c',
  },
  {
    id: 'blush',
    name: 'Blush',
    primary: '#bc7467',
    secondary: '#4a3735',
    background: '#fbf4f1',
    accent: '#e4a08f',
    ink: '#2a2020',
  },
  {
    id: 'mist',
    name: 'Mist',
    primary: '#56758a',
    secondary: '#20313d',
    background: '#f4f7f7',
    accent: '#9eb8c4',
    ink: '#18242b',
  },
  {
    id: 'clay',
    name: 'Clay',
    primary: '#9a5f43',
    secondary: '#3a2a22',
    background: '#f8f1ea',
    accent: '#d39a71',
    ink: '#241a15',
  },
]

const giftsByType: Record<EventTypeId, EventContent['gifts']> = {
  casamento: [
    { id: 'g1', type: 'contribution', name: 'Lua de mel no Chile', value: 12000, meta: 12000, description: 'Atacama, Valparaiso e alguns jantares sem pressa.', featured: true },
    { id: 'g2', type: 'fixed', name: 'Aparelho de jantar', value: 1280, description: 'Servico para receber a familia nos domingos.' },
    { id: 'g3', type: 'fixed', name: 'Maquina de espresso', value: 2890, description: 'Cafe bom para a casa nova.' },
    { id: 'g4', type: 'contribution', name: 'Moveis da sala', value: 8000, meta: 8000, description: 'Uma casa com cara de comeco.' },
  ],
  'cha-bebe': [
    { id: 'g1', type: 'contribution', name: 'Quarto da Olivia', value: 8000, meta: 8000, description: 'Berco, comoda, poltrona e enxoval.', featured: true },
    { id: 'g2', type: 'fixed', name: 'Kit higiene', value: 380, description: 'Porcelana, bandeja e potinhos.' },
    { id: 'g3', type: 'fixed', name: 'Fraldas do primeiro mes', value: 290, description: 'O basico que salva os primeiros dias.' },
    { id: 'g4', type: 'contribution', name: 'Carrinho de bebe', value: 5400, meta: 5400, description: 'Passeios com conforto desde cedo.' },
  ],
  'cha-revelacao': [
    { id: 'g1', type: 'contribution', name: 'Enxoval surpresa', value: 4200, meta: 4200, description: 'Depois da revelacao, a gente completa as primeiras escolhas.', featured: true },
    { id: 'g2', type: 'fixed', name: 'Decoracao do cha', value: 520, description: 'Mesa, arranjos e os detalhes do momento.' },
    { id: 'g3', type: 'fixed', name: 'Body neutro', value: 160, description: 'Para guardar a primeira lembranca.' },
    { id: 'g4', type: 'contribution', name: 'Primeiros cuidados', value: 2500, meta: 2500, description: 'Farmacinha, bolsas, manta e banho.' },
  ],
  'cha-panela': [
    { id: 'g1', type: 'fixed', name: 'Jogo de panelas', value: 890, description: 'O primeiro jantar da casa nova.' },
    { id: 'g2', type: 'contribution', name: 'Moveis da cozinha', value: 6500, meta: 6500, description: 'Armarios, bancada e uma mesa cheia.', featured: true },
    { id: 'g3', type: 'fixed', name: 'Liquidificador premium', value: 320, description: 'Para receitas de todo dia.' },
    { id: 'g4', type: 'fixed', name: 'Jogo de cama', value: 540, description: 'Aconchego para inaugurar a fase nova.' },
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

export function getPaletteById(id: string) {
  return PALETTES.find((p) => p.id === id)
}

export function createDefaultContent(eventType: EventTypeId): EventContent {
  return structuredClone(contentByType[eventType])
}

export function createThemeFromPalette(paletteId: string): EventTheme {
  const palette = getPaletteById(paletteId) ?? PALETTES[0]
  return {
    paletteId: palette.id,
    primary: palette.primary,
    secondary: palette.secondary,
    background: palette.background,
    accent: palette.accent,
    ink: palette.ink,
    fontScale: 1,
  }
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
    gifts: state.content.gifts.map((g) => ({
      type: g.type,
      name: g.name,
      value: g.value,
      meta: g.type === 'contribution' ? g.meta ?? g.value : undefined,
      description: g.description,
      imageUrl: g.imageUrl,
    })),
  }
}
