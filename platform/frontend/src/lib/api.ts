const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
  tenantId?: string;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, tenantId, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (tenantId) headers["X-Tenant-Id"] = tenantId;

  const res = await fetch(`${API_URL}/api${path}`, { ...rest, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// Auth
export const auth = {
  register: (data: { email: string; password: string; full_name: string; locale?: string }) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: (token: string) => apiFetch("/auth/me", { token }),
};

// Tenants
export const tenants = {
  list: (token: string) => apiFetch("/tenants/", { token }),
  create: (token: string, data: { name: string; slug: string }) =>
    apiFetch("/tenants/", { method: "POST", token, body: JSON.stringify(data) }),
};

// Transcripts
export const transcripts = {
  list: (token: string, tenantId: string, search?: string) =>
    apiFetch(`/transcripts/?search=${search || ""}`, { token, tenantId }),
  stats: (token: string, tenantId: string) =>
    apiFetch("/transcripts/stats", { token, tenantId }),
  guests: (token: string, tenantId: string) =>
    apiFetch("/transcripts/guests", { token, tenantId }),
  get: (token: string, tenantId: string, id: string) =>
    apiFetch(`/transcripts/${id}`, { token, tenantId }),
};

// Search
export const search = {
  semantic: (token: string, tenantId: string, data: { query: string; limit?: number; guest_filter?: string }) =>
    apiFetch("/search/semantic", { method: "POST", token, tenantId, body: JSON.stringify(data) }),
  keyword: (token: string, tenantId: string, data: { query: string; limit?: number; guest_filter?: string }) =>
    apiFetch("/search/keyword", { method: "POST", token, tenantId, body: JSON.stringify(data) }),
};

// Chat
export const chat = {
  sessions: (token: string, tenantId: string) =>
    apiFetch("/chat/sessions", { token, tenantId }),
  createSession: (token: string, tenantId: string, data: { agent_id?: string; title?: string }) =>
    apiFetch("/chat/sessions", { method: "POST", token, tenantId, body: JSON.stringify(data) }),
  messages: (token: string, sessionId: string) =>
    apiFetch(`/chat/sessions/${sessionId}/messages`, { token }),
  sendMessage: (token: string, tenantId: string, sessionId: string, content: string) =>
    apiFetch(`/chat/sessions/${sessionId}/messages`, {
      method: "POST", token, tenantId, body: JSON.stringify({ content }),
    }),
};

// Agents
export const agents = {
  list: (token: string, tenantId: string) => apiFetch("/agents/", { token, tenantId }),
  run: (token: string, tenantId: string, agentId: string, input: string) =>
    apiFetch(`/agents/${agentId}/run?input_text=${encodeURIComponent(input)}`, {
      method: "POST", token, tenantId,
    }),
};

// Templates
export const templates = {
  list: (token: string, tenantId: string, category?: string) =>
    apiFetch(`/templates/?${category ? `category=${category}` : ""}`, { token, tenantId }),
  execute: (token: string, tenantId: string, templateId: string, data: { variables: Record<string, string>; query?: string }) =>
    apiFetch(`/templates/${templateId}/execute`, {
      method: "POST", token, tenantId, body: JSON.stringify(data),
    }),
};

// Admin
export const admin = {
  dashboard: (token: string) => apiFetch("/admin/dashboard", { token }),
  users: (token: string) => apiFetch("/admin/users", { token }),
  tenants: (token: string) => apiFetch("/admin/tenants", { token }),
  ingest: (token: string, tenantId: string, withEmbeddings = true) =>
    apiFetch(`/admin/ingest?with_embeddings=${withEmbeddings}`, {
      method: "POST", token, tenantId,
    }),
};
