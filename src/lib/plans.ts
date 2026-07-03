export type ApiPlan = {
  id: string
  name: string
  label: string
  publicationFee: number
  transactionFeePct: string
  maxPublishedEvents: number | null
  maxAdmins: number
  features: Record<string, boolean | number>
  displayPrice: number | null
  sortOrder: number
}

export function derivePlanFeatures(p: ApiPlan): string[] {
  const f = p.features
  const list: string[] = []

  list.push('Página personalizada')
  list.push('Lista de presentes (fixos + vaquinhas)')
  list.push('Recebimento via PIX')

  if (p.maxPublishedEvents == null) {
    list.push('Eventos ilimitados')
  } else {
    list.push(`${p.maxPublishedEvents} evento${p.maxPublishedEvents > 1 ? 's' : ''} ativo${p.maxPublishedEvents > 1 ? 's' : ''}`)
  }

  if (f.inviteWithPhoto) list.push('Convite com foto do casal')
  else list.push('Convite digital para WhatsApp')

  if (f.gallery && Number(f.maxGalleryPhotos) > 0) {
    list.push(`Galeria de ${f.maxGalleryPhotos} fotos`)
  }

  if (f.rsvp) list.push('RSVP — confirmação de presença')

  if (f.reports && f.csvExport) list.push('Relatórios (PDF + CSV exportável)')
  else if (f.reports) list.push('Relatório de arrecadação em PDF')

  if (Number(p.maxAdmins) > 1) list.push(`Até ${p.maxAdmins} co-anfitriões`)

  if (f.individualInvites) list.push('Convites individuais por convidado')
  if (f.eventPassword) list.push('Página com senha para convidados')
  if (f.customCss) list.push('CSS e background personalizados')
  if (f.whiteLabel) list.push('Remover marca Celebre')

  if (f.dedicatedSupport) list.push('Suporte dedicado via WhatsApp')
  else if (f.prioritySupport) list.push('Suporte prioritário (resposta em 4h)')
  else list.push('Suporte por e-mail (48h)')

  list.push(`Taxa de ${p.transactionFeePct}% sobre presentes`)

  return list
}
