import { useEffect, useState, type DependencyList } from 'react'

interface UseAutoSaveOptions {
  /** Debounce em ms antes de disparar o save. */
  delay?: number
  /** Quando false, nao agenda nenhum save (guardas de carregamento/estado incompleto). */
  enabled?: boolean
}

/**
 * Dispara `save()` `delay`ms depois da ultima mudanca em `deps`, cancelando
 * o agendamento anterior a cada mudanca (debounce classico). Usado pelo
 * Builder (draft e evento publicado) e pelo Dashboard (Personalize) pra
 * compartilhar o mesmo mecanismo de auto-save.
 */
export function useAutoSave(save: () => void | Promise<unknown>, deps: DependencyList, options: UseAutoSaveOptions = {}) {
  const { delay = 1500, enabled = true } = options
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => {
      setSaving(true)
      Promise.resolve(save()).catch(() => {}).finally(() => setSaving(false))
    }, delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled])

  return { saving }
}
