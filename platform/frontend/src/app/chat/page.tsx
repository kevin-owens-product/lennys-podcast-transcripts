"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { chatApi, agentsApi } from "@/lib/api";
import type { ChatSession, ChatMessage, Agent } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(
    searchParams.get("session")
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const [sessionsData, agentsData] = await Promise.all([
          chatApi.listSessions(),
          agentsApi.list(),
        ]);
        setSessions(sessionsData);
        setAgents(agentsData);
        if (agentsData.length > 0) {
          setSelectedAgent(agentsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load chat data:", err);
      } finally {
        setLoadingSessions(false);
      }
    }
    load();
  }, [token, router]);

  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession);
    }
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(sessionId: string) {
    try {
      const data = await chatApi.getMessages(sessionId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  async function handleNewChat() {
    try {
      const session = await chatApi.createSession(
        "New Chat",
        selectedAgent || undefined
      );
      setSessions((prev) => [session, ...prev]);
      setActiveSession(session.id);
      setMessages([]);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    let sessionId = activeSession;

    if (!sessionId) {
      try {
        const session = await chatApi.createSession(
          input.slice(0, 50),
          selectedAgent || undefined
        );
        setSessions((prev) => [session, ...prev]);
        sessionId = session.id;
        setActiveSession(sessionId);
      } catch (err) {
        console.error("Failed to create session:", err);
        return;
      }
    }

    const currentSessionId = sessionId as string;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: currentSessionId,
      role: "user",
      content: input,
      sources: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await chatApi.sendMessage(currentSessionId, input);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: currentSessionId,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  }

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Chat Sidebar - Sessions */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            + New Chat
          </button>
        </div>

        <div className="p-3">
          <label className="text-xs text-gray-500 block mb-1.5">Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Default (Research)</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingSessions ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Loading...
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                  activeSession === session.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium truncate text-xs">{session.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(session.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Main Area */}
      <main className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !activeSession && (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">&#x1F4AC;</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start a Conversation
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Ask questions about product management, growth, leadership, or
                  any topic covered in Lenny&apos;s Podcast. The AI will search
                  transcripts and provide expert-backed answers.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-5 py-3 ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <div
                    className={`text-sm leading-relaxed prose prose-sm max-w-none ${
                      msg.role === "user" ? "prose-invert" : ""
                    }`}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1.5">
                        Sources
                      </p>
                      <div className="space-y-1">
                        {msg.sources.map((src: any, i: number) => (
                          <p key={i} className="text-xs text-gray-400">
                            {src.guest} &mdash; {src.episode_title}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form
            onSubmit={handleSend}
            className="max-w-3xl mx-auto flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about product management, growth, leadership..."
              disabled={sending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
