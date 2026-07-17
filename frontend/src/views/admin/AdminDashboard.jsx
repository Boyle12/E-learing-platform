import { useEffect, useState } from "react";
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  Layers3,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import api from "../../api/axios";

const defaultStats = {
  totalUsers: 0,
  totalStudents: 0,
  totalInstructors: 0,
  totalCourses: 0,
  totalLectures: 0,
  totalEnrollments: 0,
  totalRevenue: 0,
};

const activities = [
  { activity: "New instructor submitted for approval", actor: "Priya Sharma", time: "8 minutes ago", status: "Pending" },
  { activity: "Course published", actor: "David Wilson", time: "32 minutes ago", status: "Completed" },
  { activity: "Payment received", actor: "Aarav Mehta", time: "1 hour ago", status: "Completed" },
  { activity: "Student account suspended", actor: "Admin", time: "2 hours ago", status: "Updated" },
];

const ChartPlaceholder = ({ title, subtitle }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
    <div className="relative h-64 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
      <canvas
        className="absolute inset-0 h-full w-full opacity-30"
        aria-label={`${title} chart placeholder`}
        role="img"
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Chart canvas</p>
          <p className="mt-1 text-xs text-slate-500">Connect your chart library and API series here.</p>
        </div>
      </div>
      <div className="absolute inset-x-5 bottom-5 flex justify-between text-xs font-medium text-slate-400">
        <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
      </div>
    </div>
  </section>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/api/admin/stats");
        setStats((currentStats) => ({ ...currentStats, ...(data.stats || {}) }));
      } catch {
        // The zero-value cards remain useful until the dashboard API is available.
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const metrics = [
    { label: "Total Users", value: stats.totalUsers, trend: 12.5, icon: Users, iconClass: "bg-indigo-50 text-indigo-600" },
    { label: "Students", value: stats.totalStudents, trend: 8.2, icon: GraduationCap, iconClass: "bg-sky-50 text-sky-600" },
    { label: "Instructors", value: stats.totalInstructors, trend: -2.4, icon: Users, iconClass: "bg-violet-50 text-violet-600" },
    { label: "Courses", value: stats.totalCourses, trend: 5.7, icon: BookOpen, iconClass: "bg-amber-50 text-amber-600" },
    { label: "Enrollments", value: stats.totalEnrollments, trend: 16.8, icon: Layers3, iconClass: "bg-emerald-50 text-emerald-600" },
    {
      label: "Revenue",
      value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.totalRevenue),
      trend: 10.1,
      icon: CreditCard,
      iconClass: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="admin-dashboard space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Control center</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Monitor your learning platform’s people, content, and business performance.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, trend, icon: Icon, iconClass }) => {
          const isPositive = trend >= 0;
          return (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-slate-200" /> : value}
                  </p>
                </div>
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${iconClass}`}>
                  <Icon size={21} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {isPositive ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
                  {Math.abs(trend)}%
                </span>
                <span className="text-slate-400">vs. last month</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartPlaceholder title="User Growth" subtitle="New learners and instructors over time" />
        <ChartPlaceholder title="Sales Overview" subtitle="Revenue performance by month" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Recent system activity</h2>
          <p className="mt-1 text-sm text-slate-500">The latest platform events and administrative changes.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Activity", "Performed by", "Time", "Status"].map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((item) => (
                <tr key={`${item.activity}-${item.time}`} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-800">{item.activity}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{item.actor}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{item.time}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
