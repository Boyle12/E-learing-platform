import express from "express";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./database/db.js";
import Razorpay from "razorpay";
import cors from "cors";
import { uploadDirectory } from "./middlewares/multer.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, ".env") });

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const app = express();
const requestedPort = Number(process.env.PORT || 5000);
const frontendOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = [
  frontendOrigin.replace(/\/$/, ""), // Remove trailing slash if present
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://e-learing-platform-git-main-boyle12s-projects.vercel.app",
  "https://e-learing-platform.vercel.app"
];

// using middlewares
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Remove trailing slash from origin just in case
      const normalizedOrigin = origin ? origin.replace(/\/$/, "") : origin;
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  })
);

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static(uploadDirectory));

// importing routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import adminPortalRoutes from "./routes/adminRoute.js";

// using routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api/admin", adminPortalRoutes);

const startServer = (portToUse) => {
  const server = app.listen(portToUse, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${portToUse}`);
    connectDb();
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = portToUse + 1;
      console.warn(`Port ${portToUse} is busy. Trying ${fallbackPort}...`);
      startServer(fallbackPort);
      return;
    }

    console.error("Server failed to start:", error);
    process.exit(1);
  });
};

startServer(requestedPort);
