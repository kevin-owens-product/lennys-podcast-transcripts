const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;

  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (tenantId) headers["X-Tenant-Id"] = tenantId;
  return headers;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = { ...getAuthHeaders(), ...(options.headers as Record<string, string>) };
  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// Auth — login/register don't need stored token
export const auth = {
  register: (data: { email: string; password: string; full_name: string; locale?: string }) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: (token?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    else {
      const stored = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (stored) headers["Authorization"] = `Bearer ${stored}`;
    }
    return apiFetch("/auth/me", { headers });
  },
};

// Tenants
export const tenantsApi = {
  list: () => apiFetch<any[]>("/tenants/"),
  create: (data: { name: string; slug: string }) =>
    apiFetch("/tenants/", { method: "POST", body: JSON.stringify(data) }),
};

// Transcripts
export const transcriptsApi = {
  list: (search?: string) => apiFetch<any[]>(`/transcripts/?search=${search || ""}`),
  getStats: () => apiFetch("/transcripts/stats"),
  getGuests: () => apiFetch<string[]>("/transcripts/guests"),
  get: (id: string) => apiFetch(`/transcripts/${id}`),
};

// Search
export const searchApi = {
  semantic: (query: string, limit = 10, guest_filter?: string) =>
    apiFetch<any[]>("/search/semantic", {
      method: "POST",
      body: JSON.stringify({ query, limit, guest_filter }),
    }),
  keyword: (query: string, limit = 10, guest_filter?: string) =>
    apiFetch<any[]>("/search/keyword", {
      method: "POST",
      body: JSON.stringify({ query, limit, guest_filter }),
    }),
};

// Chat
export const chatApi = {
  listSessions: () => apiFetch<any[]>("/chat/sessions"),
  createSession: (title?: string, agent_id?: string) =>
    apiFetch<any>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ title, agent_id }),
    }),
  getMessages: (sessionId: string) =>
    apiFetch<any[]>(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string) =>
    apiFetch<any>(`/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};

// Agents
export const agentsApi = {
  list: () => apiFetch<any[]>("/agents/"),
  get: (id: string) => apiFetch(`/agents/${id}`),
  create: (data: any) =>
    apiFetch("/agents/", { method: "POST", body: JSON.stringify(data) }),
  run: (agentId: string, input: string) =>
    apiFetch(`/agents/${agentId}/run?input_text=${encodeURIComponent(input)}`, {
      method: "POST",
    }),
};

// Templates
export const templatesApi = {
  list: (category?: string) =>
    apiFetch<any[]>(`/templates/?${category ? `category=${category}` : ""}`),
  get: (id: string) => apiFetch(`/templates/${id}`),
  create: (data: any) =>
    apiFetch("/templates/", { method: "POST", body: JSON.stringify(data) }),
  execute: (templateId: string, variables: Record<string, string>) =>
    apiFetch(`/templates/${templateId}/execute`, {
      method: "POST",
      body: JSON.stringify({ variables }),
    }),
};

// Admin
export const adminApi = {
  dashboard: () => apiFetch("/admin/dashboard"),
  listUsers: () => apiFetch<any[]>("/admin/users"),
  listTenants: () => apiFetch<any[]>("/admin/tenants"),
  updateUser: (userId: string, data: { is_active?: boolean; is_superadmin?: boolean }) =>
    apiFetch(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  triggerIngestion: (withEmbeddings = true) =>
    apiFetch<any>(`/admin/ingest?with_embeddings=${withEmbeddings}`, {
      method: "POST",
    }),
};
