import { connectDB } from "@/lib/db";
import { deleteSession, getSession, unauthorized } from "@/lib/session";
import type { PublicUser } from "@/lib/interview";
import { User } from "@/models/User";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    await connectDB();
    const user = await User.findById(session.userId).select("username email");
    if (!user) {
      // 使用者已被刪除，清掉失效的 session
      await deleteSession();
      return unauthorized();
    }
    const result: PublicUser = { id: user.id, username: user.username, email: user.email };
    return Response.json({ user: result });
  } catch (err) {
    console.error("me error", err);
    return Response.json({ error: "無法取得使用者資訊" }, { status: 500 });
  }
}
