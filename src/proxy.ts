import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

const PROTECTED = ["/interview", "/history"];
const AUTH_PAGES = ["/login", "/register"];

// 頁面層級的快速導向；真正的權限檢查仍在每個 API route 內
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/interview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/interview", "/history/:path*", "/login", "/register"],
};
