"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) return <span className="h-9 w-24" aria-hidden />;

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/login" className="px-3 py-2 text-muted transition-colors hover:text-ink">
          登入
        </Link>
        <Link
          href="/register"
          className="rounded-sm bg-navy px-4 py-2 font-medium text-paper transition-colors hover:bg-ink"
        >
          免費註冊
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm sm:gap-3">
      <Link href="/history" className="hidden px-2 py-2 text-muted transition-colors hover:text-ink sm:block">
        歷史紀錄
      </Link>
      <Link
        href="/interview"
        className="rounded-sm bg-navy px-4 py-2 font-medium text-paper transition-colors hover:bg-ink"
      >
        開始模擬面試
      </Link>
      <span className="hidden max-w-32 truncate pl-2 text-muted lg:block" title={user.email}>
        {user.username}
      </span>
      <button
        onClick={async () => {
          await logout();
          router.push("/");
          router.refresh();
        }}
        className="px-2 py-2 text-muted transition-colors hover:text-ink"
      >
        登出
      </button>
    </div>
  );
}
