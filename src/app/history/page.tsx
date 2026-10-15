"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ErrorBox } from "@/components/interview/chat";
import type { InterviewRecordSummary } from "@/lib/interview";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InterviewRecordSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/interviews?page=${p}&limit=${PAGE_SIZE}`);
        if (res.status === 401) return router.replace("/login?next=/history");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        // 刪除最後一筆後該頁變空時，回到上一頁
        if (data.items.length === 0 && p > 1) return setPage(p - 1);
        setItems(data.items);
        setTotal(data.total);
      } catch {
        setError("無法取得面試紀錄，請稍後再試");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 依頁碼向 API 取資料
    load(page);
  }, [load, page]);

  async function handleDelete(id: string) {
    if (!confirm("確定要刪除這筆面試紀錄嗎？刪除後無法復原。")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error();
      await load(page);
    } catch {
      setError("刪除失敗，請稍後再試");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex-1 px-4 py-14 sm:px-6 md:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-medium tracking-[0.3em] text-gold">HISTORY</p>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">面試歷史紀錄</h1>
            <p className="mt-3 text-muted">回顧每一次模擬面試的題目、回答建議與評估報告。</p>
          </div>
          <Link
            href="/interview"
            className="self-start rounded-sm bg-navy px-5 py-3 font-medium text-paper transition-colors hover:bg-ink sm:self-auto"
          >
            新的模擬面試
          </Link>
        </div>

        <div className="mt-10 space-y-4">
          {error && <ErrorBox message={error} />}

          {loading && items.length === 0 ? (
            <p className="py-16 text-center text-muted">載入中…</p>
          ) : items.length === 0 && !error ? (
            <div className="rounded-sm border border-dashed border-line bg-paper px-6 py-16 text-center">
              <p className="font-serif text-lg font-bold">尚無面試紀錄</p>
              <p className="mt-2 text-sm text-muted">完成一次模擬面試後，評估報告會自動保存在這裡。</p>
              <Link href="/interview" className="mt-6 inline-block font-medium text-navy underline-offset-4 hover:underline">
                開始第一次模擬面試 →
              </Link>
            </div>
          ) : (
            <ul className={`divide-y divide-line rounded-sm border border-line bg-paper ${loading ? "opacity-60" : ""}`}>
              {items.map((item) => (
                <li key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex w-20 shrink-0 items-baseline gap-1 sm:flex-col sm:items-start sm:gap-0">
                    <span className="font-serif text-3xl font-bold text-navy">{item.overallScore}</span>
                    <span className="text-xs text-muted">/ 100</span>
                  </div>
                  <Link href={`/history/${item.id}`} className="min-w-0 flex-1 group">
                    <p className="line-clamp-2 font-medium group-hover:text-navy group-hover:underline underline-offset-4">
                      {item.jobDescription}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDateTime(item.createdAt)}・共 {item.totalQuestions} 題
                    </p>
                  </Link>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/history/${item.id}`}
                      className="rounded-sm border border-navy/30 px-4 py-1.5 text-sm text-navy transition-colors hover:border-navy hover:bg-navy/5"
                    >
                      查看
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-sm border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === item.id ? "刪除中…" : "刪除"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4 text-sm">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || loading}
                className="rounded-sm border border-line px-4 py-1.5 disabled:opacity-40"
              >
                上一頁
              </button>
              <span className="text-muted">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || loading}
                className="rounded-sm border border-line px-4 py-1.5 disabled:opacity-40"
              >
                下一頁
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
