const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Erro na requisição')
  return data as T
}

export const api = {
  // ─── Auth ───────────────────────────────────────────────────
  register(payload: unknown) {
    return request<{ user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
  },
  login(payload: unknown) {
    return request<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
  },
  me() {
    return request<any>('/auth/me')
  },
  logout() {
    return request<{ ok: boolean }>('/auth/logout', { method: 'POST' })
  },
  updatePixKey(pixKey: string) {
    return request<any>('/auth/pix-key', { method: 'PATCH', body: JSON.stringify({ pixKey }) })
  },

  // ─── Drafts ─────────────────────────────────────────────────
  createDraft(payload: unknown) {
    return request<{ id: string }>('/drafts', { method: 'POST', body: JSON.stringify(payload) })
  },
  updateDraft(id: string, payload: unknown) {
    return request(`/drafts/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  },
  publishDraft(id: string) {
    return request<{ chargeUrl: string }>(`/drafts/${id}/publish`, { method: 'POST' })
  },
  getDraftStatus(id: string) {
    return request<{ status: string; eventSlug?: string }>(`/drafts/${id}/status`)
  },
}
