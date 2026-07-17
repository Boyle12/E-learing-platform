import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import toast from "react-hot-toast";
import AdminDataTable from "../../components/admin/AdminDataTable";
import api from "../../api/axios";

const definitions = {
  users: { title: "Users", endpoint: "/api/admin/users", key: "users" },
  students: { title: "Students", endpoint: "/api/admin/students", key: "users" },
  instructors: { title: "Instructors", endpoint: "/api/admin/instructors", key: "users" },
  lectures: { title: "Lectures", endpoint: "/api/admin/lectures", key: "lectures" },
  categories: { title: "Categories", endpoint: "/api/admin/categories", key: "categories" },
  enrollments: { title: "Enrollments", endpoint: "/api/admin/enrollments", key: "enrollments" },
  payments: { title: "Payments", endpoint: "/api/admin/payments", key: "payments" },
  reviews: { title: "Reviews", endpoint: "/api/admin/reviews", key: "reviews" },
};

const AdminManagementPage = ({ type }) => {
  const definition = definitions[type];
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const load = useCallback(async (page = 1, searchValue = search) => {
    setLoading(true);
    try {
      const { data } = await api.get(definition.endpoint, { params: { page, limit: 10, search: searchValue } });
      setRecords(data[definition.key] || []);
      setPageCount(data.pagination?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || `Unable to load ${definition.title.toLowerCase()}`);
    } finally { setLoading(false); }
  }, [definition, search]);

  useEffect(() => { load(1, ""); }, [definition.endpoint]);

  const updateUser = async (id, updates) => {
    await api.put(`/api/admin/users/${id}`, updates);
    toast.success("Account updated");
    load();
  };
  const remove = async (id) => {
    const endpoint = type === "reviews" ? `/api/admin/reviews/${id}` : type === "categories" ? `/api/admin/categories/${id}` : type === "lectures" ? `/api/admin/lectures/${id}` : `/api/admin/users/${id}`;
    await api.delete(endpoint); toast.success("Record deleted"); load();
  };
  const addCategory = async (event) => {
    event.preventDefault(); if (!categoryName.trim()) return;
    try { await api.post("/api/admin/categories", { name: categoryName }); setCategoryName(""); toast.success("Category created"); load(); } catch (error) { toast.error(error.response?.data?.message || "Unable to create category"); }
  };

  const columns = useMemo(() => {
    const actions = { header: "Actions", id: "actions", cell: (_, row, { confirm }) => <div className="flex gap-2"><button className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700" onClick={() => confirm({ title: "Confirm action", description: "This administrative update will take effect immediately.", confirmLabel: "Continue", onConfirm: () => type === "instructors" ? updateUser(row._id, { status: "active" }) : updateUser(row._id, { status: row.status === "suspended" ? "active" : "suspended" }) })}>{type === "instructors" ? "Approve" : row.status === "suspended" ? "Activate" : "Suspend"}</button><button className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700" onClick={() => confirm({ title: "Delete record?", description: "This action cannot be undone.", confirmLabel: "Delete", variant: "danger", onConfirm: () => remove(row._id) })}>Delete</button></div> };
    if (type === "users" || type === "students" || type === "instructors") return [{ header: "Name", accessor: "name" }, { header: "Email", accessor: "email" }, { header: "Role", accessor: "role" }, { header: "Status", accessor: "status" }, actions];
    if (type === "categories") return [{ header: "Category", accessor: "name" }, { header: "Description", accessor: "description" }, { header: "Created", accessor: (row) => new Date(row.createdAt).toLocaleDateString() }, { header: "Actions", id: "actions", cell: (_, row, { confirm }) => <button className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700" onClick={() => confirm({ title: "Delete category?", description: "Courses using this text category are not deleted.", confirmLabel: "Delete", variant: "danger", onConfirm: () => remove(row._id) })}>Delete</button> }];
    if (type === "enrollments") return [{ header: "Student", accessor: (row) => row.student?.name || "—" }, { header: "Course", accessor: (row) => row.course?.title || "—" }, { header: "Instructor", accessor: (row) => row.course?.createdBy || "—" }, { header: "Enrolled", accessor: (row) => new Date(row.createdAt).toLocaleDateString() }];
    if (type === "lectures") return [{ header: "Lecture", accessor: "title" }, { header: "Course", accessor: (row) => row.course?.title || "—" }, { header: "Instructor", accessor: (row) => row.course?.createdBy || "—" }, { header: "Duration", accessor: (row) => `${row.duration || 0} min` }, { header: "Actions", id: "actions", cell: (_, row, { confirm }) => <button className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700" onClick={() => confirm({ title: "Delete lecture?", description: "This lecture will be permanently removed.", confirmLabel: "Delete", variant: "danger", onConfirm: () => remove(row._id) })}>Delete</button> }];
    if (type === "payments") return [{ header: "Student", accessor: (row) => row.user?.name || "—" }, { header: "Course", accessor: (row) => row.course?.title || "—" }, { header: "Amount", accessor: (row) => `₹${row.amount || 0}` }, { header: "Status", accessor: "status" }, { header: "Date", accessor: (row) => new Date(row.createdAt).toLocaleDateString() }];
    return [{ header: "Student", accessor: (row) => row.student?.name || "—" }, { header: "Course", accessor: (row) => row.course?.title || "—" }, { header: "Rating", accessor: "rating" }, { header: "Review", accessor: "review" }, { header: "Actions", id: "actions", cell: (_, row, { confirm }) => <button className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700" onClick={() => confirm({ title: "Delete review?", description: "The review will be permanently removed.", confirmLabel: "Delete", variant: "danger", onConfirm: () => remove(row._id) })}>Delete</button> }];
  }, [type, load]);

  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Admin management</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{definition.title}</h1></div>{type === "categories" && <form onSubmit={addCategory} className="flex max-w-md gap-2"><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category name" className="flex-1 rounded-xl border border-slate-200 px-3 py-2"/><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"><Plus size={16}/>Add</button></form>}<AdminDataTable data={records} columns={columns} loading={loading} pageCount={pageCount} onPageChange={load} onSearch={(value) => { setSearch(value); load(1, value); }} /></div>;
};

export const AdminReports = () => {
  const [reports, setReports] = useState(null);
  useEffect(() => { api.get("/api/admin/reports").then(({ data }) => setReports(data.reports)).catch(() => toast.error("Unable to load reports")); }, []);
  const exportCsv = () => { if (!reports) return; const csv = Object.entries(reports).map(([key, value]) => `${key},${value}`).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = "platform-report.csv"; link.click(); URL.revokeObjectURL(url); };
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Business intelligence</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Reports</h1></div><button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"><Download size={16}/>Export CSV</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(reports || {}).map(([key,value]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="capitalize text-sm text-slate-500">{key}</p><p className="mt-2 text-2xl font-bold text-slate-900">{key === "revenue" ? `₹${value}` : value}</p></div>)}</div></div>;
};

export default AdminManagementPage;
