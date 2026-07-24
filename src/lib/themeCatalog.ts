import type { EventTheme, PaletteDefinition } from '../types/event'

export interface FontOption {
  id: string
  label: string
  sub: string
  family: string
  weight: number
}

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

/**
 * O catálogo de paletas (cores + tier) vem do backend via GET /theme/palettes
 * (ver `usePaletteCatalog()` em `contexts/PaletteCatalogContext.tsx`) — fonte
 * única de verdade. Estas funções são puras: sempre recebem a lista de
 * paletas já carregada, nunca mantêm cópia própria.
 */
export function getPaletteById(id: string, palettes: PaletteDefinition[]) {
  return palettes.find((p) => p.id === id)
}

export function getFontById(id: string) {
  return FONT_OPTIONS.find((f) => f.id === id)
}

export function resolveFontFamily(fontId: string) {
  return getFontById(fontId)?.family ?? ''
}

export function createThemeFromPalette(paletteId: string, palettes: PaletteDefinition[]): EventTheme {
  const palette = getPaletteById(paletteId, palettes) ?? palettes[0]
  return {
    paletteId: palette?.id ?? paletteId,
    primary: palette?.primary ?? '#6f675a',
    secondary: palette?.secondary ?? '#2f2a24',
    background: palette?.background ?? '#f7f4ee',
    accent: palette?.accent ?? '#b9a587',
    ink: palette?.ink ?? '#201c18',
    fontScale: 1,
  }
}
