import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: "" },
  thumbnail: { type: String, default: "" },
}, { timestamps: true });

export const Category = mongoose.model("Category", schema);
