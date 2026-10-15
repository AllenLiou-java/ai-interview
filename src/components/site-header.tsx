import Link from "next/link";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

const NAV = [
  { href: "/#services", label: "服務內容" },
  { href: "/#process", label: "顧問流程" },
  { href: "/#report", label: "評估報告" },
  { href: "/#faq", label: "常見問題" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <UserMenu />
      </div>
    </header>
  );
}
