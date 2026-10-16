export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 10;
export const DEFAULT_QUESTIONS = 3;

export type QA = { question: string; answer: string };

export type InterviewRequest = {
  jobDescription: string;
  totalQuestions: number;
  history: QA[];
};

export type Suggestion = {
  tips: string;
  sampleAnswer: string;
};

export type QuestionResponse = {
  type: "question";
  index: number;
  question: string;
  /** 對上一題回答的建議；第一題時沒有 */
  suggestion?: Suggestion;
};

export type Evaluation = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  perQuestion: { score: number; feedback: string }[];
};

export type EvaluationResponse = {
  type: "evaluation";
  /** 對最後一題回答的建議 */
  suggestion: Suggestion;
} & Evaluation;

export type InterviewResponse = QuestionResponse | EvaluationResponse;

/** 已作答的題目，含該題的回答建議 */
export type AnsweredQuestion = QA & { suggestion?: Suggestion };

export type SaveInterviewRequest = {
  jobDescription: string;
  totalQuestions: number;
  history: AnsweredQuestion[];
  evaluation: Evaluation;
};

export type InterviewRecordSummary = {
  id: string;
  jobDescription: string;
  totalQuestions: number;
  overallScore: number;
  createdAt: string;
};

export type InterviewRecordDetail = SaveInterviewRequest & {
  id: string;
  createdAt: string;
};

export type PublicUser = { id: string; username: string; email: string };

/** BYOK：前端以此 header 帶上使用者自己的 OpenAI API Key */
export const OPENAI_KEY_HEADER = "x-openai-api-key";
/** API Key 缺少或無效時的錯誤代碼，前端據此引導使用者重新設定 */
export const API_KEY_ERROR_CODE = "invalid_api_key";
