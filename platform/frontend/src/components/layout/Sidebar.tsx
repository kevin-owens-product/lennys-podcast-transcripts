"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { SUPPORTED_LOCALES } from "@/lib/constants";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◻" },
  { href: "/search", label: "Search", icon: "⌕" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/agents", label: "Agents", icon: "⚡" },
  { href: "/templates", label: "Templates", icon: "📋" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, locale, logout, setLocale } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="text-lg font-bold text-brand-700">
          Lenny&apos;s AI
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === item.href
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {user?.is_superadmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === "/admin"
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>⚙</span>
            Admin
          </Link>
        )}
      </nav>

      {/* Language Switcher */}
      <div className="px-4 pb-2">
        <select
          value={locale || "en"}
          onChange={(e) => setLocale?.(e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 bg-gray-50 focus:ring-1 focus:ring-brand-500"
        >
          {SUPPORTED_LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 shrink-0 ml-2">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
