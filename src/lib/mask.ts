export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.replace(/(\d{5})(\d)/, '$1-$2')
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+/, '$1')
}

export function unmask(value: string): string {
  return value.replace(/\D/g, '')
}

export function maskCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const cents = parseInt(digits || '0', 10)
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function parseCurrencyToCents(masked: string): number {
  return parseInt(masked.replace(/\D/g, '') || '0', 10)
}

export function maskPIXKey(value: string): string {
  const type = recognizePixKey(value)
  if (type === 'CPF') return maskCPF(value)
  if (type === 'Telefone') return maskPhone(value)
  return value
}

export function recognizePixKey(value: string): 'CPF' | 'E-mail' | 'Telefone' | 'Aleatória' | 'Inválido' {
  if (!value) return 'Inválido'
  if (/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(value)) return 'CPF'
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'E-mail'
  if (/^\(\d{2}\) \d{4,5}\-\d{4}$/.test(value)) return 'Telefone'
  return 'Aleatória'
}