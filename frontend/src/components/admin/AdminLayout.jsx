import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { UserData } from "../../context/UserContext";
import "./admin.css";

const navigation = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Students", to: "/admin/students", icon: GraduationCap },
  { label: "Instructors", to: "/admin/instructors", icon: ShieldCheck },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Lectures", to: "/admin/lectures", icon: BookOpen },
  { label: "Categories", to: "/admin/categories", icon: BookOpen },
  { label: "Enrollments", to: "/admin/enrollments", icon: Users },
  { label: "Payments", to: "/admin/payments", icon: ReceiptText },
  { label: "Reviews", to: "/admin/reviews", icon: FileBarChart },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

const getInitials = (name = "Admin") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { setIsAuth, setUser, user } = UserData();

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login", { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate(`/admin/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="admin-shell min-h-screen bg-slate-50 text-slate-900">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <NavLink
            to="/admin/dashboard"
            className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900"
            onClick={closeSidebar}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap size={20} aria-hidden="true" />
            </span>
            E-Learning Admin
          </NavLink>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={closeSidebar}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>
          <ul className="space-y-1">
            {navigation.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <NavLink
            to="/account"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <UserCircle size={19} aria-hidden="true" />
            Profile
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={19} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="admin-header sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          <form className="relative flex-1 max-w-2xl" onSubmit={handleSearch} role="search">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users, courses, payments..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </form>

          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          >
            <Bell size={20} aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-slate-100"
              onClick={() => setIsProfileOpen((isOpen) => !isOpen)}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {getInitials(user?.name)}
              </span>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                {user?.name || "Admin"}
              </span>
              <ChevronDown size={16} className="hidden text-slate-500 sm:block" aria-hidden="true" />
            </button>

            {isProfileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
              >
                <NavLink
                  to="/account"
                  role="menuitem"
                  className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profile
                </NavLink>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="admin-content p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
