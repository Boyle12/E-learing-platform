import mongoose from "mongoose";

const schema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Courses" },
  amount: { type: Number, default: 0 },
  method: { type: String, default: "razorpay" },
  status: { type: String, enum: ["success", "pending", "failed", "refunded"], default: "success" },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Payment = mongoose.model("Payment", schema);
