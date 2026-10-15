import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type SessionPayload,
} from "./session-token";

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export function unauthorized() {
  return Response.json({ error: "請先登入" }, { status: 401 });
}
