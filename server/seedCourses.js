import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import { Courses } from "./models/Courses.js";
import { Lecture } from "./models/Lecture.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const courses = [
  {
    title: "C Programming Essentials",
    description:
      "Learn the fundamentals of C programming, memory management, and problem solving for beginners and aspiring system developers.",
    category: "Programming",
    createdBy: "Code Academy",
    price: 499,
    duration: 14,
    videoUrl: "https://www.youtube.com/watch?v=KJgsM7JH0PU",
  },
  {
    title: "C++ Programming Mastery",
    description:
      "Master object-oriented programming, templates, STL, and advanced C++ concepts for software engineering and competitive programming.",
    category: "Programming",
    createdBy: "Code Academy",
    price: 699,
    duration: 21,
    videoUrl: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
  },
  {
    title: "Java Programming Fundamentals",
    description:
      "Build a strong base in Java with classes, inheritance, exception handling, collections, and real-world project practice.",
    category: "Programming",
    createdBy: "Java Hub",
    price: 599,
    duration: 18,
    videoUrl: "https://www.youtube.com/watch?v=eIrMbAQSU34",
  },
  {
    title: "Python for Automation",
    description:
      "Automate everyday tasks, scrape data, and build scripts using Python in a practical, project-driven course.",
    category: "Scripting",
    createdBy: "Python Lab",
    price: 549,
    duration: 16,
    videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
  },
  {
    title: "Data Structures and Algorithms",
    description:
      "Understand arrays, linked lists, trees, graphs, heaps, hashing, and dynamic programming with interview-focused examples.",
    category: "Computer Science",
    createdBy: "Algo School",
    price: 799,
    duration: 24,
    videoUrl: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
  },
  {
    title: "Web Development with HTML, CSS, and JavaScript",
    description:
      "Create responsive and interactive websites from scratch using the core building blocks of modern web design and development.",
    category: "Web Development",
    createdBy: "WebCraft Studio",
    price: 649,
    duration: 20,
    videoUrl: "https://www.youtube.com/watch?v=G3e-cpL7ofc",
  },
  {
    title: "React.js for Modern Frontends",
    description:
      "Learn component-based UI development with React, hooks, routing, state management, and build-ready frontend skills.",
    category: "Frontend",
    createdBy: "UI Masters",
    price: 749,
    duration: 22,
    videoUrl: "https://www.youtube.com/watch?v=4UZrsTqkcW4",
  },
  {
    title: "Node.js Backend Development",
    description:
      "Build scalable backend services with Node.js, REST APIs, authentication, and database integration.",
    category: "Backend",
    createdBy: "Backend Academy",
    price: 749,
    duration: 22,
    videoUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
  },
  {
    title: "MongoDB Database Design",
    description:
      "Understand document databases, indexing, aggregation, schema design, and real-world MongoDB application patterns.",
    category: "Database",
    createdBy: "Data Forge",
    price: 699,
    duration: 18,
    videoUrl: "https://www.youtube.com/watch?v=ofme2o29ngU",
  },
  {
    title: "SQL and Database Fundamentals",
    description:
      "Master SQL queries, joins, constraints, normalization, and database operations for application development.",
    category: "Database",
    createdBy: "Data Forge",
    price: 599,
    duration: 16,
    videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
  },
  {
    title: "Git and GitHub for Developers",
    description:
      "Learn version control, branching, collaboration, pull requests, and professional developer workflows with Git and GitHub.",
    category: "Tooling",
    createdBy: "DevOps Hub",
    price: 399,
    duration: 10,
    videoUrl: "https://www.youtube.com/watch?v=8Dd7KRpKeaE",
  },
  {
    title: "Docker for Beginners",
    description:
      "Containerize applications, understand images and containers, and simplify your deployment workflow with Docker.",
    category: "DevOps",
    createdBy: "DevOps Hub",
    price: 649,
    duration: 15,
    videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE",
  },
  {
    title: "Cybersecurity Essentials",
    description:
      "Explore common threats, secure coding basics, authentication, encryption, and practical cybersecurity hygiene.",
    category: "Security",
    createdBy: "Secure Minds",
    price: 799,
    duration: 20,
    videoUrl: "https://www.youtube.com/watch?v=4K_ZUOHJmgg",
  },
  {
    title: "AI and Machine Learning Basics",
    description:
      "Get introduced to machine learning concepts, model training, evaluation, and practical AI project workflows.",
    category: "AI",
    createdBy: "AI Labs",
    price: 899,
    duration: 25,
    videoUrl: "https://www.youtube.com/watch?v=Jp3HLd2O4nM",
  },
  {
    title: "Cloud Computing Basics",
    description:
      "Understand cloud concepts, virtual machines, storage, networking, and how modern applications are deployed in the cloud.",
    category: "Cloud",
    createdBy: "Cloud Academy",
    price: 749,
    duration: 19,
    videoUrl: "https://www.youtube.com/watch?v=2LaAJq1lB1Q",
  },
];

const createSvgImage = (title, colorA, colorB) => `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" rx="40" fill="${colorA}"/>
  <rect x="40" y="40" width="720" height="520" rx="32" fill="${colorB}"/>
  <circle cx="400" cy="240" r="140" fill="rgba(255,255,255,0.18)"/>
  <text x="400" y="270" font-family="Arial, sans-serif" font-size="40" font-weight="700" text-anchor="middle" fill="#ffffff">${title}</text>
  <text x="400" y="330" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#f7f7f7">Tech Learning Course</text>
</svg>`;

const seedCourses = async () => {
  try {
    await connectDb();

    for (const [index, course] of courses.entries()) {
      const fileName = `course-${index + 1}.svg`;
      const imagePath = path.join(uploadsDir, fileName);
      const svgContent = createSvgImage(course.title, `#${(index * 97 + 55).toString(16).padStart(6, "0")}`, `#${(index * 53 + 121).toString(16).padStart(6, "0")}`);
      fs.writeFileSync(imagePath, svgContent);

      const relativeImagePath = `uploads/${fileName}`;

      await Courses.updateOne(
        { title: course.title },
        {
          $set: {
            title: course.title,
            description: course.description,
            category: course.category,
            createdBy: course.createdBy,
            price: course.price,
            duration: course.duration,
            image: relativeImagePath,
            videoUrl: course.videoUrl,
          },
        },
        { upsert: true }
      );

      const savedCourse = await Courses.findOne({ title: course.title });
      if (savedCourse) {
        const lectureTitle = `Introduction to ${course.title}`;
        await Lecture.updateOne(
          { course: savedCourse._id, title: lectureTitle },
          {
            $setOnInsert: {
              title: lectureTitle,
              description: `Get started with ${course.title} and explore the course highlights.`,
              video: course.videoUrl,
              course: savedCourse._id,
            },
          },
          { upsert: true }
        );
      }
    }

    console.log(`Seeded ${courses.length} courses successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedCourses();
