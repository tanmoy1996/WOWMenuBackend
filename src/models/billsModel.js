import mongoose from "mongoose";
const Schema = mongoose.Schema;

const billSchema = new Schema(
  {
    items: [
      {
        _id: false,
        itemId: {
          type: Schema.Types.ObjectId,
          ref: "MenuItem",
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: {
      type: Number,
    },
    cgst: {
      type: Number,
      default: 0,
    },
    sgst: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
    },
    razorpay: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    tableNo: {
      type: Number,
      required: true,
    },
    bill_no: String, // TODO:to be auto generated
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    createdBy: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Bill", billSchema);
