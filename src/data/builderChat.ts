import type { EventTypeId } from '../types/event'
import { EVENT_TYPES } from '../templates/registry'

export interface BuilderTask {
  icon: 'image' | 'code' | 'palette'
  label: string
  tag: string
}

export interface BuilderQuestion {
  id: string
  prompt: string
  placeholder: string
  inputType?: 'text' | 'date' | 'textarea' | 'number'
}

export interface BuilderChatCopy {
  userPrompt: string
  intro: string
  tasksAfterType: BuilderTask[]
  tasksAfterPalette: BuilderTask[]
  palettePrompt: string
  readyLine: string
}

const copyByType: Record<EventTypeId, Omit<BuilderChatCopy, 'userPrompt'>> = {
  casamento: {
    intro:
      'Vou criar uma landing page elegante para o casamento, com contagem regressiva, detalhes do evento, lista de presentes e vaquinhas.',
    tasksAfterType: [
      { icon: 'image', label: 'Imagem gerada', tag: 'Hero' },
      { icon: 'image', label: 'Imagem gerada', tag: 'Capa' },
      { icon: 'code', label: 'Escrevendo', tag: 'Countdown' },
      { icon: 'code', label: 'Escrevendo', tag: 'Lista de presentes' },
      { icon: 'code', label: 'Editando', tag: 'layout' },
    ],
    tasksAfterPalette: [
      { icon: 'palette', label: 'Aplicando', tag: 'cores' },
      { icon: 'code', label: 'Editando', tag: 'styles' },
      { icon: 'code', label: 'Ajustando', tag: 'tipografia' },
    ],
    palettePrompt: 'Qual paleta combina com o clima do casamento? Toque em uma opção:',
    readyLine: 'Pronto. Toque nos textos da página para personalizar antes de publicar.',
  },
  'cha-bebe': {
    intro:
      'Vou criar uma landing page delicada para o chá de bebê, com contagem regressiva, detalhes do evento, lista de presentes e RSVP.',
    tasksAfterType: [
      { icon: 'image', label: 'Imagem gerada', tag: 'Hero Image' },
      { icon: 'image', label: 'Imagem gerada', tag: 'Floral Decoration' },
      { icon: 'code', label: 'Escrevendo', tag: 'Countdown' },
      { icon: 'code', label: 'Escrevendo', tag: 'Gift List' },
      { icon: 'code', label: 'Editando', tag: 'sections' },
    ],
    tasksAfterPalette: [
      { icon: 'palette', label: 'Aplicando', tag: 'paleta' },
      { icon: 'code', label: 'Editando', tag: 'styles' },
      { icon: 'code', label: 'Refinando', tag: 'espaçamentos' },
    ],
    palettePrompt: 'Escolha as cores que definem o clima da página:',
    readyLine: 'Sua página está pronta para revisar. Ajuste textos e fotos tocando na preview.',
  },
  'cha-revelacao': {
    intro:
      'Vou montar uma página leve para o chá revelação, com destaque para a data, mensagem e lista de presentes.',
    tasksAfterType: [
      { icon: 'image', label: 'Imagem gerada', tag: 'Reveal Hero' },
      { icon: 'code', label: 'Escrevendo', tag: 'Countdown' },
      { icon: 'code', label: 'Escrevendo', tag: 'Gift cards' },
      { icon: 'code', label: 'Editando', tag: 'layout' },
    ],
    tasksAfterPalette: [
      { icon: 'palette', label: 'Aplicando', tag: 'cores' },
      { icon: 'code', label: 'Editando', tag: 'theme' },
    ],
    palettePrompt: 'Qual tom visual você prefere para a revelação?',
    readyLine: 'Revise a página e publique quando estiver satisfeito.',
  },
  'cha-panela': {
    intro:
      'Vou criar uma página acolhedora para o chá de panela, com presentes fixos, vaquinhas e detalhes do evento.',
    tasksAfterType: [
      { icon: 'image', label: 'Imagem gerada', tag: 'Kitchen Hero' },
      { icon: 'code', label: 'Escrevendo', tag: 'Gift grid' },
      { icon: 'code', label: 'Escrevendo', tag: 'Contribution' },
      { icon: 'code', label: 'Editando', tag: 'layout' },
    ],
    tasksAfterPalette: [
      { icon: 'palette', label: 'Aplicando', tag: 'paleta' },
      { icon: 'code', label: 'Editando', tag: 'styles' },
    ],
    palettePrompt: 'Escolha a paleta que combina com a casa nova:',
    readyLine: 'Página montada. Personalize conteúdos e siga para publicação.',
  },
}

export function getBuilderChatCopy(eventType: EventTypeId | null): BuilderChatCopy {
  const et = eventType
    ? EVENT_TYPES.find((e) => e.id === eventType)
    : null

  const base = eventType ? copyByType[eventType] : copyByType['cha-bebe']

  return {
    userPrompt: et
      ? `Quero criar uma página para ${et.label.toLowerCase()}.`
      : 'Quero criar uma página para minha celebração.',
    ...base,
  }
}

export const WELCOME_ASSISTANT =
  'Oi! Sou a assistente do Celebre. Me conta qual celebração você está organizando. Cada tipo já vem com um layout pensado para o momento.'

export const questionsByType: Record<EventTypeId, BuilderQuestion[]> = {
  casamento: [
    {
      id: 'name',
      prompt: 'Qual é o nome do casal?',
      placeholder: 'Ex: Ana & Lucas',
    },
    {
      id: 'date',
      prompt: 'Qual é a data do casamento?',
      placeholder: 'Selecione a data',
      inputType: 'date',
    },
    {
      id: 'location',
      prompt: 'Onde será a celebração?',
      placeholder: 'Ex: Trancoso, BA',
    },
    {
      id: 'message',
      prompt: 'Que mensagem você quer deixar para os convidados?',
      placeholder: 'Escreva uma mensagem curta e carinhosa',
      inputType: 'textarea',
    },
  ],
  'cha-bebe': [
    {
      id: 'name',
      prompt: 'Qual é o nome do bebê ou da família?',
      placeholder: 'Ex: Olivia',
    },
    {
      id: 'date',
      prompt: 'Qual é a data do chá de bebê?',
      placeholder: 'Selecione a data',
      inputType: 'date',
    },
    {
      id: 'location',
      prompt: 'Onde será o chá?',
      placeholder: 'Ex: Casa da vovó, São Paulo',
    },
    {
      id: 'message',
      prompt: 'Qual mensagem combina com esse momento?',
      placeholder: 'Ex: Venha celebrar a chegada da Olivia com a gente',
      inputType: 'textarea',
    },
  ],
  'cha-revelacao': [
    {
      id: 'name',
      prompt: 'Como você quer chamar essa página?',
      placeholder: 'Ex: Bebê da Mari e do Leo',
    },
    {
      id: 'date',
      prompt: 'Qual é a data do chá revelação?',
      placeholder: 'Selecione a data',
      inputType: 'date',
    },
    {
      id: 'weeksToBirth',
      prompt: 'Quantas semanas faltam para nascer?',
      placeholder: 'Ex: 12',
      inputType: 'number',
    },
    {
      id: 'location',
      prompt: 'Onde será a revelação?',
      placeholder: 'Ex: Jardim da família',
    },
    {
      id: 'message',
      prompt: 'Que mensagem você quer mostrar antes da revelação?',
      placeholder: 'Ex: Menino ou menina, o amor já está completo',
      inputType: 'textarea',
    },
  ],
  'cha-panela': [
    {
      id: 'name',
      prompt: 'Qual nome deve aparecer na página?',
      placeholder: 'Ex: Ana & Lucas',
    },
    {
      id: 'date',
      prompt: 'Qual é a data do chá de panela?',
      placeholder: 'Selecione a data',
      inputType: 'date',
    },
    {
      id: 'location',
      prompt: 'Onde será o encontro?',
      placeholder: 'Ex: Apartamento novo, Curitiba',
    },
    {
      id: 'message',
      prompt: 'Qual mensagem representa essa casa nova?',
      placeholder: 'Ex: Ajude a gente a montar nosso primeiro lar',
      inputType: 'textarea',
    },
  ],
}

export function getBuilderQuestions(eventType: EventTypeId | null) {
  return eventType ? questionsByType[eventType] : []
}
