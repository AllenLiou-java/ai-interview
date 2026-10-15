import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const suggestionSchema = new Schema(
  {
    tips: { type: String, required: true },
    sampleAnswer: { type: String, required: true },
  },
  { _id: false },
);

const answeredQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    suggestion: { type: suggestionSchema, required: false },
  },
  { _id: false },
);

const evaluationSchema = new Schema(
  {
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    perQuestion: {
      type: [
        new Schema(
          {
            score: { type: Number, required: true, min: 0, max: 10 },
            feedback: { type: String, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { _id: false },
);

const interviewRecordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobDescription: { type: String, required: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    history: { type: [answeredQuestionSchema], default: [] },
    evaluation: { type: evaluationSchema, required: true },
  },
  { timestamps: true },
);

interviewRecordSchema.index({ userId: 1, createdAt: -1 });

export type InterviewRecordDoc = InferSchemaType<typeof interviewRecordSchema>;

export const InterviewRecord: Model<InterviewRecordDoc> =
  (models.InterviewRecord as Model<InterviewRecordDoc>) ??
  model("InterviewRecord", interviewRecordSchema);
