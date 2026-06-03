export interface FontOption {
  label: string
  value: string
}

export const FONT_OPTIONS: FontOption[] = [
  { label: 'Padrão do tema', value: '' },
  { label: 'Instrument Serif', value: "'Instrument Serif', Georgia, serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', Inter, system-ui, sans-serif" },
  { label: 'Inter / Sans', value: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace" },
]

