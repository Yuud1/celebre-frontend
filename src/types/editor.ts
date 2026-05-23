export type EditableField =
  | 'name'
  | 'subtitle'
  | 'hosts'
  | 'eventDate'
  | 'location'
  | 'message'
  | 'signature'
  | 'coverUrl'
  | 'appearance'
  | `gift:${string}`

export const EDIT_FIELD_LABELS: Record<string, string> = {
  name: 'Nome do evento',
  subtitle: 'Subtitulo',
  hosts: 'Anfitrioes',
  eventDate: 'Data',
  location: 'Local',
  message: 'Mensagem',
  signature: 'Assinatura',
  coverUrl: 'Foto de capa',
  appearance: 'Cores e tipografia',
}

export function giftFieldId(id: string): EditableField {
  return `gift:${id}`
}

export function fieldLabel(field: EditableField): string {
  if (field.startsWith('gift:')) return 'Presente'
  return EDIT_FIELD_LABELS[field] ?? 'Editar'
}
