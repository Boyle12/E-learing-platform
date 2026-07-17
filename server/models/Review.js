import mongoose from "mongoose";

const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Courses", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: "" },
}, { timestamps: true });
export const Review = mongoose.model("Review", schema);
