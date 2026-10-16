"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { maskApiKey, setApiKey, useApiKey } from "@/lib/api-key";

const ApiKeyDialogContext = createContext<(() => void) | null>(null);

/** 提供全站共用的 API Key 設定視窗，任何元件都可透過 useApiKeyDialog() 開啟 */
export function ApiKeyDialogProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [openCount, setOpenCount] = useState(0);

  const open = useCallback(() => {
    setOpenCount((n) => n + 1);
    dialogRef.current?.showModal();
  }, []);

  return (
    <ApiKeyDialogContext value={open}>
      {children}
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-sm border border-line bg-paper p-0 text-ink backdrop:bg-ink/40"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        {/* 每次開啟重新掛載，讓輸入框回到初始狀態 */}
        <ApiKeyForm key={openCount} onDone={() => dialogRef.current?.close()} />
      </dialog>
    </ApiKeyDialogContext>
  );
}

export function useApiKeyDialog() {
  const ctx = useContext(ApiKeyDialogContext);
  if (!ctx) throw new Error("useApiKeyDialog 必須在 ApiKeyDialogProvider 內使用");
  return ctx;
}

function ApiKeyForm({ onDone }: { onDone: () => void }) {
  const savedKey = useApiKey();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const key = value.trim();
    if (!key) return setError("請輸入 API Key");
    if (!key.startsWith("sk-")) return setError("OpenAI API Key 應以 sk- 開頭");
    setApiKey(key);
    onDone();
  }

  function handleClear() {
    setApiKey("");
    onDone();
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 p-6 sm:p-8">
      <div>
        <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold">BRING YOUR OWN KEY</p>
        <h2 className="font-serif text-xl font-bold">設定 OpenAI API Key</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          模擬面試使用你自己的 OpenAI API Key 呼叫模型，費用由你的 OpenAI 帳戶支付。Key 只儲存在這個瀏覽器的
          localStorage，僅在面試時隨請求轉送給 OpenAI，伺服器不會保存。
        </p>
      </div>

      {savedKey && (
        <div className="flex items-center justify-between gap-3 rounded-sm border border-gold/40 bg-gold-soft/40 px-3 py-2 text-sm">
          <span>
            目前：<span className="font-mono">{maskApiKey(savedKey)}</span>
          </span>
          <button type="button" onClick={handleClear} className="text-red-700 underline-offset-4 hover:underline">
            移除
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="openai-key" className="block text-sm font-medium">
          {savedKey ? "更換 API Key" : "API Key"}
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="openai-key"
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder="sk-..."
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-sm border border-line bg-paper p-3 font-mono text-sm outline-none transition-colors focus:border-navy"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="shrink-0 rounded-sm border border-line px-3 text-sm text-muted transition-colors hover:text-ink"
          >
            {visible ? "隱藏" : "顯示"}
          </button>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <p className="text-xs text-muted">
          可至{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-navy underline underline-offset-2"
          >
            platform.openai.com/api-keys
          </a>{" "}
          建立。請勿在公用電腦上儲存。
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-sm px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          取消
        </button>
        <button
          type="submit"
          className="rounded-sm bg-navy px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink"
        >
          儲存
        </button>
      </div>
    </form>
  );
}
