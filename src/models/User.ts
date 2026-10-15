import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User: Model<UserDoc> = (models.User as Model<UserDoc>) ?? model("User", userSchema);
