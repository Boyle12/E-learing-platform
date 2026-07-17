import express from "express";
import { isAdmin, isAdminOrInstructor, isAuth } from "../middlewares/isAuth.js";
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUser,
  getInstructorLectures,
  getInstructorOverview,
  updateCourse,
  updateLecture,
  updateRole,
} from "../controllers/admin.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/new", isAuth, isAdminOrInstructor, uploadFiles, createCourse);
router.put("/course/:id", isAuth, isAdminOrInstructor, uploadFiles, updateCourse);
router.post("/course/:id", isAuth, isAdminOrInstructor, uploadFiles, addLectures);
router.delete("/course/:id", isAuth, isAdminOrInstructor, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdminOrInstructor, deleteLecture);
router.put("/lecture/:id", isAuth, isAdminOrInstructor, uploadFiles, updateLecture);
router.get("/instructor/overview", isAuth, isAdminOrInstructor, getInstructorOverview);
router.get("/instructor/courses/:courseId/lectures", isAuth, isAdminOrInstructor, getInstructorLectures);
router.get("/stats", isAuth, isAdmin, getAllStats);
router.put("/user/:id", isAuth, isAdmin, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);

export default router;
