import { jwtVerify, SignJWT } from "jose";

// 不依賴 next/headers，proxy 與 route handler 都可以使用
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

export type SessionPayload = { userId: string; username: string };

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("伺服器未設定 SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.username !== "string") return null;
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}
