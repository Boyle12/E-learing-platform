import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";

const isUrl = (videoPath) =>
  typeof videoPath === "string" && /^(https?:\/\/|\/\/)/.test(videoPath);

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price, videoUrl } = req.body;

  const image = req.file;

  if (!image)
    return res.status(400).json({
      message: "Please upload a course image",
    });

  const owner = createdBy || req.user.name || "Admin";

  await Courses.create({
    title,
    description,
    category,
    createdBy: owner,
    image: image?.path,
    duration,
    price,
    videoUrl,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  });
});

export const updateCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No course with this id",
    });

  if (req.user.role === "instructor" && course.createdBy !== req.user.name)
    return res.status(403).json({
      message: "You are not allowed to edit this course",
    });

  const allowedFields = [
    "title",
    "description",
    "category",
    "price",
    "duration",
    "videoUrl",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== "") {
      course[field] = field === "price" || field === "duration"
        ? Number(req.body[field])
        : req.body[field];
    }
  });

  if (req.file) course.image = req.file.path;

  await course.save();

  res.status(200).json({
    message: "Course updated successfully",
    course,
  });
});

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  if (req.user.role === "instructor" && course.createdBy !== req.user.name)
    return res.status(403).json({
      message: "You are not allowed to edit this course",
    });

  const { title, description, duration, notesUrl, quizTitle, quizQuestions } = req.body;

  const file = req.file;
  const video = file?.path || req.body.videoUrl;

  if (!video)
    return res.status(400).json({
      message: "Please provide a lecture video file or URL",
    });

  const lecture = await Lecture.create({
    title,
    description,
    video,
    course: course._id,
    duration: Number(duration) || 0,
    order: (await Lecture.countDocuments({ course: course._id })) + 1,
    notesUrl: notesUrl || "",
    quiz: { title: quizTitle || "", questions: Number(quizQuestions) || 0 },
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const updateLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "No lecture with this id" });
  const course = await Courses.findById(lecture.course);
  if (req.user.role === "instructor" && course.createdBy !== req.user.name) return res.status(403).json({ message: "You are not allowed to edit this lecture" });
  ["title", "description", "notesUrl"].forEach((field) => { if (req.body[field] !== undefined) lecture[field] = req.body[field]; });
  if (req.body.duration !== undefined) lecture.duration = Number(req.body.duration) || 0;
  if (req.body.order !== undefined) lecture.order = Number(req.body.order) || lecture.order;
  lecture.quiz ||= {};
  if (req.body.quizTitle !== undefined) lecture.quiz.title = req.body.quizTitle;
  if (req.body.quizQuestions !== undefined) lecture.quiz.questions = Number(req.body.quizQuestions) || 0;
  if (req.file) lecture.video = req.file.path;
  else if (req.body.videoUrl) lecture.video = req.body.videoUrl;
  await lecture.save();
  res.json({ message: "Lecture updated", lecture });
});

export const getInstructorOverview = TryCatch(async (req, res) => {
  const courses = await Courses.find({ createdBy: req.user.name }).lean();
  const courseIds = courses.map((course) => course._id);
  const [lectures, students, progress] = await Promise.all([
    Lecture.find({ course: { $in: courseIds } }).lean(),
    User.find({ role: "student", subscription: { $in: courseIds } }).select("name email subscription").lean(),
    Progress.find({ course: { $in: courseIds } }).lean(),
  ]);
  const lectureCountByCourse = lectures.reduce((counts, lecture) => ({ ...counts, [lecture.course]: (counts[lecture.course] || 0) + 1 }), {});
  const completionRate = progress.length ? Math.round(progress.reduce((sum, item) => sum + ((item.completedLectures.length / (lectureCountByCourse[item.course] || 1)) * 100), 0) / progress.length) : 0;
  const revenue = students.reduce((sum, student) => sum + courses.filter((course) => student.subscription.some((id) => id.toString() === course._id.toString())).reduce((courseSum, course) => courseSum + Number(course.price || 0), 0), 0);
  res.json({ stats: { totalCourses: courses.length, totalStudents: students.length, totalLectures: lectures.length, grossRevenue: revenue, commissionRate: 20, earnings: revenue * 0.8, rating: null, completionRate }, courses, students, progress });
});

export const getInstructorLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.courseId);
  if (!course || course.createdBy !== req.user.name) return res.status(404).json({ message: "Course not found" });
  const lectures = await Lecture.find({ course: course._id }).sort({ order: 1, createdAt: 1 });
  res.json({ lectures });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture)
    return res.status(404).json({
      message: "No lecture with this id",
    });

  const course = await Courses.findById(lecture.course);

  if (req.user.role === "instructor" && course.createdBy !== req.user.name)
    return res.status(403).json({
      message: "You are not allowed to delete this lecture",
    });

  if (lecture.video && !isUrl(lecture.video)) {
    rm(lecture.video, () => {
      console.log("Video deleted");
    });
  }

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No course with this id",
    });

  if (req.user.role === "instructor" && course.createdBy !== req.user.name)
    return res.status(403).json({
      message: "You are not allowed to delete this course",
    });

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.video && !isUrl(lecture.video)) {
        await unlinkAsync(lecture.video);
      }
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  if (req.user.mainrole !== "superadmin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });

  const user = await User.findById(req.params.id);
  const { role } = req.body;
  const validRoles = ["user", "admin", "instructor"];

  if (!validRoles.includes(role))
    return res.status(400).json({
      message: "Invalid role",
    });

  user.role = role;
  await user.save();

  res.status(200).json({
    message: `Role updated to ${role}`,
  });
});
