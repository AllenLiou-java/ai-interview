"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ErrorBox,
  EvaluationCard,
  InterviewerBubble,
  QuestionLabel,
  SuggestionCard,
  UserBubble,
} from "@/components/interview/chat";
import { useApiKeyDialog } from "@/components/api-key-dialog";
import { getApiKey, maskApiKey, useApiKey } from "@/lib/api-key";
import {
  API_KEY_ERROR_CODE,
  DEFAULT_QUESTIONS,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  OPENAI_KEY_HEADER,
  type AnsweredQuestion,
  type EvaluationResponse,
  type InterviewResponse,
  type QA,
  type SaveInterviewRequest,
  type Suggestion,
} from "@/lib/interview";

type Stage = "setup" | "interview" | "result";
type SaveState = { status: "idle" | "saving" | "error" } | { status: "saved"; id: string };

const primaryButton =
  "rounded-sm bg-navy px-5 py-3 font-medium text-paper transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50";
const fieldClass =
  "w-full rounded-sm border border-line bg-paper p-3 outline-none transition-colors focus:border-navy";

export default function InterviewPage() {
  const router = useRouter();
  const apiKey = useApiKey();
  const openApiKeyDialog = useApiKeyDialog();
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [history, setHistory] = useState<QA[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [pendingAnswer, setPendingAnswer] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [save, setSave] = useState<SaveState>({ status: "idle" });
  const [savePayload, setSavePayload] = useState<SaveInterviewRequest | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [history, currentQuestion, pendingAnswer, loading, evaluation, error, save]);

  function redirectToLogin() {
    router.replace("/login?next=/interview");
  }

  async function saveRecord(payload: SaveInterviewRequest) {
    setSave({ status: "saving" });
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) return redirectToLogin();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSave({ status: "saved", id: data.id });
    } catch {
      setSave({ status: "error" });
    }
  }

  async function callInterview(nextHistory: QA[]) {
    const key = getApiKey();
    if (!key) {
      setError("請先設定你的 OpenAI API Key");
      openApiKeyDialog();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json", [OPENAI_KEY_HEADER]: key },
        body: JSON.stringify({ jobDescription, totalQuestions, history: nextHistory }),
      });
      if (res.status === 401) return redirectToLogin();
      const data = await res.json();
      if (data.code === API_KEY_ERROR_CODE) openApiKeyDialog();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤，請稍後再試");

      const result = data as InterviewResponse;
      const nextSuggestions = result.suggestion ? [...suggestions, result.suggestion] : suggestions;
      setHistory(nextHistory);
      setSuggestions(nextSuggestions);
      setPendingAnswer("");
      setAnswer("");
      if (result.type === "question") {
        setCurrentQuestion(result.question);
        setStage("interview");
      } else {
        setCurrentQuestion("");
        setEvaluation(result);
        setStage("result");

        const { overallScore, summary, strengths, improvements, perQuestion } = result;
        const evaluationOnly = { overallScore, summary, strengths, improvements, perQuestion };
        const answered: AnsweredQuestion[] = nextHistory.map((qa, i) =>
          nextSuggestions[i] ? { ...qa, suggestion: nextSuggestions[i] } : qa,
        );
        const payload = { jobDescription, totalQuestions, history: answered, evaluation: evaluationOnly };
        setSavePayload(payload);
        saveRecord(payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    callInterview([]);
  }

  function sendAnswer() {
    const text = answer.trim();
    if (!text || loading) return;
    setPendingAnswer(text);
    callInterview([...history, { question: currentQuestion, answer: text }]);
  }

  function handleRestart() {
    setStage("setup");
    setHistory([]);
    setSuggestions([]);
    setCurrentQuestion("");
    setPendingAnswer("");
    setAnswer("");
    setEvaluation(null);
    setError("");
    setSave({ status: "idle" });
    setSavePayload(null);
  }

  if (stage === "setup") {
    return (
      <main className="flex-1 px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="mb-3 text-xs font-medium tracking-[0.3em] text-gold">MOCK INTERVIEW</p>
            <h1 className="font-serif text-3xl leading-snug font-bold sm:text-4xl">開始你的模擬面試</h1>
            <p className="mt-4 leading-relaxed text-muted">
              提供職缺描述與題數，AI 面試顧問會逐題提問，並在每題後給你更好的回答方式，最後提供綜合評估報告。
            </p>
            <ul className="mt-8 space-y-3 border-t border-line pt-6 text-sm text-muted">
              {["職缺描述越完整，題目越貼近實際面試", "回答時盡量具體，提及情境、行動與成果", "完成後評估報告會自動存入歷史紀錄"].map(
                (tip) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                    {tip}
                  </li>
                ),
              )}
            </ul>
            <Link href="/history" className="mt-6 inline-block text-sm font-medium text-navy underline-offset-4 hover:underline">
              查看歷史紀錄 →
            </Link>
          </div>

          <form onSubmit={handleStart} className="space-y-6 rounded-sm border border-line bg-paper p-6 sm:p-8">
            {error && <ErrorBox message={error} />}
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="jd">
                職缺描述
              </label>
              <textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                maxLength={5000}
                placeholder="例如：前端工程師，熟悉 React、TypeScript，具備 2 年以上開發經驗…"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="count">
                題數（{MIN_QUESTIONS}–{MAX_QUESTIONS} 題）
              </label>
              <input
                id="count"
                type="number"
                min={MIN_QUESTIONS}
                max={MAX_QUESTIONS}
                value={totalQuestions}
                onChange={(e) => {
                  const n = Math.round(Number(e.target.value));
                  setTotalQuestions(
                    Number.isFinite(n) ? Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, n)) : DEFAULT_QUESTIONS,
                  );
                }}
                className={`${fieldClass} w-32`}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-sm border border-line bg-cream px-4 py-3 text-sm">
              <span className="text-muted">
                OpenAI API Key：
                {apiKey ? (
                  <span className="font-mono text-ink">{maskApiKey(apiKey)}</span>
                ) : apiKey === "" ? (
                  <span className="text-red-700">尚未設定</span>
                ) : null}
              </span>
              <button
                type="button"
                onClick={openApiKeyDialog}
                className="shrink-0 font-medium text-navy underline-offset-4 hover:underline"
              >
                {apiKey ? "變更" : "設定 →"}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !jobDescription.trim() || !apiKey}
              className={`${primaryButton} w-full`}
            >
              {loading ? "準備面試中…" : "開始面試 →"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const answeredCount = history.length;
  const isLastQuestion = answeredCount + 1 === totalQuestions;

  return (
    <main className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="border-b border-line bg-paper px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <p className="font-serif font-bold">{stage === "result" ? "模擬面試已完成" : "模擬面試進行中"}</p>
            <p className="text-xs text-muted">
              {stage === "result"
                ? "以下為評估報告"
                : `第 ${Math.min(answeredCount + 1, totalQuestions)} / ${totalQuestions} 題`}
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="rounded-sm border border-navy/30 px-4 py-1.5 text-sm text-navy transition-colors hover:border-navy hover:bg-navy/5"
          >
            {stage === "result" ? "再練一次" : "重新開始"}
          </button>
        </div>
        <div className="mx-auto mt-3 h-1 max-w-3xl overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-gold transition-all"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {history.map((qa, i) => (
            <div key={i} className="flex flex-col gap-4">
              <InterviewerBubble>
                <QuestionLabel index={i + 1} total={totalQuestions} />
                <p className="whitespace-pre-wrap">{qa.question}</p>
              </InterviewerBubble>
              <UserBubble>{qa.answer}</UserBubble>
              {suggestions[i] && (
                <InterviewerBubble tone="gold">
                  <SuggestionCard suggestion={suggestions[i]} />
                </InterviewerBubble>
              )}
            </div>
          ))}

          {currentQuestion && (
            <InterviewerBubble>
              <QuestionLabel index={answeredCount + 1} total={totalQuestions} />
              <p className="whitespace-pre-wrap">{currentQuestion}</p>
            </InterviewerBubble>
          )}

          {pendingAnswer && <UserBubble>{pendingAnswer}</UserBubble>}

          {loading && (
            <InterviewerBubble>
              <span className="inline-flex gap-1 py-1" aria-label="面試官輸入中">
                <span className="size-2 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
                <span className="size-2 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
                <span className="size-2 animate-bounce rounded-full bg-gold" />
              </span>
            </InterviewerBubble>
          )}

          {evaluation && (
            <InterviewerBubble wide>
              <EvaluationCard evaluation={evaluation} history={history} />
            </InterviewerBubble>
          )}

          {stage === "result" && (
            <SaveStatus state={save} onRetry={() => savePayload && saveRecord(savePayload)} />
          )}

          {error && <ErrorBox message={error} />}
          <div ref={bottomRef} />
        </div>
      </div>

      {stage === "interview" && (
        <div className="border-t border-line bg-paper px-4 py-3 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendAnswer();
            }}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  sendAnswer();
                }
              }}
              rows={3}
              maxLength={3000}
              disabled={loading}
              placeholder="輸入你的回答…（Enter 送出，Shift+Enter 換行）"
              className={`${fieldClass} flex-1 resize-none bg-cream disabled:opacity-60`}
            />
            <button type="submit" disabled={loading || !answer.trim()} className={primaryButton}>
              {isLastQuestion ? "送出並評分" : "送出"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const base = "flex items-center justify-between gap-4 rounded-sm border px-4 py-3 text-sm";
  switch (state.status) {
    case "saving":
      return <div className={`${base} border-line bg-paper text-muted`}>正在儲存至歷史紀錄…</div>;
    case "saved":
      return (
        <div className={`${base} border-gold/40 bg-gold-soft/40`}>
          <span>✓ 已儲存至歷史紀錄</span>
          <Link href={`/history/${state.id}`} className="font-medium text-navy underline-offset-4 hover:underline">
            查看紀錄 →
          </Link>
        </div>
      );
    case "error":
      return (
        <div className={`${base} border-red-300 bg-red-50 text-red-700`}>
          <span>儲存失敗，紀錄尚未保存。</span>
          <button onClick={onRetry} className="font-medium underline-offset-4 hover:underline">
            重試
          </button>
        </div>
      );
    default:
      return null;
  }
}
