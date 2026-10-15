import Link from "next/link";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/interview";

const SERVICES = [
  {
    no: "01",
    title: "依職缺量身出題",
    body: "解讀職缺描述中的職責與能力要求，從技術、實務經驗到行為面向設計題目，不再準備用不到的題庫。",
  },
  {
    no: "02",
    title: "追問式的顧問提問",
    body: "面試官會根據你上一題的回答調整方向或深入追問，貼近真實面試的節奏與壓力。",
  },
  {
    no: "03",
    title: "逐題回答建議",
    body: "每答完一題，立即說明可以改進之處，並提供以你原本內容改寫的參考回答，邊練邊修正。",
  },
  {
    no: "04",
    title: "綜合評估報告",
    body: "面試結束後提供 0–100 綜合評分、優勢與改進建議，以及每一題的分數與回饋。",
  },
];

const STEPS = [
  { title: "提供職缺描述", body: "貼上你想應徵的職缺內容，並選擇這次要練習的題數。" },
  { title: "一對一模擬面試", body: "以對話方式逐題作答，面試官會依你的回答延伸提問。" },
  { title: "即時回饋修正", body: "每題作答後取得改進方向與參考回答，下一題就能用上。" },
  { title: "取得評估報告", body: "檢視綜合評分與逐題分析，清楚知道下一步該加強什麼。" },
];

const AUDIENCES = ["即將面試、想針對職缺準備的求職者", "轉職或第一次求職、想熟悉面試節奏的人", "想把經歷說得更有結構、更有說服力的專業人士"];

const FAQ = [
  {
    q: "需要註冊帳號嗎？",
    a: "需要。只要填寫使用者名稱、Email 與密碼即可免費註冊，登入後就能開始模擬面試。",
  },
  {
    q: "一次可以練習幾題？",
    a: `每次可自訂 ${MIN_QUESTIONS} 到 ${MAX_QUESTIONS} 題，建議初次使用從 3 題開始。`,
  },
  {
    q: "我的面試紀錄會被保存嗎？",
    a: "每次完成的模擬面試會保存在你的帳號中，可隨時在「歷史紀錄」回顧或刪除。作答內容會傳送給 AI 模型以產生題目與回饋。",
  },
  {
    q: "評分可以代表真實面試結果嗎？",
    a: "評分與建議由 AI 產生，適合作為準備方向的參考，實際結果仍取決於各公司的評估標準。",
  },
];

function CtaButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "ghost" | "gold" }) {
  const styles = {
    primary: "bg-navy text-paper hover:bg-ink",
    gold: "bg-gold text-ink hover:bg-gold-soft",
    ghost: "border border-navy/30 text-navy hover:border-navy hover:bg-navy/5",
  }[variant];
  return (
    <Link href="/interview" className={`inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 font-medium transition-colors ${styles}`}>
      {children}
    </Link>
  );
}

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="mb-3 text-xs font-medium tracking-[0.3em] text-gold">{eyebrow}</p>
      <h2 className="font-serif text-3xl leading-snug font-bold text-ink sm:text-4xl">{title}</h2>
      {desc && <p className="mt-4 leading-relaxed text-muted">{desc}</p>}
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-sm border border-gold/40" aria-hidden />
      <div className="overflow-hidden rounded-sm border border-line bg-paper shadow-[0_24px_60px_-30px_rgba(15,27,45,0.45)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-serif text-sm font-bold">模擬面試｜資深前端工程師</p>
          <p className="text-xs text-muted">第 2 / 3 題</p>
        </div>
        <div className="space-y-4 px-5 py-6 text-sm">
          <div className="flex gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] text-gold-soft">顧問</span>
            <p className="max-w-[80%] rounded-sm border border-line bg-cream px-3.5 py-2.5 leading-relaxed">
              你提到曾將首頁 LCP 從 4 秒降到 1.8 秒，能說明當時如何找出瓶頸、做了哪些取捨嗎？
            </p>
          </div>
          <div className="flex justify-end">
            <p className="max-w-[80%] rounded-sm bg-navy px-3.5 py-2.5 leading-relaxed text-paper">
              我先用 Lighthouse 與 Performance 面板分析，發現主要是首屏大圖與未拆分的套件…
            </p>
          </div>
          <div className="flex gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] text-gold-soft">顧問</span>
            <div className="max-w-[80%] rounded-sm border border-gold/40 bg-gold-soft/40 px-3.5 py-2.5 leading-relaxed">
              <p className="mb-1 text-xs font-medium text-gold">更好的回答方式</p>
              可以依 STAR 結構補充團隊背景與你的角色，並說明優化後對轉換率的影響，讓成果更具說服力。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportPreview() {
  const rows = [
    { q: "效能優化的實務經驗", s: 8 },
    { q: "SSR 與資料取得策略", s: 6 },
    { q: "跨部門協作與優先順序", s: 7 },
  ];
  return (
    <div className="rounded-sm border border-line bg-paper p-6 shadow-[0_24px_60px_-30px_rgba(15,27,45,0.35)] sm:p-8">
      <div className="flex items-end justify-between border-b border-line pb-5">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted">綜合評分</p>
          <p className="mt-1 font-serif text-5xl font-bold text-navy">
            72<span className="text-lg text-muted"> / 100</span>
          </p>
        </div>
        <span className="rounded-sm bg-gold-soft px-3 py-1 text-xs font-medium text-ink">範例報告</span>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((row, i) => (
          <li key={row.q} className="flex items-center gap-4 py-3.5 text-sm">
            <span className="font-serif text-gold">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1">{row.q}</span>
            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-line">
              <span className="block h-full bg-navy" style={{ width: `${row.s * 10}%` }} />
            </span>
            <span className="w-10 text-right tabular-nums text-muted">{row.s}/10</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
        <div>
          <p className="mb-1.5 font-medium text-navy">優勢</p>
          <p className="text-muted">具備量化成果，技術用語精準。</p>
        </div>
        <div>
          <p className="mb-1.5 font-medium text-gold">改進建議</p>
          <p className="text-muted">補充決策背後的取捨與影響範圍。</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-medium tracking-[0.3em] text-gold">
              <span className="h-px w-8 bg-gold" />
              AI INTERVIEW CONSULTING
            </p>
            <h1 className="font-serif text-4xl leading-tight font-bold text-ink sm:text-5xl">
              像與資深顧問一對一，
              <br />
              準備你的下一場面試
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              貼上職缺描述，AI 面試顧問會針對職務需求逐題提問、即時給出更好的回答方式，並在結束後提供完整的評估報告。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CtaButton>
                立即開始模擬面試 <span aria-hidden>→</span>
              </CtaButton>
              <Link
                href="/#process"
                className="inline-flex items-center justify-center rounded-sm border border-navy/30 px-6 py-3 font-medium text-navy transition-colors hover:border-navy hover:bg-navy/5"
              >
                了解顧問流程
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 border-t border-line pt-6">
              {[
                { k: `${MIN_QUESTIONS}–${MAX_QUESTIONS}`, v: "題自訂題數" },
                { k: "逐題", v: "回答建議" },
                { k: "0–100", v: "綜合評分" },
              ].map((item) => (
                <div key={item.v}>
                  <dt className="font-serif text-2xl font-bold text-navy">{item.k}</dt>
                  <dd className="mt-1 text-xs text-muted">{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ChatPreview />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-16 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <SectionHeading
            eyebrow="SERVICES"
            title="從提問到回饋，完整的面試顧問服務"
            desc="我們把資深面試官的準備方法拆解成四個環節，讓每一次練習都對準你要應徵的職位。"
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
            {SERVICES.map((s) => (
              <article key={s.no} className="bg-paper p-8 transition-colors hover:bg-cream">
                <p className="font-serif text-3xl font-bold text-gold/70">{s.no}</p>
                <h3 className="mt-4 font-serif text-xl font-bold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="scroll-mt-16 bg-navy text-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-medium tracking-[0.3em] text-gold">PROCESS</p>
            <h2 className="font-serif text-3xl leading-snug font-bold sm:text-4xl">四個步驟，完成一次顧問式模擬面試</h2>
          </div>
          <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t border-gold/50 pt-6">
                <p className="font-serif text-sm text-gold">STEP {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-serif text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gold-soft/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Report */}
      <section id="report" className="scroll-mt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="ASSESSMENT REPORT"
              title="一份看得懂、用得上的評估報告"
              desc="面試結束後，你會收到一份結構化的評估：整體評分與評語、表現優勢、具體可執行的改進建議，以及每一題的分數與回饋。"
            />
            <ul className="mt-8 space-y-3">
              {AUDIENCES.map((a) => (
                <li key={a} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-gold" aria-hidden />
                  <span>適合{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <ReportPreview />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 border-t border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="FAQ" title="常見問題" />
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg font-bold">
                  {item.q}
                  <span className="text-gold transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-8 rounded-sm bg-ink px-8 py-12 text-paper md:flex-row md:items-center md:px-14">
            <div>
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">下一場面試，從今天的練習開始</h2>
              <p className="mt-3 text-gold-soft/70">免費註冊，貼上職缺描述即可開始，每次評估都會保存在你的帳號。</p>
            </div>
            <CtaButton variant="gold">
              開始模擬面試 <span aria-hidden>→</span>
            </CtaButton>
          </div>
        </div>
      </section>
    </main>
  );
}
