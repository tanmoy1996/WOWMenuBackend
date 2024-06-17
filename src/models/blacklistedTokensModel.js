import mongoose from "mongoose";
const Schema = mongoose.Schema;

const dataSchema = new Schema(
  {
    token: {
      required: true,
      type: String,
      unique: true,
      trim: true,
    },
    userId: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    expiresAt: { type: Date, expires: 10 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model(
  "BlacklistedToken",
  dataSchema,
  "BlacklistedTokens",
);
