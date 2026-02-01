"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { transcriptsApi, agentsApi, templatesApi, chatApi } from "@/lib/api";
import type { Agent, Template, ChatSession } from "@/types";

interface TranscriptStats {
  total_transcripts: number;
  total_chunks: number;
  embedded_chunks: number;
  guests: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<TranscriptStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadDashboard() {
      try {
        const [statsData, agentsData, templatesData, chatsData] =
          await Promise.all([
            transcriptsApi.getStats() as Promise<TranscriptStats>,
            agentsApi.list() as Promise<Agent[]>,
            templatesApi.list() as Promise<Template[]>,
            chatApi.listSessions() as Promise<ChatSession[]>,
          ]);
        setStats(statsData);
        setAgents(agentsData);
        setTemplates(templatesData);
        setRecentChats(chatsData.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 mb-8">
            Welcome back, {user?.full_name || "there"}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Transcripts</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.total_transcripts || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.total_chunks || 0} chunks indexed
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Embeddings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.embedded_chunks || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    vector embeddings
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Agents</p>
                  <p className="text-3xl font-bold text-brand-700">
                    {agents.length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    AI-powered assistants
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <p className="text-sm text-gray-500 mb-1">Templates</p>
                  <p className="text-3xl font-bold text-brand-700">
                    {templates.length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    framework templates
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link
                  href="/search"
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-md transition group"
                >
                  <div className="text-2xl mb-3">&#x2315;</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition">
                    Search Transcripts
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Semantic and keyword search across all episodes
                  </p>
                </Link>
                <Link
                  href="/chat"
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-md transition group"
                >
                  <div className="text-2xl mb-3">&#x1F4AC;</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition">
                    Start a Chat
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Chat with AI agents powered by podcast wisdom
                  </p>
                </Link>
                <Link
                  href="/templates"
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-md transition group"
                >
                  <div className="text-2xl mb-3">&#x1F4CB;</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition">
                    Use a Template
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Apply proven frameworks to your product challenges
                  </p>
                </Link>
              </div>

              {/* Two Column: Agents + Recent Chats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Agents */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">
                      Available Agents
                    </h2>
                    <Link
                      href="/agents"
                      className="text-sm text-brand-600 hover:text-brand-700"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {agents.slice(0, 4).map((agent) => (
                      <Link
                        key={agent.id}
                        href={`/agents?run=${agent.id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition"
                      >
                        <p className="font-medium text-sm text-gray-900">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {agent.description}
                        </p>
                      </Link>
                    ))}
                    {agents.length === 0 && (
                      <p className="text-sm text-gray-400">
                        No agents configured yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Chats */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">
                      Recent Chats
                    </h2>
                    <Link
                      href="/chat"
                      className="text-sm text-brand-600 hover:text-brand-700"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recentChats.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/chat?session=${chat.id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 transition"
                      >
                        <p className="font-medium text-sm text-gray-900">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                    {recentChats.length === 0 && (
                      <p className="text-sm text-gray-400">No chats yet</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
