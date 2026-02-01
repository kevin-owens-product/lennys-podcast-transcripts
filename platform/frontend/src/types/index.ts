export interface Transcript {
  id: string;
  guest: string;
  guest_slug: string;
  title: string;
  youtube_url?: string;
  duration?: string;
  view_count?: number;
  description?: string;
  created_at: string;
}

export interface SearchResult {
  chunk_text: string;
  guest: string;
  title: string;
  guest_slug: string;
  timestamp?: string;
  speaker?: string;
  similarity: number;
  transcript_id: string;
}

export interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string;
  agent_type: string;
  tools: Record<string, boolean>;
  model: string;
  is_global: boolean;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  system_prompt: string;
  user_prompt_template: string;
  variables: Record<string, { type: string; required: boolean; label: string; options?: string[] }>;
  is_global: boolean;
}

export interface ChatSession {
  id: string;
  agent_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: Array<{ guest: string; title: string; similarity: number }>;
  created_at: string;
}

export interface DashboardStats {
  transcripts: number;
  chunks: number;
  embedded_chunks: number;
}

export interface AdminDashboard {
  users: number;
  tenants: number;
  transcripts: number;
  chunks: number;
  agents: number;
  chat_sessions: number;
  chat_messages: number;
  agent_runs: number;
}
