import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "服務",
    links: [
      { href: "/interview", label: "模擬面試" },
      { href: "/#services", label: "服務內容" },
      { href: "/#report", label: "評估報告" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/#process", label: "顧問流程" },
      { href: "/#faq", label: "常見問題" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-gold-soft/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-sm text-sm leading-relaxed">
            以顧問式的提問與回饋，陪你把每一次面試準備得更從容。貼上職缺，即可開始一對一模擬。
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-gold">{col.title}</p>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-paper">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs sm:px-6">
          © 2026 Interview Atelier. 評估內容由 AI 產生，僅供面試準備參考。
        </p>
      </div>
    </footer>
  );
}
