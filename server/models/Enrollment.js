import mongoose from "mongoose";

const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Courses", required: true },
  status: { type: String, default: "active" },
}, { timestamps: true });
schema.index({ student: 1, course: 1 }, { unique: true });
export const Enrollment = mongoose.model("Enrollment", schema);
