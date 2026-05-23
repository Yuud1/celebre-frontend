import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface BuilderPublishState {
  canPublish: boolean
  publish: (() => void) | null
}

interface BuilderPublishContextValue extends BuilderPublishState {
  setPublishState: (state: BuilderPublishState) => void
}

const defaultState: BuilderPublishState = {
  canPublish: false,
  publish: null,
}

const BuilderPublishContext = createContext<BuilderPublishContextValue | null>(null)

export function BuilderPublishProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BuilderPublishState>(defaultState)

  const value = useMemo(
    () => ({
      ...state,
      setPublishState: setState,
    }),
    [state],
  )

  return <BuilderPublishContext.Provider value={value}>{children}</BuilderPublishContext.Provider>
}

export function useBuilderPublishHeader() {
  const ctx = useContext(BuilderPublishContext)
  if (!ctx) {
    throw new Error('useBuilderPublishHeader must be used within BuilderPublishProvider')
  }
  return ctx
}

export function useOptionalBuilderPublishHeader() {
  return useContext(BuilderPublishContext)
}
