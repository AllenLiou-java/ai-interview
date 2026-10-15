import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/session";
import type { PublicUser } from "@/lib/interview";
import { User } from "@/models/User";

const USERNAME_RE = /^[\p{L}\p{N}_.-]{3,30}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username) return Response.json({ error: "請輸入使用者名稱" }, { status: 400 });
  if (!USERNAME_RE.test(username))
    return Response.json(
      { error: "使用者名稱需為 3–30 個字，可使用中英文、數字、底線、點與連字號" },
      { status: 400 },
    );
  if (!email) return Response.json({ error: "請輸入 Email" }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 254)
    return Response.json({ error: "Email 格式不正確" }, { status: 400 });
  if (password.length < 8 || password.length > 72)
    return Response.json({ error: "密碼需為 8–72 個字元" }, { status: 400 });

  try {
    await connectDB();

    const existing = await User.findOne({ $or: [{ username }, { email }] })
      .select("username email")
      .lean();
    if (existing) {
      const field = existing.email === email ? "Email" : "使用者名稱";
      return Response.json({ error: `此${field}已被註冊` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    await createSession({ userId: user.id, username: user.username });
    const result: PublicUser = { id: user.id, username: user.username, email: user.email };
    return Response.json({ user: result }, { status: 201 });
  } catch (err) {
    // 兩個請求同時註冊時，由 unique index 擋下
    if ((err as { code?: number }).code === 11000) {
      return Response.json({ error: "此使用者名稱或 Email 已被註冊" }, { status: 409 });
    }
    console.error("register error", err);
    return Response.json({ error: "註冊失敗，請稍後再試" }, { status: 500 });
  }
}
