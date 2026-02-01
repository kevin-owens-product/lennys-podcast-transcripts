"use client";

import { createContext, useContext } from "react";

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superadmin: boolean;
  locale: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  locale?: string;
  setAuth: (user: User, token: string, tenantId?: string) => void;
  logout: () => void;
  setLocale?: (locale: string) => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  tenantId: null,
  locale: "en",
  setAuth: () => {},
  logout: () => {},
  setLocale: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function getStoredAuth(): { token: string | null; tenantId: string | null } {
  if (typeof window === "undefined") return { token: null, tenantId: null };
  return {
    token: localStorage.getItem("token"),
    tenantId: localStorage.getItem("tenantId"),
  };
}

export function storeAuth(token: string, tenantId?: string) {
  localStorage.setItem("token", token);
  if (tenantId) localStorage.setItem("tenantId", tenantId);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("tenantId");
}
