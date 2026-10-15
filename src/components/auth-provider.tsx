"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { PublicUser } from "@/lib/interview";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  setUser: (user: PublicUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return <AuthContext value={{ user, loading, setUser, logout }}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必須在 AuthProvider 內使用");
  return ctx;
}
