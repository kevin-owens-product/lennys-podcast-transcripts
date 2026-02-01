"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthContext, User, getStoredAuth, storeAuth, clearAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [locale, setLocaleState] = useState("en");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored.token) {
      setToken(stored.token);
      setTenantId(stored.tenantId);
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${stored.token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((u) => setUser(u))
        .catch(() => {
          clearAuth();
          setToken(null);
          setTenantId(null);
        });
    }
    setLocaleState(localStorage.getItem("locale") || "en");
    setLoaded(true);
  }, []);

  const setAuth = useCallback((user: User, token: string, tenantId?: string) => {
    setUser(user);
    setToken(token);
    if (tenantId) setTenantId(tenantId);
    storeAuth(token, tenantId);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setTenantId(null);
    clearAuth();
  }, []);

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, tenantId, locale, setAuth, logout, setLocale }}>
      {children}
    </AuthContext.Provider>
  );
}
