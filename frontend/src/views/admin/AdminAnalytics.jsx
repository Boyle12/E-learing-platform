import { useEffect, useState } from "react";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const SeriesCard = ({ title, icon: Icon, data = [], emptyText }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={19}/></span><div><h2 className="font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-500">Platform trend data</p></div></div>
    <div className="mt-5 space-y-3">{data.length ? data.map((item) => <div key={item.label} className="flex items-center gap-3"><span className="w-16 text-xs font-semibold text-slate-500">{item.label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><i className="block h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, Math.max(8, item.value))}%` }}/></div><strong className="w-12 text-right text-sm text-slate-700">{item.value}</strong></div>) : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">{emptyText}</p>}</div>
  </section>
);

const AdminAnalytics = () => {
  const [data, setData] = useState({ stats: {}, charts: {} });
  useEffect(() => { api.get("/api/admin/analytics").then(({ data: response }) => setData(response)).catch(() => toast.error("Unable to load analytics")); }, []);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Platform intelligence</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Analytics</h1><p className="mt-2 text-sm text-slate-600">Track revenue, learner growth, and course category distribution.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Revenue", `₹${data.stats.totalRevenue || 0}`], ["Enrollments", data.stats.totalEnrollments || 0], ["Students", data.stats.totalStudents || 0], ["Courses", data.stats.totalCourses || 0]].map(([label,value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-2"><SeriesCard title="Monthly Revenue" icon={TrendingUp} data={data.charts.revenue} emptyText="Revenue data will appear after successful payments."/><SeriesCard title="Student Growth" icon={BarChart3} data={data.charts.userGrowth} emptyText="Student growth data will appear after registrations."/><SeriesCard title="Course Categories" icon={PieChart} data={data.charts.categoryDistribution} emptyText="Category distribution will appear after courses are created."/></div></div>;
};

export default AdminAnalytics;
