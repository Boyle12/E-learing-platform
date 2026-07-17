import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const mongoUri = process.env.DB || "mongodb://127.0.0.1:27017/elearning";
    await mongoose.connect(mongoUri);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};
