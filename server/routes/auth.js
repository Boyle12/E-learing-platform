import express from "express";
import {
  forgotPassword,
  loginUser,
  myProfile,
  register,
  resetPassword,
  verifyUser,
  updateProfile,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.get("/profile", isAuth, myProfile);
router.put("/profile", isAuth, updateProfile);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

export default router;
