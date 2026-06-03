import type { EventContent, EventSections, EventTypeId } from '../types/event'

export const DEFAULT_HOME_ROOMS: EventSections['homeRooms'] = [
  { id: 'cozinha', name: 'Cozinha', icon: '🍳' },
  { id: 'sala', name: 'Sala', icon: '🛋️' },
  { id: 'quarto', name: 'Quarto', icon: '🛏️' },
  { id: 'banheiro', name: 'Banheiro', icon: '🚿' },
]

export function createDefaultSections(eventType: EventTypeId, content: Partial<EventContent>): EventSections {
  const location = content.location ?? ''
  const name = content.name ?? ''
  const city = location.split(',').pop()?.trim() ?? location

  switch (eventType) {
    case 'casamento':
      return {
        coupleStory: {
          intro: 'Alguns capítulos que nos trouxeram até aqui.',
          timeline: [
            { year: '2019', title: 'Primeiro encontro', text: 'Um café que virou jantar e depois virou plano.' },
            { year: '2022', title: 'Mudança juntos', text: 'Aprendemos a dividir rotina, sonhos e a última fatia de pizza.' },
            { year: '2025', title: 'O pedido', text: 'Entre risadas e lágrimas, dissemos sim para o próximo capítulo.' },
          ],
        },
        ceremony: {
          ceremonyTime: '16h',
          ceremonyPlace: location || 'Cerimônia',
          ceremonyAddress: location,
          receptionTime: '18h',
          receptionPlace: 'Recepção',
          receptionAddress: location,
          dressCode: 'Traje social',
        },
      }

    case 'cha-bebe':
      return {
        coupleStory: {
          intro: 'Alguns capítulos de amor até a chegada desse bebê.',
          timeline: [
            { year: '2021', title: 'Sonho em família', text: 'Começamos a imaginar como seria esse novo capítulo.' },
            { year: '2025', title: 'Notícia especial', text: 'Descobrimos a gravidez e a casa inteira mudou de ritmo.' },
            { year: '2026', title: 'Contagem regressiva', text: 'Cada semana traz mais expectativa e carinho.' },
          ],
        },
        ceremony: {
          ceremonyTime: '15h',
          ceremonyPlace: location || 'Chá de bebê',
          ceremonyAddress: location,
          receptionTime: '16h',
          receptionPlace: 'Confraternização',
          receptionAddress: location,
          dressCode: 'Traje leve',
        },
        pregnancy: {
          dueDate: content.eventDate ? offsetDate(content.eventDate, 56) : undefined,
          currentWeek: 32,
        },
      }

    case 'cha-revelacao':
      return {
        coupleStory: {
          intro: 'Pequenos marcos até o momento da grande surpresa.',
          timeline: [
            { year: '2024', title: 'Primeiros planos', text: 'A ideia de aumentar a família começou a tomar forma.' },
            { year: '2025', title: 'Coração acelerado', text: 'O positivo chegou e o amor ganhou um novo tamanho.' },
            { year: '2026', title: 'Dia da revelação', text: 'Agora todo mundo conta os dias para descobrir juntos.' },
          ],
        },
        ceremony: {
          ceremonyTime: '14h',
          ceremonyPlace: location || 'Chá revelação',
          ceremonyAddress: location,
          receptionTime: '16h',
          receptionPlace: 'Momento da revelação',
          receptionAddress: location,
          dressCode: 'Traje casual',
        },
        pregnancy: {
          dueDate: content.eventDate ? offsetDate(content.eventDate, 84) : undefined,
          currentWeek: 24,
        },
      }

    case 'cha-panela':
      return {
        coupleStory: {
          intro: 'Capítulos que estão construindo nosso primeiro lar.',
          timeline: [
            { year: '2022', title: 'Primeiro endereço juntos', text: 'Começamos a sonhar com um espaço que tivesse a nossa cara.' },
            { year: '2025', title: 'Chaves na mão', text: 'A casa chegou e com ela uma lista enorme de planos.' },
            { year: '2026', title: 'Casa nova, fase nova', text: 'Agora estamos montando cada canto com muito carinho.' },
          ],
        },
        ceremony: {
          ceremonyTime: '17h',
          ceremonyPlace: location || 'Chá de panela',
          ceremonyAddress: location,
          receptionTime: '18h',
          receptionPlace: 'Brinde da casa nova',
          receptionAddress: location,
          dressCode: 'Traje confortável',
        },
        homeStats: {
          rooms: 3,
          city: city || 'São Paulo',
          moveInDate: content.eventDate,
          tagline: `${name} está ganhando forma, cômodo por cômodo.`,
        },
        homeRooms: DEFAULT_HOME_ROOMS,
        checklist: [
          { id: 'c1', label: 'Jogo de panelas', giftId: 'g1' },
          { id: 'c2', label: 'Móveis da cozinha', giftId: 'g2' },
          { id: 'c3', label: 'Liquidificador', giftId: 'g3' },
          { id: 'c4', label: 'Jogo de cama', giftId: 'g4' },
          { id: 'c5', label: 'Utensílios básicos' },
          { id: 'c6', label: 'Organização da lavanderia' },
        ],
        giftRoomByName: {
          'Jogo de panelas': 'cozinha',
          'Moveis da cozinha': 'cozinha',
          'Liquidificador premium': 'cozinha',
          'Jogo de cama': 'quarto',
        },
      }

    default:
      return {}
  }
}

export function mergeSections(
  eventType: EventTypeId,
  content: EventContent,
  stored?: EventSections,
): EventSections {
  const defaults = createDefaultSections(eventType, content)
  if (!stored) return defaults

  return {
    ...defaults,
    ...stored,
    coupleStory: stored.coupleStory ?? defaults.coupleStory,
    ceremony: stored.ceremony && defaults.ceremony
      ? { ...defaults.ceremony, ...stored.ceremony }
      : stored.ceremony ?? defaults.ceremony,
    pregnancy: stored.pregnancy && defaults.pregnancy
      ? { ...defaults.pregnancy, ...stored.pregnancy }
      : stored.pregnancy ?? defaults.pregnancy,
    homeStats: stored.homeStats && defaults.homeStats
      ? { ...defaults.homeStats, ...stored.homeStats }
      : stored.homeStats ?? defaults.homeStats,
    homeRooms: stored.homeRooms ?? defaults.homeRooms,
    checklist: stored.checklist ?? defaults.checklist,
    giftRoomByName: { ...defaults.giftRoomByName, ...stored.giftRoomByName },
  }
}

export function applyGiftRooms(content: EventContent): EventContent {
  const map = content.sections?.giftRoomByName
  if (!map) return content

  return {
    ...content,
    gifts: content.gifts.map((gift) => ({
      ...gift,
      room: gift.room ?? map[gift.name],
    })),
  }
}

function offsetDate(iso: string, days: number): string {
  const date = new Date(iso + 'T12:00:00')
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Recados de exemplo no preview do builder */
export const PREVIEW_BABY_MESSAGES = [
  { guestName: 'Vovó Helena', message: 'Querida Olivia, a vovó já te espera com colo e histórias.' },
  { guestName: 'Tia Camila', message: 'Seja bem-vinda, pequena. O mundo fica mais bonito com você.' },
]

export const PREVIEW_GUESS_MESSAGES = [
  { guestName: 'Marina', message: 'Tenho certeza que é menina — o coração da mamãe já sabe!', guess: 'girl' as const },
  { guestName: 'Pedro', message: 'Team menino! Vai ser o xodó do titio.', guess: 'boy' as const },
  { guestName: 'Ana', message: 'Surpresa é surpresa, mas meu palpite é menina.', guess: 'girl' as const },
]
