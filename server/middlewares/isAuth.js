import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token)
      return res.status(401).json({
        message: "Authentication required",
      });

    const decodedData = jwt.verify(token, process.env.Jwt_Sec);

    req.user = await User.findById(decodedData.userId);
    req.userRole = decodedData.role;
    req.userEmail = decodedData.email;

    if (!req.user)
      return res.status(401).json({
        message: "Invalid token user",
      });

    if (req.user.status === "suspended")
      return res.status(403).json({
        message: "This account has been suspended. Please contact support.",
      });

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({
        message: "You are not admin",
      });

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const isAdminOrInstructor = (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "instructor")
      return res.status(403).json({
        message: "You are not authorized",
      });

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
