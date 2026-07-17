import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  approveInstructor,
  createCategory,
  createCourse,
  deleteCourse,
  deleteLecture,
  deleteCategory,
  deleteReview,
  deleteUser,
  getDashboardStats,
  getCategories,
  getCourses,
  getEnrollments,
  getInstructors,
  getLectures,
  getPaymentRecords,
  getReports,
  getReviews,
  getStudents,
  getUsers,
  suspendStudent,
  updateCourse,
  updateCategory,
  updateGlobalSettings,
  updateUser,
} from "../controllers/adminController.js";

const router = express.Router();

// Every admin endpoint requires an authenticated user with the Admin role.
router.use(isAuth, isAdmin);

router.get("/stats", getDashboardStats);
router.get("/analytics", getDashboardStats);

router.route("/users").get(getUsers);
router.route("/users/:id").put(updateUser).delete(deleteUser);

router.route("/students").get(getStudents);
router.put("/students/:id/suspend", suspendStudent);

router.route("/instructors").get(getInstructors);
router.put("/instructors/:id/approve", approveInstructor);

router.route("/courses").post(createCourse);
router.route("/courses").get(getCourses);
router.route("/courses/:id").put(updateCourse).delete(deleteCourse);
router.get("/lectures", getLectures);
router.delete("/lectures/:id", deleteLecture);

router.get("/payments", getPaymentRecords);
router.get("/enrollments", getEnrollments);
router.route("/categories").get(getCategories).post(createCategory);
router.route("/categories/:id").put(updateCategory).delete(deleteCategory);
router.get("/reviews", getReviews);
router.delete("/reviews/:id", deleteReview);
router.get("/reports", getReports);
router.put("/settings", updateGlobalSettings);

export default router;
