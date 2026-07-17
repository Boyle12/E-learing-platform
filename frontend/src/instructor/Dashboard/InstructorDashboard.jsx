import { useEffect, useState } from "react";
import { BookOpen, IndianRupee, Star, Upload, Users } from "lucide-react";
import Layout from "../Utils/Layout";
import api from "../../api/axios";

const InstructorDashboard = ({ user }) => {
  const [overview, setOverview] = useState({ stats: {}, students: [], progress: [] });

  useEffect(() => {
    api.get("/api/instructor/overview").then(({ data }) => setOverview(data)).catch(() => undefined);
  }, []);

  const stats = overview.stats || {};
  const metrics = [
    { label: "Courses created", value: stats.totalCourses || 0, icon: BookOpen, color: "indigo" },
    { label: "Students enrolled", value: stats.totalStudents || 0, icon: Users, color: "blue" },
    { label: "Lectures uploaded", value: stats.totalLectures || 0, icon: Upload, color: "violet" },
    { label: "Your earnings", value: `₹${Number(stats.earnings || 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "green" },
    { label: "Course rating", value: stats.rating ? `${stats.rating} / 5` : "N/A", icon: Star, color: "amber" },
  ];

  return (
    <Layout>
      <div className="instructor-dashboard">
        <header className="instructor-hero">
          <div><span className="eyebrow">Instructor workspace</span><h1>Welcome back, {user?.name || "Instructor"}</h1><p>Build exceptional courses, understand your learners, and grow your teaching business.</p></div>
          <div className="hero-actions"><a href="/instructor/courses">Create course</a><a className="secondary" href="/instructor/lectures">Manage lectures</a></div>
        </header>
        <section className="instructor-metrics">{metrics.map(({ label, value, icon: Icon, color }) => <article key={label} className={`metric-card ${color}`}><span className="metric-icon"><Icon size={20}/></span><p>{label}</p><strong>{value}</strong><small>Updated from your course activity</small></article>)}</section>
        <section className="instructor-panels">
          <article className="portal-panel"><div className="panel-heading"><div><h2>Learner progress</h2><p>Latest enrolled learners and their completion.</p></div><span>{stats.totalStudents || 0} learners</span></div><div className="progress-list">{overview.students?.slice(0, 5).map((student) => { const record = overview.progress?.find((item) => String(item.user) === String(student._id)); const value = record?.completedLectures?.length ? Math.min(100, record.completedLectures.length * 10) : 0; return <div className="learner" key={student._id}><div className="avatar">{student.name?.slice(0, 1)}</div><div className="learner-details"><div><strong>{student.name}</strong><span>{value}% complete</span></div><div className="progress-track"><i style={{ width: `${value}%` }} /></div></div></div>; })}{!overview.students?.length && <div className="empty-state">Your enrolled learners will appear here once a course receives its first enrollment.</div>}</div></article>
          <article className="portal-panel earnings-panel"><div className="panel-heading"><div><h2>Earnings overview</h2><p>Estimated from paid course enrollments.</p></div><span className="commission">20% commission</span></div><div className="earnings-total"><span>Available earnings</span><strong>₹{Number(stats.earnings || 0).toLocaleString("en-IN")}</strong></div><div className="analytics-grid"><div><span>Course sales</span><strong>₹{Number(stats.grossRevenue || 0).toLocaleString("en-IN")}</strong></div><div><span>Completion rate</span><strong>{stats.completionRate || 0}%</strong></div><div><span>Enrollments</span><strong>{stats.totalStudents || 0}</strong></div><div><span>Reviews</span><strong>—</strong></div></div></article>
        </section>
      </div>
    </Layout>
  );
};

export default InstructorDashboard;
