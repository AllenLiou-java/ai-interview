import { connectDB } from "@/lib/db";
import type { InterviewRecordDetail } from "@/lib/interview";
import { getSession, unauthorized } from "@/lib/session";
import { InterviewRecord } from "@/models/InterviewRecord";

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const notFound = () => Response.json({ error: "找不到這筆面試紀錄" }, { status: 404 });

/** 取得單筆面試紀錄（只能讀取自己的紀錄） */
export async function GET(_req: Request, ctx: RouteContext<"/api/interviews/[id]">) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await ctx.params;
  if (!OBJECT_ID_RE.test(id)) return notFound();

  try {
    await connectDB();
    const doc = await InterviewRecord.findOne({ _id: id, userId: session.userId }).lean();
    if (!doc) return notFound();

    const record: InterviewRecordDetail = {
      id: doc._id.toString(),
      jobDescription: doc.jobDescription,
      totalQuestions: doc.totalQuestions,
      history: doc.history.map((h) => ({
        question: h.question,
        answer: h.answer,
        ...(h.suggestion ? { suggestion: { tips: h.suggestion.tips, sampleAnswer: h.suggestion.sampleAnswer } } : {}),
      })),
      evaluation: {
        overallScore: doc.evaluation.overallScore,
        summary: doc.evaluation.summary,
        strengths: doc.evaluation.strengths,
        improvements: doc.evaluation.improvements,
        perQuestion: doc.evaluation.perQuestion.map((p) => ({ score: p.score, feedback: p.feedback })),
      },
      createdAt: doc.createdAt.toISOString(),
    };
    return Response.json({ record });
  } catch (err) {
    console.error("get interview error", err);
    return Response.json({ error: "無法取得面試紀錄" }, { status: 500 });
  }
}

/** 刪除單筆面試紀錄（只能刪除自己的紀錄） */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/interviews/[id]">) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await ctx.params;
  if (!OBJECT_ID_RE.test(id)) return notFound();

  try {
    await connectDB();
    const result = await InterviewRecord.deleteOne({ _id: id, userId: session.userId });
    if (result.deletedCount === 0) return notFound();
    return Response.json({ ok: true });
  } catch (err) {
    console.error("delete interview error", err);
    return Response.json({ error: "刪除面試紀錄失敗" }, { status: 500 });
  }
}
