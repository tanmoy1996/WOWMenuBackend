import mongoose from "mongoose";
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    entity: {
      type: Object,
    },
    bill: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Transaction", transactionSchema);
