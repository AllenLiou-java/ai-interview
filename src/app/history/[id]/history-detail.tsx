"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ErrorBox,
  EvaluationCard,
  InterviewerBubble,
  QuestionLabel,
  SuggestionCard,
  UserBubble,
} from "@/components/interview/chat";
import { formatDateTime } from "@/lib/format";
import type { InterviewRecordDetail } from "@/lib/interview";

export function HistoryDetail({ id }: { id: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<InterviewRecordDetail | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/interviews/${id}`)
      .then(async (res) => {
        if (res.status === 401) return router.replace(`/login?next=/history/${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(data.error ?? "無法取得面試紀錄");
        else setRecord(data.record);
      })
      .catch(() => !cancelled && setError("無法取得面試紀錄，請稍後再試"));
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  async function handleDelete() {
    if (!confirm("確定要刪除這筆面試紀錄嗎？刪除後無法復原。")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error();
      router.replace("/history");
    } catch {
      setError("刪除失敗，請稍後再試");
      setDeleting(false);
    }
  }

  return (
    <main className="flex-1 px-4 py-14 sm:px-6 md:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/history" className="text-sm text-muted transition-colors hover:text-ink">
          ← 返回歷史紀錄
        </Link>

        {error && (
          <div className="mt-6">
            <ErrorBox message={error} />
          </div>
        )}

        {!record && !error && <p className="py-24 text-center text-muted">載入中…</p>}

        {record && (
          <>
            <div className="mt-6 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold">INTERVIEW RECORD</p>
                <h1 className="font-serif text-3xl font-bold">面試紀錄</h1>
                <p className="mt-2 text-sm text-muted">
                  {formatDateTime(record.createdAt)}・共 {record.totalQuestions} 題・綜合評分 {record.evaluation.overallScore}
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="self-start rounded-sm border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50 sm:self-auto"
              >
                {deleting ? "刪除中…" : "刪除紀錄"}
              </button>
            </div>

            <details className="group mt-6 rounded-sm border border-line bg-paper p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                職缺描述
                <span className="text-gold transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{record.jobDescription}</p>
            </details>

            <div className="mt-8 flex flex-col gap-4">
              {record.history.map((qa, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <InterviewerBubble>
                    <QuestionLabel index={i + 1} total={record.totalQuestions} />
                    <p className="whitespace-pre-wrap">{qa.question}</p>
                  </InterviewerBubble>
                  <UserBubble>{qa.answer}</UserBubble>
                  {qa.suggestion && (
                    <InterviewerBubble tone="gold">
                      <SuggestionCard suggestion={qa.suggestion} />
                    </InterviewerBubble>
                  )}
                </div>
              ))}
              <InterviewerBubble wide>
                <EvaluationCard evaluation={record.evaluation} history={record.history} />
              </InterviewerBubble>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
