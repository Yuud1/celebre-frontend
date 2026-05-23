const API_BASE = import.meta.env.VITE_API_URL ?? ''

function headers(token?: string): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers(token), ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Erro na requisição')
  return data as T
}

export function getToken() {
  return localStorage.getItem('celebre-token') ?? undefined
}

export const api = {
  // ─── Auth ───────────────────────────────────────────────────
  register(payload: unknown) {
    return request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
  },
  login(payload: unknown) {
    return request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
  },
  me(token?: string) {
    return request<any>('/auth/me', {}, token ?? getToken())
  },
  updatePixKey(pixKey: string, token?: string) {
    return request<any>('/auth/pix-key', { method: 'PATCH', body: JSON.stringify({ pixKey }) }, token ?? getToken())
  },

  // ─── Drafts ─────────────────────────────────────────────────
  createDraft(payload: unknown, token?: string) {
    return request<{ id: string }>('/drafts', { method: 'POST', body: JSON.stringify(payload) }, token ?? getToken())
  },
  updateDraft(id: string, payload: unknown, token?: string) {
    return request(`/drafts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token ?? getToken())
  },
  publishDraft(id: string, token?: string) {
    return request<{ chargeUrl: string }>(`/drafts/${id}/publish`, { method: 'POST' }, token ?? getToken())
  },
  getDraftStatus(id: string, token?: string) {
    return request<{ status: string; eventSlug?: string }>(`/drafts/${id}/status`, {}, token ?? getToken())
  },
}
