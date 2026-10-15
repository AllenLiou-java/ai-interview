"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { PublicUser } from "@/lib/interview";
import { useAuth } from "./auth-provider";
import { ErrorBox } from "./interview/chat";

type Mode = "login" | "register";

const fieldClass =
  "w-full rounded-sm border border-line bg-paper p-3 outline-none transition-colors focus:border-navy";

/** 只允許站內相對路徑，避免 open redirect */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/interview";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";
  const next = safeNext(searchParams.get("next"));

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = isRegister
        ? { username: form.username, email: form.email, password: form.password }
        : { identifier: form.identifier, password: form.password };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤，請稍後再試");
      setUser(data.user as PublicUser);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤，請稍後再試");
      setLoading(false);
    }
  }

  const switchHref = `${isRegister ? "/login" : "/register"}${
    searchParams.get("next") ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] text-gold">
          {isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}
        </p>
        <h1 className="font-serif text-3xl font-bold">{isRegister ? "建立帳號" : "登入"}</h1>
        <p className="mt-3 text-muted">
          {isRegister ? "註冊後即可開始模擬面試，並保存每一次的評估紀錄。" : "登入以繼續模擬面試與查看歷史紀錄。"}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-sm border border-line bg-paper p-6 sm:p-8">
          {error && <ErrorBox message={error} />}

          {isRegister ? (
            <>
              <Field label="使用者名稱" htmlFor="username" hint="3–30 個字，可使用中英文、數字、_ . -">
                <input
                  id="username"
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                  value={form.username}
                  onChange={update("username")}
                  className={fieldClass}
                />
              </Field>
              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={update("email")}
                  className={fieldClass}
                />
              </Field>
            </>
          ) : (
            <Field label="使用者名稱或 Email" htmlFor="identifier">
              <input
                id="identifier"
                required
                autoComplete="username"
                value={form.identifier}
                onChange={update("identifier")}
                className={fieldClass}
              />
            </Field>
          )}

          <Field label="密碼" htmlFor="password" hint={isRegister ? "至少 8 個字元" : undefined}>
            <input
              id="password"
              type="password"
              required
              minLength={isRegister ? 8 : undefined}
              maxLength={72}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={form.password}
              onChange={update("password")}
              className={fieldClass}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-navy px-5 py-3 font-medium text-paper transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "處理中…" : isRegister ? "註冊並開始" : "登入"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isRegister ? "已經有帳號了？" : "還沒有帳號？"}
          <Link href={switchHref} className="ml-1 font-medium text-navy underline-offset-4 hover:underline">
            {isRegister ? "前往登入" : "免費註冊"}
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
