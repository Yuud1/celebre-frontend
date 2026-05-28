const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: isFormData
      ? {}
      : { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição");
  return data as T;
}

export const api = {
  // ─── Auth ───────────────────────────────────────────────────
  register(payload: unknown) {
    return request<{ user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: unknown) {
    return request<{ user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request<any>("/auth/me");
  },
  logout() {
    return request<{ ok: boolean }>("/auth/logout", { method: "POST" });
  },
  updatePixKey(pixKey: string) {
    return request<any>("/auth/pix-key", {
      method: "PATCH",
      body: JSON.stringify({ pixKey }),
    });
  },
  setupSubconta(payload: {
    birthDate: string;
    mobilePhone: string;
    postalCode: string;
    address: string;
    addressNumber: string;
    province: string;
    incomeValue: number;
  }) {
    return request<any>("/auth/subconta", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // ─── Drafts ─────────────────────────────────────────────────
  createDraft(payload: unknown) {
    return request<{ id: string }>("/drafts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateDraft(id: string, payload: unknown) {
    return request(`/drafts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  publishDraft(id: string) {
    return request<{ chargeUrl: string }>(`/drafts/${id}/publish`, {
      method: "POST",
    });
  },
  getDraftStatus(id: string) {
    return request<{ status: string; eventSlug?: string }>(
      `/drafts/${id}/status`,
    );
  },

  // ─── Upload ─────────────────────────────────────────────────
  uploadEventCover(eventId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>(`/upload/events/${eventId}/cover`, {
      method: "POST",
      body: form,
    });
  },
  uploadGiftImage(eventId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>(`/upload/events/${eventId}/gift-image`, {
      method: "POST",
      body: form,
    });
  },
  uploadDraftImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>("/upload/draft-image", {
      method: "POST",
      body: form,
    });
  },
  
  // ─── Events ─────────────────────────────────────────────────
  listEvents() {
    return request<any[]>("/events");
  },
  getEvent(id: string) {
    return request<any>(`/events/${id}`);
  },
  getEventContributions(id: string) {
    return request<any[]>(`/events/${id}/contributions`);
  },
  createGift(eventId: string, payload: unknown) {
    return request<any>(`/events/${eventId}/gifts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateEvent(
    id: string,
    payload: {
      data?: Record<string, unknown>;
      coverUrl?: string;
      eventDate?: string | null;
    },
  ) {
    return request(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  updateGift(eventId: string, giftId: string, payload: unknown) {
    return request<any>(`/events/${eventId}/gifts/${giftId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteGift(eventId: string, giftId: string) {
    return request<any>(`/events/${eventId}/gifts/${giftId}`, {
      method: "DELETE",
    });
  },
  
  // ─── Public Event ───────────────────────────────────────────
  getPublicEvent(slug: string) {
    return request<any>(`/p/${slug}`);
  },
};
