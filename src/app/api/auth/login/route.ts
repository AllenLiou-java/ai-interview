import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/session";
import type { PublicUser } from "@/lib/interview";
import { User } from "@/models/User";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  // 可使用 Email 或使用者名稱登入
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!identifier || !password) {
    return Response.json({ error: "請輸入帳號與密碼" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne(
      identifier.includes("@") ? { email: identifier.toLowerCase() } : { username: identifier },
    ).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json({ error: "帳號或密碼錯誤" }, { status: 401 });
    }

    await createSession({ userId: user.id, username: user.username });
    const result: PublicUser = { id: user.id, username: user.username, email: user.email };
    return Response.json({ user: result });
  } catch (err) {
    console.error("login error", err);
    return Response.json({ error: "登入失敗，請稍後再試" }, { status: 500 });
  }
}
