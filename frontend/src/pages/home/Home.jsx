import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";

const highlights = [
  {
    title: "Flexible Learning",
    description: "Study at your own pace with structured lessons and progress tracking.",
  },
  {
    title: "Expert Courses",
    description: "Explore practical topics in technology, design, and business growth.",
  },
  {
    title: "Career Ready",
    description: "Build real-world skills through guided projects and hands-on practice.",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-badge">New • Modern Learning Experience</span>
          <h1>Learn smarter with a platform built for momentum.</h1>
          <p>
            Discover high-impact courses, track your growth, and unlock a more
            confident future with every lesson.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate("/courses")} className="primary-btn">
              Explore Courses
            </button>
            <button onClick={() => navigate("/about")} className="secondary-btn">
              Learn More
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <strong>100+</strong>
              <span>Lessons</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>Student Rating</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">Popular this month</div>
          <h3>Master modern tech skills</h3>
          <ul>
            <li>Structured learning paths</li>
            <li>Hands-on practice and projects</li>
            <li>Progress insights for every learner</li>
          </ul>
          <button onClick={() => navigate("/courses")}>Start Learning</button>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <p className="section-label">Why learners choose us</p>
          <h2>Everything you need to stay inspired and on track.</h2>
        </div>
        <div className="feature-grid">
          {highlights.map((item) => (
            <div className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </div>
  );
};

export default Home;
