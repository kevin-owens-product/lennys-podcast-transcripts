"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { agentsApi } from "@/lib/api";
import type { Agent } from "@/types";

interface AgentRunResult {
  id: string;
  output_text: string;
  sources: any[];
  token_count: number;
}

export default function AgentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AgentRunResult | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadAgents() {
      try {
        const data = await agentsApi.list();
        setAgents(data);

        const runId = searchParams.get("run");
        if (runId) {
          const agent = data.find((a: Agent) => a.id === runId);
          if (agent) setSelectedAgent(agent);
        }
      } catch (err) {
        console.error("Failed to load agents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, [token, router, searchParams]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAgent || !input.trim() || running) return;

    setRunning(true);
    setResult(null);
    try {
      const data = await agentsApi.run(selectedAgent.id, input);
      setResult(data);
    } catch (err) {
      console.error("Agent run failed:", err);
    } finally {
      setRunning(false);
    }
  }

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Agents</h1>
          <p className="text-gray-500 mb-8">
            Specialized AI assistants powered by Lenny&apos;s Podcast knowledge
            base
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Agent Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setResult(null);
                    }}
                    className={`text-left bg-white rounded-xl border p-6 transition ${
                      selectedAgent?.id === agent.id
                        ? "border-brand-500 ring-2 ring-brand-100"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {agent.name}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {agent.agent_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {agent.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Run Agent Panel */}
              {selectedAgent && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-1">
                    Run: {selectedAgent.name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedAgent.description}
                  </p>

                  <form onSubmit={handleRun} className="mb-6">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe what you'd like this agent to help with..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none mb-3"
                    />
                    <button
                      type="submit"
                      disabled={running || !input.trim()}
                      className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {running ? "Running..." : "Run Agent"}
                    </button>
                  </form>

                  {running && (
                    <div className="flex items-center gap-3 py-8 justify-center">
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span className="text-sm text-gray-500 ml-2">
                        Searching transcripts and generating response...
                      </span>
                    </div>
                  )}

                  {result && (
                    <div>
                      <div className="border-t border-gray-100 pt-6">
                        <div className="prose prose-sm max-w-none text-gray-900">
                          <ReactMarkdown>{result.output_text}</ReactMarkdown>
                        </div>
                      </div>

                      {result.sources && result.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Sources
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {result.sources.map((src: any, i: number) => (
                              <div
                                key={i}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <p className="text-xs font-medium text-gray-700">
                                  {src.guest}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {src.episode_title}
                                </p>
                                {src.similarity && (
                                  <p className="text-xs text-brand-600 mt-1">
                                    {(src.similarity * 100).toFixed(0)}% match
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.token_count > 0 && (
                        <p className="text-xs text-gray-400 mt-4">
                          {result.token_count} tokens used
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!selectedAgent && agents.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    Select an agent above to get started
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
