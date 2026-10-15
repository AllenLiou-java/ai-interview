import type { Evaluation, QA, Suggestion } from "@/lib/interview";

export function InterviewerBubble({
  children,
  wide,
  tone = "default",
}: {
  children: React.ReactNode;
  wide?: boolean;
  tone?: "default" | "gold";
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-medium text-gold-soft">
        顧問
      </div>
      <div
        className={`${wide ? "w-full" : "max-w-[80%]"} rounded-sm border px-4 py-3 leading-relaxed ${
          tone === "gold" ? "border-gold/40 bg-gold-soft/40" : "border-line bg-paper"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-end gap-2.5">
      <div className="max-w-[80%] rounded-sm bg-navy px-4 py-3 leading-relaxed whitespace-pre-wrap text-paper">
        {children}
      </div>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold bg-paper text-xs font-medium text-gold">
        我
      </div>
    </div>
  );
}

export function QuestionLabel({ index, total }: { index: number; total: number }) {
  return (
    <p className="mb-1 font-serif text-xs font-bold tracking-wider text-gold">
      QUESTION {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </p>
  );
}

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="font-serif font-bold text-gold">更好的回答方式</p>
      <p className="whitespace-pre-wrap">{suggestion.tips}</p>
      <div className="rounded-sm border border-line bg-paper p-3">
        <p className="mb-1 text-xs font-medium tracking-wider text-muted">參考回答</p>
        <p className="whitespace-pre-wrap">{suggestion.sampleAnswer}</p>
      </div>
    </div>
  );
}

export function EvaluationCard({ evaluation, history }: { evaluation: Evaluation; history: QA[] }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-5">
        <p className="text-xs tracking-[0.2em] text-muted">綜合評分</p>
        <p className="mt-1 font-serif text-5xl font-bold text-navy">
          {evaluation.overallScore}
          <span className="text-lg text-muted"> / 100</span>
        </p>
        <p className="mt-3 text-ink/80">{evaluation.summary}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <section>
          <h2 className="mb-2 font-serif font-bold text-navy">優勢</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm marker:text-navy">
            {evaluation.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-2 font-serif font-bold text-gold">改進建議</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm marker:text-gold">
            {evaluation.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="mb-2 font-serif font-bold">逐題分數</h2>
        <ul className="divide-y divide-line border-y border-line text-sm">
          {history.map((qa, i) => {
            const pq = evaluation.perQuestion[i];
            return (
              <li key={i} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    <span className="mr-2 font-serif text-gold">{String(i + 1).padStart(2, "0")}</span>
                    {qa.question}
                  </p>
                  {pq && <span className="shrink-0 tabular-nums text-muted">{pq.score} / 10</span>}
                </div>
                {pq && <p className="mt-1 text-muted">{pq.feedback}</p>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
  );
}
