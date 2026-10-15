import Link from "next/link";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span
        className={`flex size-8 items-center justify-center rounded-sm border font-serif text-sm font-bold ${
          light ? "border-gold text-gold" : "border-navy bg-navy text-gold-soft"
        }`}
      >
        IA
      </span>
      <span className="leading-tight">
        <span className={`block font-serif text-base font-bold tracking-wide ${light ? "text-paper" : "text-ink"}`}>
          Interview Atelier
        </span>
        <span className={`block text-[11px] tracking-[0.2em] ${light ? "text-gold-soft/70" : "text-muted"}`}>
          AI 面試模擬顧問
        </span>
      </span>
    </Link>
  );
}
