import Razorpay from "razorpay";
import { Bills, Transaction } from "../models";
import crypto from "crypto";

import {
  RAZORPAY_WEBHOOK_SECRET,
  RAZORPAY_KEY_DEV,
  RAZORPAY_SECRET_DEV,
} from "../../config";

const razorpayController = {
  async getPaymentDetail(req, res) {
    try {
      const billId = req.params.id;
      const bill = await Bills.findById(billId);
      if (!bill)
        return res.status(404).json({
          success: false,
          error: { message: "Bill Not Found" },
        });

      const rzp = new Razorpay({
        key_id: RAZORPAY_KEY_DEV,
        key_secret: RAZORPAY_SECRET_DEV,
      });

      const rzpOrder = await rzp.orders.create({
        amount: bill.total * 100,
        currency: "INR",
        receipt: `Bill${bill.id}`,
        payment_capture: true,
        notes: {
          Bill: `${bill.id}`,
        }, //Key-value pair used to store additional information
      });
      res.status(200).json({
        success: true,
        data: rzpOrder,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
  async verify(req, res) {
    try {
      // eslint-disable-next-line
      console.log("RAZORPAY_WEBHOOK_SECRET", RAZORPAY_WEBHOOK_SECRET);
      // eslint-disable-next-line
      console.log("req.body", req.body);
      var generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");

      // eslint-disable-next-line
      console.log("digest", generatedSignature);
      // eslint-disable-next-line
      console.log("req.headers", req.headers["x-razorpay-signature"]);
      const valid = Razorpay.validateWebhookSignature(
        req.body,
        req.headers["x-razorpay-signature"],
        RAZORPAY_WEBHOOK_SECRET,
      );
      // eslint-disable-next-line
      console.log("valid", valid);
      // if (generatedSignature === req.headers["x-razorpay-signature"]) {
      // eslint-disable-next-line
      //   console.log("request is legit");
      // }

      const payment = req.body.payload.payment;
      const transaction = new Transaction({
        entity: payment.entity,
        bill: payment.entity.notes.Bill,
        created_at: payment.created_at,
      });
      const savedTranaction = await transaction.save();
      const bill = await Bills.findById(payment.entity.notes.Bill);
      Object.assign(bill, {
        paymentMode: "Online",
        razorpay: savedTranaction.id,
      });
      await bill.save();
      res.status(200).json({ success: "ok" });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
};

export default razorpayController;
