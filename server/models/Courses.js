import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    default: "",
  },
  createdBy: {
    type: String,
    required: true,
  },
  status: { type: String, enum: ["pending", "approved", "rejected", "published", "unpublished"], default: "published" },
  isPublished: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Courses = mongoose.model("Courses", schema);
