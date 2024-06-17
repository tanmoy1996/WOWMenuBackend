import mongoose from "mongoose";
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    iterations: [
      {
        items: [Object],
        instruction: {
          type: String,
        },
        status: {
          type: String,
          default: "Pending",
        },
        createdAt: {
          type: Date,
          immutable: true,
          default: () => Date.now(),
        },
        acceptedBy: {
          type: Schema.Types.ObjectId,
          ref: "Users",
        },
      },
    ],
    tableNo: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    orderNo: String, // TODO:to be auto generated
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Order", orderSchema);
