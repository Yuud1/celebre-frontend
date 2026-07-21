import type { EventTheme, PaletteDefinition } from '../types/event'

export interface FontOption {
  id: string
  label: string
  sub: string
  family: string
  weight: number
}

export const PALETTES: PaletteDefinition[] = [
  {
    id: 'linen',
    name: 'Linen',
    primary: '#6f675a',
    secondary: '#2f2a24',
    background: '#f7f4ee',
    accent: '#b9a587',
    ink: '#201c18',
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
    primary: '#b66f8f',
    secondary: '#4a3240',
    background: '#fcf2f7',
    accent: '#e2a9c1',
    ink: '#2b1f28',
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
    primary: '#a05f3d',
    secondary: '#3b271c',
    background: '#f9efe5',
    accent: '#dda176',
    ink: '#24170f',
  },
]

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'default',
    label: 'Padrão do tema',
    sub: 'Usa a fonte do template',
    family: '',
    weight: 400,
  },
  {
    id: 'instrument-serif',
    label: 'Instrument Serif',
    sub: 'Serifa editorial',
    family: "'Instrument Serif', Georgia, serif",
    weight: 400,
  },
  {
    id: 'space-grotesk',
    label: 'Space Grotesk',
    sub: 'Sans geométrica',
    family: "'Space Grotesk', Inter, system-ui, sans-serif",
    weight: 500,
  },
  {
    id: 'inter',
    label: 'Inter / Sans',
    sub: 'Sans neutra',
    family: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
    weight: 400,
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    sub: 'Monoespaçada',
    family: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    weight: 500,
  },
]

export function getPaletteById(id: string) {
  return PALETTES.find((p) => p.id === id)
}

export function getFontById(id: string) {
  return FONT_OPTIONS.find((f) => f.id === id)
}

export function resolveFontFamily(fontId: string) {
  return getFontById(fontId)?.family ?? ''
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
