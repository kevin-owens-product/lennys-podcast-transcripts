"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { searchApi } from "@/lib/api";
import type { SearchResult } from "@/types";

export default function SearchPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"semantic" | "keyword">("semantic");
  const [guest, setGuest] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (!token) {
    router.push("/login");
    return null;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const searchFn =
        mode === "semantic" ? searchApi.semantic : searchApi.keyword;
      const data = await searchFn(query, 20, guest || undefined);
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Search Transcripts
          </h1>
          <p className="text-gray-500 mb-6">
            Search across all Lenny&apos;s Podcast episodes using semantic or
            keyword search
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    mode === "semantic"
                      ? "Ask a question or describe what you're looking for..."
                      : "Search for specific words or phrases..."
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setMode("semantic")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    mode === "semantic"
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Semantic
                </button>
                <button
                  type="button"
                  onClick={() => setMode("keyword")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    mode === "keyword"
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Keyword
                </button>
              </div>

              <input
                type="text"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder="Filter by guest name..."
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-48 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </form>

          {/* Results */}
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-48 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">
                No results found. Try a different query or search mode.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {result.episode_title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {result.guest}
                        {result.speaker && (
                          <span className="ml-2 text-gray-400">
                            Speaking: {result.speaker}
                          </span>
                        )}
                        {result.timestamp && (
                          <span className="ml-2 text-gray-400">
                            at {result.timestamp}
                          </span>
                        )}
                      </p>
                    </div>
                    {result.similarity !== undefined && (
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full whitespace-nowrap">
                        {(result.similarity * 100).toFixed(0)}% match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {result.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!searched && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">&#x2315;</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Search the Knowledge Base
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Use <strong>semantic search</strong> to find conceptually
                related content, or <strong>keyword search</strong> for exact
                matches. Filter by guest name to focus on specific experts.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
