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
  if (!res.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      (Array.isArray(data.errors)
        ? data.errors[0]?.description ?? data.errors[0]?.message
        : null) ||
      `Erro na requisição (${res.status})`;
    throw new Error(message);
  }
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
  forgotPassword(payload: { email: string }) {
    return request<{ ok: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  setupRecipient(data: {
    bankCode: string;
    branchNumber: string;
    accountNumber: string;
    accountCheckDigit: string;
    accountType: "checking" | "savings";
  }) {
    return request<{ kycStatus: string }>("/auth/recipient", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  setupBankAccount(data: {
    bankCode: string;
    branchNumber: string;
    accountNumber: string;
    accountCheckDigit: string;
    accountType: "checking" | "savings";
  }) {
    return request<{ kycStatus: string }>("/auth/bank-account", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  getRecipientStatus() {
    return request<{ kycStatus: string }>("/auth/recipient/status");
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
  publishDraft(id: string, planId?: string) {
    return request<{ chargeUrl: string }>(`/drafts/${id}/publish`, {
      method: "POST",
      ...(planId ? { body: JSON.stringify({ planId }) } : {}),
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
    }).catch((error) => {
      const message = error instanceof Error ? error.message : ''
      // Some environments proxy only /upload/events/* and can return 502 on /upload/draft-image.
      if (!message.includes('(502)')) throw error
      return request<{ url: string }>("/upload/events/draft-image", {
        method: "POST",
        body: form,
      })
    })
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
  
  // ─── Wallet ─────────────────────────────────────────────────
  getWalletSummary() {
    return request<{
      availableBalance: number
      pendingBalance: number
      pendingCount: number
      totalNetReceived: number
      confirmedCount: number
      bankConfigured: boolean
      lastConfirmedAt: string | null
    }>('/wallet/summary')
  },
  getWalletTransactions() {
    return request<Array<{
      id: string
      date: string
      desc: string
      method: string
      amount: number
      netAmount: number
      status: 'confirmed' | 'pending'
    }>>('/wallet/transactions')
  },
  requestWithdrawal(amount: number) {
    return request<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount })
    })
  },
  getWithdrawalHistory() {
    return request<any[]>('/wallet/withdrawals')
  },

  // ─── Admin Withdrawals ───────────────────────────────────
  adminListWithdrawals(params?: { status?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.status) qs.append('status', params.status)
    if (params?.page) qs.append('page', params.page.toString())
    if (params?.limit) qs.append('limit', params.limit.toString())
    return request<any>(`/admin/withdrawals?${qs.toString()}`)
  },
  adminApproveWithdrawal(id: string) {
    return request<any>(`/admin/withdrawals/${id}/approve`, { method: 'POST' })
  },
  adminRejectWithdrawal(id: string, reason: string) {
    return request<any>(`/admin/withdrawals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  },

  // ─── Public Event ───────────────────────────────────────────
  getPublicEvent(slug: string) {
    return request<any>(`/pub/${slug}`);
  },

  // ─── Plans ──────────────────────────────────────────────────
  listPlans() {
    return request<Array<{
      id: string
      name: string
      label: string
      publicationFee: number
      transactionFeePct: string
      maxPublishedEvents: number | null
      maxAdmins: number
      features: Record<string, boolean | number>
      displayPrice: number | null
      sortOrder: number
    }>>('/plans')
  },

  // ─── Contributions ──────────────────────────────────────────
  createContribution(payload: {
    giftId: string
    amount: number
    guestName: string
    guestEmail: string
    guestCpf: string
    guestPhone: string
    message?: string
    paymentMethod: 'PIX'
  }) {
    return request<{ chargeUrl: string; pixQrCodeUrl?: string }>('/contributions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
};
