"use client";

import { useSyncExternalStore } from "react";

// BYOK：使用者自己的 OpenAI API Key 只存在瀏覽器 localStorage，每次呼叫時透過 header 帶給後端轉發
const STORAGE_KEY = "openai_api_key";
const CHANGE_EVENT = "openai-api-key-change";

export function getApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 無痕模式或儲存被封鎖時無法保存
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** 回傳目前的 API Key；伺服器端渲染時為 null（尚未得知） */
export function useApiKey(): string | null {
  return useSyncExternalStore(subscribe, getApiKey, () => null);
}

export function maskApiKey(key: string) {
  return key.length <= 10 ? "••••••" : `${key.slice(0, 5)}••••${key.slice(-4)}`;
}
