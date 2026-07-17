import { useMemo, useState } from "react";
import { Edit3, ImagePlus, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { CourseData } from "../../context/CourseContext";

const categories = ["Web Development", "App Development", "Game Development", "Data Science", "Artificial Intelligence"];
const emptyCourse = { title: "", description: "", category: "", price: "", duration: "", videoUrl: "" };

const CourseManager = ({ user, mode = "admin" }) => {
  const { courses, fetchCourses } = CourseData();
  const [form, setForm] = useState(emptyCourse);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [search, setSearch] = useState("");

  const visibleCourses = useMemo(() => {
    const ownedCourses = mode === "instructor"
      ? courses.filter((course) => course.createdBy === user?.name)
      : courses;
    const query = search.trim().toLowerCase();
    return query
      ? ownedCourses.filter((course) => `${course.title} ${course.category} ${course.createdBy}`.toLowerCase().includes(query))
      : ownedCourses;
  }, [courses, mode, search, user?.name]);

  const resetForm = () => {
    setForm(emptyCourse);
    setImage(null);
    setPreview("");
    setEditingCourse(null);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      price: course.price ?? "",
      duration: course.duration ?? "",
      videoUrl: course.videoUrl || "",
    });
    setImage(null);
    setPreview(course.image ? `${api.defaults.baseURL}/${course.image}` : "");
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingCourse && !image) {
      toast.error("Please select a course image");
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (image) payload.append("file", image);

    setIsSaving(true);
    try {
      const response = editingCourse
        ? await api.put(`/api/course/${editingCourse._id}`, payload)
        : await api.post("/api/course/new", payload);
      toast.success(response.data.message || "Course saved");
      await fetchCourses();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save course");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      const { data } = await api.delete(`/api/course/${courseToDelete._id}`);
      toast.success(data.message || "Course deleted");
      await fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete course");
    } finally {
      setCourseToDelete(null);
    }
  };

  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="course-manager grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-xl font-bold text-slate-900">{mode === "admin" ? "Course Catalog" : "My Courses"}</h1><p className="mt-1 text-sm text-slate-500">Create, update, and organize your learning content.</p></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 sm:w-56" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50"><tr>{["Course", "Category", "Price", "Owner", "Actions"].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visibleCourses.map((course) => <tr key={course._id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={`${api.defaults.baseURL}/${course.image}`} alt="" className="h-10 w-14 rounded-lg object-cover" /><div><p className="font-semibold text-slate-800">{course.title}</p><p className="max-w-44 truncate text-xs text-slate-500">{course.duration} hours</p></div></div></td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{course.category}</td><td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">₹{course.price}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{course.createdBy}</td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => openEdit(course)} aria-label={`Edit ${course.title}`} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"><Edit3 size={17} /></button><button type="button" onClick={() => setCourseToDelete(course)} aria-label={`Delete ${course.title}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={17} /></button></div></td></tr>)}
              {!visibleCourses.length && <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-500">No courses found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">{editingCourse ? "Update Course" : "Add Course"}</h2>{editingCourse && <button type="button" onClick={resetForm} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>}</div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} /></label>
          <label className="block text-sm font-semibold text-slate-700">Description<textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold text-slate-700">Price (₹)<input required min="0" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Duration (hrs)<input required min="1" type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className={inputClass} /></label></div>
          <label className="block text-sm font-semibold text-slate-700">Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClass}><option value="">Select category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label className="block text-sm font-semibold text-slate-700">Intro video URL (optional)<input value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} className={inputClass} /></label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-3 text-sm font-semibold text-slate-600 hover:border-indigo-400 hover:bg-indigo-50"><ImagePlus size={18} />{image ? image.name : "Upload course image"}<input type="file" accept="image/*" onChange={handleImage} className="sr-only" /></label>
          {preview && <img src={preview} alt="Course preview" className="h-32 w-full rounded-xl object-cover" />}
          <button disabled={isSaving} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"><Plus size={18} />{isSaving ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}</button>
        </form>
      </aside>

      {courseToDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold text-slate-900">Delete course?</h2><p className="mt-2 text-sm text-slate-600">This permanently removes “{courseToDelete.title}”, its lectures, and subscriptions.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setCourseToDelete(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button><button type="button" onClick={deleteCourse} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Delete</button></div></div></div>}
    </div>
  );
};

export default CourseManager;
