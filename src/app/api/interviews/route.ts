import { connectDB } from "@/lib/db";
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type AnsweredQuestion,
  type Evaluation,
  type InterviewRecordSummary,
  type SaveInterviewRequest,
} from "@/lib/interview";
import { getSession, unauthorized } from "@/lib/session";
import { InterviewRecord } from "@/models/InterviewRecord";

const MAX_TEXT = 10000;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const isText = (v: unknown, max = MAX_TEXT): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;
const isScore = (v: unknown, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;
const isTextList = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length <= 20 && v.every((s) => isText(s, 2000));

function parseRecord(body: unknown): SaveInterviewRequest | string {
  if (typeof body !== "object" || body === null) return "請求格式錯誤";
  const { jobDescription, totalQuestions, history, evaluation } = body as Record<string, unknown>;

  if (!isText(jobDescription, 5000)) return "職缺描述格式錯誤";
  if (
    typeof totalQuestions !== "number" ||
    !Number.isInteger(totalQuestions) ||
    totalQuestions < MIN_QUESTIONS ||
    totalQuestions > MAX_QUESTIONS
  )
    return "題數格式錯誤";

  if (!Array.isArray(history) || history.length !== totalQuestions) return "問答紀錄需與題數相符";
  const cleanHistory: AnsweredQuestion[] = [];
  for (const item of history) {
    const { question, answer, suggestion } = (item ?? {}) as Record<string, unknown>;
    if (!isText(question) || !isText(answer)) return "問答紀錄格式錯誤";
    const qa: AnsweredQuestion = { question, answer };
    if (suggestion != null) {
      const { tips, sampleAnswer } = suggestion as Record<string, unknown>;
      if (!isText(tips) || !isText(sampleAnswer)) return "回答建議格式錯誤";
      qa.suggestion = { tips, sampleAnswer };
    }
    cleanHistory.push(qa);
  }

  const ev = (evaluation ?? {}) as Record<string, unknown>;
  if (
    !isScore(ev.overallScore, 100) ||
    !isText(ev.summary) ||
    !isTextList(ev.strengths) ||
    !isTextList(ev.improvements) ||
    !Array.isArray(ev.perQuestion) ||
    ev.perQuestion.length > MAX_QUESTIONS
  )
    return "評估結果格式錯誤";
  const perQuestion: Evaluation["perQuestion"] = [];
  for (const pq of ev.perQuestion) {
    const { score, feedback } = (pq ?? {}) as Record<string, unknown>;
    if (!isScore(score, 10) || !isText(feedback)) return "評估結果格式錯誤";
    perQuestion.push({ score, feedback });
  }

  return {
    jobDescription: jobDescription.trim(),
    totalQuestions,
    history: cleanHistory,
    evaluation: {
      overallScore: ev.overallScore,
      summary: ev.summary,
      strengths: ev.strengths,
      improvements: ev.improvements,
      perQuestion,
    },
  };
}

/** 取得目前使用者的面試紀錄列表（分頁） */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(params.get("limit")) || DEFAULT_LIMIT)));

  try {
    await connectDB();
    const filter = { userId: session.userId };
    const [docs, total] = await Promise.all([
      InterviewRecord.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("jobDescription totalQuestions evaluation.overallScore createdAt")
        .lean(),
      InterviewRecord.countDocuments(filter),
    ]);

    const items: InterviewRecordSummary[] = docs.map((d) => ({
      id: d._id.toString(),
      jobDescription: d.jobDescription,
      totalQuestions: d.totalQuestions,
      overallScore: d.evaluation.overallScore,
      createdAt: d.createdAt.toISOString(),
    }));
    return Response.json({ items, total, page, limit });
  } catch (err) {
    console.error("list interviews error", err);
    return Response.json({ error: "無法取得面試紀錄" }, { status: 500 });
  }
}

/** 儲存一次完成的模擬面試 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }
  const parsed = parseRecord(body);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });

  try {
    await connectDB();
    const doc = await InterviewRecord.create({ ...parsed, userId: session.userId });
    return Response.json({ id: doc.id, createdAt: doc.createdAt.toISOString() }, { status: 201 });
  } catch (err) {
    console.error("save interview error", err);
    return Response.json({ error: "儲存面試紀錄失敗" }, { status: 500 });
  }
}
