import mongoose, { Schema } from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      street: {
        type: String,
        trim: false,
      },
      pincode: {
        type: Number,
      },
      state: {
        type: String,
      },
    },
    gstNumber: {
      type: String,
    },
    gstPercentage: {
      type: Number,
    },
    totalTables: {
      type: Number,
      default: 1,
    },
    createdBy: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Restaurant", dataSchema, "Restaurants");
