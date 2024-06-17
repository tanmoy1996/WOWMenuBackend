import mongoose, { Schema } from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
      unique: false,
    },
    isActive: {
      required: false,
      type: Boolean,
      default: true,
    },
    createdBy: {
      required: true,
      type: Schema.Types.ObjectId,
    },
    restaurant: {
      required: true,
      type: Schema.Types.ObjectId,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Categories", dataSchema, "Categories");
