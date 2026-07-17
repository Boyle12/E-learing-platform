import { useEffect, useMemo, useState } from "react";
import { BookOpen, Edit3, LayoutDashboard, LogOut, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import "./account.css";

const roleConfig = {
  admin: { label: "Platform Administrator", description: "Manage learners, instructors, content, and platform operations.", portal: "/admin/dashboard", portalLabel: "Open Admin Portal", icon: ShieldCheck },
  instructor: { label: "Instructor", description: "Create courses, publish lectures, and track your learners.", portal: "/instructor/dashboard", portalLabel: "Open Instructor Portal", icon: BookOpen },
  student: { label: "Learner", description: "Continue your learning journey and track your enrolled courses.", portalLabel: "Open Learning Dashboard", icon: LayoutDashboard },
};

const Account = ({ user }) => {
  const navigate = useNavigate();
  const { setIsAuth, setUser } = UserData();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", password: "" });
  const config = roleConfig[user?.role] || roleConfig.student;
  const Icon = config.icon;
  const initials = useMemo(() => (user?.name || "User").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), [user?.name]);

  useEffect(() => setForm({ name: user?.name || "", email: user?.email || "", password: "" }), [user]);
  const logoutHandler = () => { localStorage.removeItem("token"); setUser(null); setIsAuth(false); toast.success("Logged out successfully"); navigate("/login"); };
  const saveProfile = async (event) => { event.preventDefault(); setSaving(true); try { const { data } = await axios.put(`${server}/api/auth/profile`, form, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }); setUser(data.user); setForm((current) => ({ ...current, password: "" })); setEditing(false); toast.success("Profile updated"); } catch (error) { toast.error(error.response?.data?.message || "Unable to update profile"); } finally { setSaving(false); } };
  const openPortal = () => navigate(config.portal || `/${user?._id}/dashboard`);

  if (!user) return null;
  return <main className="account-page"><section className="account-hero"><div className="account-avatar">{initials}</div><div><span className="account-role"><Icon size={15}/>{config.label}</span><h1>{user.name}</h1><p>{config.description}</p></div><button type="button" className="account-portal-button" onClick={openPortal}><LayoutDashboard size={18}/>{config.portalLabel}</button></section><div className="account-grid"><section className="account-card profile-card"><div className="card-heading"><div><p className="eyebrow">Account information</p><h2>My Profile</h2></div><button type="button" className="icon-button" aria-label="Edit profile" onClick={() => setEditing((value) => !value)}><Edit3 size={18}/></button></div>{editing ? <form onSubmit={saveProfile} className="account-form"><label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required/></label><label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required/></label><label>New password <span>(optional)</span><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Leave blank to keep current password"/></label><div className="form-actions"><button type="button" onClick={() => setEditing(false)}>Cancel</button><button disabled={saving} type="submit"><Save size={16}/>{saving ? "Saving..." : "Save changes"}</button></div></form> : <div className="profile-details"><div><span className="detail-icon"><UserRound size={18}/></span><p><small>Full name</small><strong>{user.name}</strong></p></div><div><span className="detail-icon"><Mail size={18}/></span><p><small>Email address</small><strong>{user.email}</strong></p></div><div><span className="detail-icon"><ShieldCheck size={18}/></span><p><small>Access role</small><strong>{config.label}</strong></p></div></div>}</section><aside className="account-card quick-card"><p className="eyebrow">Quick actions</p><h2>Your workspace</h2><p className="quick-copy">Use your role-specific workspace to continue managing your activity.</p><button type="button" className="workspace-action" onClick={openPortal}><Icon size={19}/><span><strong>{config.portalLabel}</strong><small>Go to your dashboard</small></span></button><button type="button" className="logout-action" onClick={logoutHandler}><LogOut size={18}/>Logout securely</button></aside></div></main>;
};

export default Account;
