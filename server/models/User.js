import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    mainrole: {
      type: String,
      enum: ["user", "superadmin"],
      default: "user",
    },
    subscription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
      },
    ],
    resetPasswordExpire: Date,
    status: { type: String, enum: ["active", "suspended", "pending", "rejected"], default: "active" },
    avatar: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", schema);
