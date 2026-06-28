export type EventTypeId = 'casamento' | 'cha-bebe' | 'cha-revelacao' | 'cha-panela'
export type IconName = 'rings' | 'house' | 'spark' | 'balloon' | 'cal' | 'clock' | 'pin' | 'gift' | 'heart' | 'link'
export type MarkName = 'rings' | 'house' | 'spark' | 'heart' | 'dot'

export interface TemplateConfig {
  label: string
  icon: IconName
  headCls: string
  nameCls: string
  headSize: number
  nameSize: number
  headline: string
  defaultAccent: string
  defaultMessage: string
  defaultMessage2: string
  defaultThanks: string
  defaultThanksSub: string
  mark: MarkName
}

export const TEMPLATES: Record<EventTypeId, TemplateConfig> = {
  casamento: {
    label: 'Casamento', icon: 'rings',
    headCls: 'cv-serif', nameCls: 'cv-serif',
    headSize: 108, nameSize: 92,
    headline: 'Vai ser\npara sempre',
    defaultAccent: '#74865f',
    defaultMessage: 'Depois de tantas histórias juntos, escolhemos transformar o nosso amor em um para sempre.',
    defaultMessage2: 'E não há ninguém com quem a gente queira dividir esse dia além de você.',
    defaultThanks: 'Sua presença transforma.',
    defaultThanksSub: 'Obrigado por caminhar com a gente.',
    mark: 'rings',
  },
  'cha-panela': {
    label: 'Chá de Casa Nova', icon: 'house',
    headCls: 'cv-script', nameCls: 'cv-script',
    headSize: 124, nameSize: 116,
    headline: 'Estamos realizando\num sonho!',
    defaultAccent: '#8b79c2',
    defaultMessage: 'Cada detalhe da nossa nova casa está sendo feito com muito amor e carinho.',
    defaultMessage2: 'Se quiser fazer parte desse momento, ficaremos imensamente felizes com a sua contribuição.',
    defaultThanks: 'Sua presença transforma.',
    defaultThanksSub: 'Obrigado por fazer parte dessa história!',
    mark: 'heart',
  },
  'cha-bebe': {
    label: 'Chá de Bebê', icon: 'spark',
    headCls: 'cv-script-a', nameCls: 'cv-script-a',
    headSize: 124, nameSize: 138,
    headline: 'A espera\nmais doce',
    defaultAccent: '#d18a86',
    defaultMessage: 'Um coração pequenininho já enche a nossa casa de planos e o nosso peito de amor.',
    defaultMessage2: 'Venha celebrar a chegada que vai mudar tudo — e encher de carinho desde o primeiro dia.',
    defaultThanks: 'Sua presença é o presente.',
    defaultThanksSub: 'Obrigado por fazer parte dessa história.',
    mark: 'dot',
  },
  'cha-revelacao': {
    label: 'Chá de Revelação', icon: 'spark',
    headCls: 'cv-script-a', nameCls: 'cv-script-a',
    headSize: 124, nameSize: 138,
    headline: 'O segredo\nestá quase\nchegando!',
    defaultAccent: '#c98a3f',
    defaultMessage: 'Vamos revelar juntos o grande mistério que está enchendo nossos corações de alegria.',
    defaultMessage2: 'Você é especial demais para ficar de fora desse momento mágico.',
    defaultThanks: 'Sua presença é o presente.',
    defaultThanksSub: 'Obrigado por celebrar com a gente!',
    mark: 'dot',
  },
}
