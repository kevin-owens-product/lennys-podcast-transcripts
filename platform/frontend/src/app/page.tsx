"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-gray-900 to-gray-800 text-white">
      <nav className="flex items-center justify-between px-8 py-4">
        <span className="text-xl font-bold">Lenny&apos;s Podcast Intelligence</span>
        <div className="flex gap-4">
          {user ? (
            <Link href="/dashboard" className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg font-medium transition">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition">
                Log In
              </Link>
              <Link href="/register" className="bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg font-medium transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 pt-24 pb-16">
        <h1 className="text-6xl font-bold leading-tight mb-6">
          269 episodes of expert wisdom,
          <br />
          <span className="text-brand-500">searchable by AI.</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl">
          Search, chat with, and apply frameworks from Brian Chesky, Shreyas Doshi,
          Tobi Lutke, April Dunford, and 260+ other world-class operators.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            title="Semantic Search"
            desc="Find expert advice on any topic using AI-powered semantic search across all transcripts."
          />
          <FeatureCard
            title="AI Agents"
            desc="Chat with specialized agents: product advisor, growth analyst, quote finder, and more."
          />
          <FeatureCard
            title="Framework Templates"
            desc="Apply pre-mortem, positioning, growth diagnostic, and strategy check templates."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Multi-Tenant"
            desc="Isolated workspaces for teams. Each tenant gets their own data, agents, and templates."
          />
          <FeatureCard
            title="Multi-Language"
            desc="Full i18n support with English, Spanish, and French. Add more languages easily."
          />
          <FeatureCard
            title="Admin Panel"
            desc="Manage users, tenants, transcript ingestion, and platform analytics from one dashboard."
          />
        </div>
      </main>

      <footer className="text-center py-8 text-gray-500 text-sm">
        Built with insights from Lenny&apos;s Podcast. For educational and research purposes.
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
