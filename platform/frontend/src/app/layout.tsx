"use client";

import "./globals.css";
import { useState, useEffect, useCallback } from "react";
import { NextIntlClientProvider } from "next-intl";
import { AuthContext, User, getStoredAuth, storeAuth, clearAuth } from "@/lib/auth";
import { auth as authApi } from "@/lib/api";

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";
import frMessages from "../../messages/fr.json";

const messagesMap: Record<string, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
};

function getStoredLocale(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("locale") || "en";
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      authApi.me(stored.token).then((u: any) => setUser(u)).catch(() => clearAuth());
    }
    setLocaleState(getStoredLocale());
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

  const messages = messagesMap[locale] || enMessages;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthContext.Provider value={{ user, token, tenantId, locale, setAuth, logout, setLocale }}>
            {loaded ? children : (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-gray-400">Loading...</div>
              </div>
            )}
          </AuthContext.Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
