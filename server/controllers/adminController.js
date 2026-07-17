import mongoose from "mongoose";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Category } from "../models/Category.js";
import { Enrollment } from "../models/Enrollment.js";
import { Lecture } from "../models/Lecture.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";

const USER_ROLES = ["student", "instructor", "admin"];
const USER_STATUSES = ["active", "suspended", "pending", "rejected"];

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = ({ page = 1, limit = 20 }) => {
  const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

const getUserFilter = ({ search, role, status }, forcedRole) => {
  const filter = {};
  const requestedRole = forcedRole || role;

  if (requestedRole && USER_ROLES.includes(requestedRole)) {
    filter.role = requestedRole;
  }

  if (status && USER_STATUSES.includes(status)) {
    filter.status = status;
  }

  if (search?.trim()) {
    const searchExpression = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: searchExpression }, { email: searchExpression }];
  }

  return filter;
};

const sendPaginatedUsers = async (req, res, forcedRole) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = getUserFilter(req.query, forcedRole);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

const maskSecret = (value) => (value ? "********" : undefined);

const serializeSettings = (settings = {}) => ({
  smtp: settings.smtp
    ? {
        host: settings.smtp.host,
        port: settings.smtp.port,
        user: settings.smtp.user,
        password: maskSecret(settings.smtp.password),
      }
    : undefined,
  razorpay: settings.razorpay
    ? {
        keyId: settings.razorpay.keyId,
        keySecret: maskSecret(settings.razorpay.keySecret),
      }
    : undefined,
  maintenanceMode: Boolean(settings.maintenanceMode),
  updatedAt: settings.updatedAt,
});

/**
 * Fetches all dashboard counters with one aggregation command. The lookup
 * collections follow Mongoose's default pluralized names.
 */
export const getDashboardStats = TryCatch(async (_req, res) => {
  const [dashboard = {}] = await User.aggregate([
    { $limit: 1 },
    {
      $facet: {
        users: [
          {
            $lookup: {
              from: "users",
              pipeline: [
                {
                  $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalStudents: {
                      $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] },
                    },
                    totalInstructors: {
                      $sum: { $cond: [{ $eq: ["$role", "instructor"] }, 1, 0] },
                    },
                  },
                },
              ],
              as: "result",
            },
          },
          { $unwind: { path: "$result", preserveNullAndEmptyArrays: true } },
          { $replaceRoot: { newRoot: { $ifNull: ["$result", {}] } } },
        ],
        courses: [
          {
            $lookup: {
              from: "courses",
              pipeline: [{ $count: "totalCourses" }],
              as: "result",
            },
          },
          { $unwind: { path: "$result", preserveNullAndEmptyArrays: true } },
          { $replaceRoot: { newRoot: { $ifNull: ["$result", {}] } } },
        ],
        lectures: [
          {
            $lookup: {
              from: "lectures",
              pipeline: [{ $count: "totalLectures" }],
              as: "result",
            },
          },
          { $unwind: { path: "$result", preserveNullAndEmptyArrays: true } },
          { $replaceRoot: { newRoot: { $ifNull: ["$result", {}] } } },
        ],
        enrollments: [
          {
            $lookup: {
              from: "enrollments",
              pipeline: [{ $count: "totalEnrollments" }],
              as: "result",
            },
          },
          { $unwind: { path: "$result", preserveNullAndEmptyArrays: true } },
          { $replaceRoot: { newRoot: { $ifNull: ["$result", {}] } } },
        ],
        revenue: [
          {
            $lookup: {
              from: "payments",
              pipeline: [
                {
                  $group: {
                    _id: null,
                    totalRevenue: { $sum: { $ifNull: ["$amount", 0] } },
                  },
                },
              ],
              as: "result",
            },
          },
          { $unwind: { path: "$result", preserveNullAndEmptyArrays: true } },
          { $replaceRoot: { newRoot: { $ifNull: ["$result", {}] } } },
        ],
      },
    },
  ]);

  const stats = {
    totalUsers: dashboard.users?.[0]?.totalUsers ?? 0,
    totalStudents: dashboard.users?.[0]?.totalStudents ?? 0,
    totalInstructors: dashboard.users?.[0]?.totalInstructors ?? 0,
    totalCourses: dashboard.courses?.[0]?.totalCourses ?? 0,
    totalLectures: dashboard.lectures?.[0]?.totalLectures ?? 0,
    totalEnrollments: dashboard.enrollments?.[0]?.totalEnrollments ?? 0,
    totalRevenue: dashboard.revenue?.[0]?.totalRevenue ?? 0,
  };

  const [publishedCourses, pendingCourses, recentRegistrations, recentCourses, categoryDistribution, monthlyRevenue, studentGrowth] = await Promise.all([
    Courses.countDocuments({ isPublished: true }),
    Courses.countDocuments({ status: "pending" }),
    User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(5).lean(),
    Courses.find().select("title image createdBy status createdAt").sort({ createdAt: -1 }).limit(5).lean(),
    Courses.aggregate([{ $group: { _id: "$category", value: { $sum: 1 } } }, { $project: { _id: 0, label: "$_id", value: 1 } }]),
    Payment.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, value: { $sum: "$amount" } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, label: "$_id", value: 1 } }]),
    User.aggregate([{ $match: { role: "student" } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, value: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, label: "$_id", value: 1 } }]),
  ]);

  stats.publishedCourses = publishedCourses;
  stats.pendingCourses = pendingCourses;

  res.status(200).json({
    stats,
    charts: {
      userGrowth: studentGrowth,
      revenue: monthlyRevenue,
      categoryDistribution,
    },
    recentRegistrations,
    recentCourses,
  });
});

export const getUsers = TryCatch(async (req, res) => sendPaginatedUsers(req, res));

export const getStudents = TryCatch(async (req, res) =>
  sendPaginatedUsers(req, res, "student")
);

export const getInstructors = TryCatch(async (req, res) =>
  sendPaginatedUsers(req, res, "instructor")
);

export const updateUser = TryCatch(async (req, res) => {
  const { name, email, role, status } = req.body;

  if (role !== undefined && !USER_ROLES.includes(role)) {
    return res.status(400).json({ message: "Invalid user role" });
  }

  if (status !== undefined && !USER_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid user status" });
  }

  if (req.params.id === req.user._id.toString() && role && role !== "admin") {
    return res.status(400).json({ message: "You cannot remove your own admin role" });
  }

  const updates = Object.fromEntries(
    Object.entries({ name, email, role, status }).filter(([, value]) => value !== undefined)
  );

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No valid user fields supplied" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
    // Status is supported for the portal even while legacy User documents lack it.
    strict: false,
  }).select("-password -resetPasswordExpire");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ message: "User updated", user });
});

export const deleteUser = TryCatch(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ message: "User deleted" });
});

export const suspendStudent = TryCatch(async (req, res) => {
  const student = await User.findOneAndUpdate(
    { _id: req.params.id, role: "student" },
    { status: "suspended" },
    { new: true, runValidators: true, strict: false }
  ).select("-password -resetPasswordExpire");

  if (!student) return res.status(404).json({ message: "Student not found" });

  res.status(200).json({ message: "Student suspended", student });
});

export const approveInstructor = TryCatch(async (req, res) => {
  const instructor = await User.findOneAndUpdate(
    { _id: req.params.id, role: "instructor" },
    { status: "active", isApproved: true },
    { new: true, runValidators: true, strict: false }
  ).select("-password -resetPasswordExpire");

  if (!instructor) return res.status(404).json({ message: "Instructor not found" });

  res.status(200).json({ message: "Instructor approved", instructor });
});

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, image, price, duration, category, videoUrl } = req.body;

  if (!title || !description || !image || price === undefined || !duration || !category) {
    return res.status(400).json({ message: "All required course fields must be provided" });
  }

  const course = await Courses.create({
    title,
    description,
    image,
    price: Number(price),
    duration: Number(duration),
    category,
    videoUrl: videoUrl || "",
    createdBy: req.user.name || "Admin",
  });

  res.status(201).json({ message: "Course created", course });
});

export const updateCourse = TryCatch(async (req, res) => {
  const allowedFields = ["title", "description", "image", "price", "duration", "category", "videoUrl", "status", "isPublished"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
  );

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No valid course fields supplied" });
  }

  const course = await Courses.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!course) return res.status(404).json({ message: "Course not found" });

  res.status(200).json({ message: "Course updated", course });
});

export const getCourses = TryCatch(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.instructor) filter.createdBy = new RegExp(escapeRegex(req.query.instructor), "i");
  if (req.query.search?.trim()) filter.$or = ["title", "description", "createdBy"].map((field) => ({ [field]: new RegExp(escapeRegex(req.query.search.trim()), "i") }));
  const [courses, total] = await Promise.all([Courses.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Courses.countDocuments(filter)]);
  const ids = courses.map((course) => course._id);
  const enrollmentCounts = await Enrollment.aggregate([{ $match: { course: { $in: ids } } }, { $group: { _id: "$course", count: { $sum: 1 } } }]);
  const counts = new Map(enrollmentCounts.map((item) => [item._id.toString(), item.count]));
  res.json({ courses: courses.map((course) => ({ ...course, enrollmentCount: counts.get(course._id.toString()) || 0 })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getLectures = TryCatch(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  if (req.query.search?.trim()) {
    const expression = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [{ title: expression }, { description: expression }];
  }
  const [lectures, total] = await Promise.all([
    Lecture.find(filter).populate("course", "title createdBy").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Lecture.countDocuments(filter),
  ]);
  res.json({ lectures, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findByIdAndDelete(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });
  res.json({ message: "Lecture deleted" });
});

export const getCategories = TryCatch(async (_req, res) => res.json({ categories: await Category.find().sort({ name: 1 }) }));
export const createCategory = TryCatch(async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ message: "Category name is required" });
  const category = await Category.create({ name: req.body.name.trim(), description: req.body.description || "", thumbnail: req.body.thumbnail || "" });
  res.status(201).json({ message: "Category created", category });
});
export const updateCategory = TryCatch(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category updated", category });
});
export const deleteCategory = TryCatch(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category deleted" });
});

export const getEnrollments = TryCatch(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  if (req.query.student) filter.student = req.query.student;
  const [enrollments, total] = await Promise.all([Enrollment.find(filter).populate("student", "name email").populate("course", "title price createdBy").sort({ createdAt: -1 }).skip(skip).limit(limit), Enrollment.countDocuments(filter)]);
  res.json({ enrollments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getReviews = TryCatch(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [reviews, total] = await Promise.all([Review.find().populate("student", "name email").populate("course", "title").sort({ createdAt: -1 }).skip(skip).limit(limit), Review.countDocuments()]);
  res.json({ reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
export const deleteReview = TryCatch(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  res.json({ message: "Review deleted" });
});

export const getReports = TryCatch(async (_req, res) => {
  const [students, instructors, courses, revenue] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "instructor" }),
    Courses.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);
  res.json({ reports: { students, instructors, courses, revenue: revenue[0]?.total || 0 } });
});

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  await Promise.all([
    Lecture.deleteMany({ course: course._id }),
    User.updateMany({}, { $pull: { subscription: course._id } }),
  ]);

  res.status(200).json({ message: "Course deleted" });
});

export const getPaymentRecords = TryCatch(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  if (req.query.search?.trim()) {
    const searchExpression = new RegExp(escapeRegex(req.query.search.trim()), "i");
    filter.$or = [
      { razorpay_order_id: searchExpression },
      { razorpay_payment_id: searchExpression },
    ];
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter).populate("user", "name email").populate("course", "title price").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments(filter),
  ]);

  res.status(200).json({
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateGlobalSettings = TryCatch(async (req, res) => {
  const { smtp, razorpay, maintenanceMode } = req.body;
  const updates = { updatedAt: new Date() };

  if (smtp !== undefined) {
    if (!smtp || typeof smtp !== "object") {
      return res.status(400).json({ message: "SMTP settings must be an object" });
    }

    const smtpFields = ["host", "port", "user", "password"];
    const suppliedSmtpFields = smtpFields.filter((field) => smtp[field] !== undefined);
    if (!suppliedSmtpFields.length) {
      return res.status(400).json({ message: "No SMTP fields supplied" });
    }
    if (smtp.port !== undefined && (!Number.isInteger(Number(smtp.port)) || Number(smtp.port) < 1)) {
      return res.status(400).json({ message: "SMTP port must be a positive integer" });
    }
    suppliedSmtpFields.forEach((field) => {
      updates[`smtp.${field}`] = field === "port" ? Number(smtp.port) : smtp[field];
    });
  }

  if (razorpay !== undefined) {
    if (!razorpay || typeof razorpay !== "object") {
      return res.status(400).json({ message: "Razorpay settings must be an object" });
    }

    const razorpayFields = ["keyId", "keySecret"];
    const suppliedRazorpayFields = razorpayFields.filter(
      (field) => razorpay[field] !== undefined
    );
    if (!suppliedRazorpayFields.length) {
      return res.status(400).json({ message: "No Razorpay fields supplied" });
    }
    suppliedRazorpayFields.forEach((field) => {
      updates[`razorpay.${field}`] = razorpay[field];
    });
  }

  if (maintenanceMode !== undefined) {
    if (typeof maintenanceMode !== "boolean") {
      return res.status(400).json({ message: "maintenanceMode must be a boolean" });
    }
    updates.maintenanceMode = maintenanceMode;
  }

  if (Object.keys(updates).length === 1) {
    return res.status(400).json({ message: "No settings supplied" });
  }

  const settingsCollection = mongoose.connection.collection("platformsettings");
  const result = await settingsCollection.findOneAndUpdate(
    { key: "global" },
    { $set: updates, $setOnInsert: { key: "global", createdAt: new Date() } },
    { upsert: true, returnDocument: "after" }
  );
  const settings = result?.value ?? result;

  res.status(200).json({
    message: "Global settings updated. Restart configured services to apply credential changes.",
    settings: serializeSettings(settings),
  });
});
