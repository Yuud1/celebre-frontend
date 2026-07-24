import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api'
import type { PaletteDefinition } from '../types/event'

/**
 * Cor de bootstrap usada como valor inicial síncrono (useState) enquanto o
 * catálogo real ainda não chegou do backend. Não é uma paleta "de verdade"
 * do catálogo — só evita undefined/null no primeiro render dos editores.
 * O backend (GET /theme/palettes) é a fonte única de verdade das paletas.
 */
export const FALLBACK_PALETTE: PaletteDefinition = {
  id: 'linen',
  name: 'Linen',
  primary: '#6f675a',
  secondary: '#2f2a24',
  background: '#f7f4ee',
  accent: '#b9a587',
  ink: '#201c18',
}

interface PaletteCatalogContextValue {
  palettes: PaletteDefinition[]
  loading: boolean
}

const PaletteCatalogContext = createContext<PaletteCatalogContextValue | undefined>(undefined)

export function PaletteCatalogProvider({ children }: { children: ReactNode }) {
  const [palettes, setPalettes] = useState<PaletteDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPalettes()
      .then(setPalettes)
      .catch(() => setPalettes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PaletteCatalogContext.Provider value={{ palettes, loading }}>
      {children}
    </PaletteCatalogContext.Provider>
  )
}

export function usePaletteCatalog() {
  const context = useContext(PaletteCatalogContext)
  if (context === undefined) {
    throw new Error('usePaletteCatalog must be used within a PaletteCatalogProvider')
  }
  return context
}
