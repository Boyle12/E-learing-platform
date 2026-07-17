import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import api from "../../api/axios";

const initialSettings = {
  website: { title: "E-Learning", description: "Learn without limits.", keywords: "courses, learning, education" },
  smtp: { host: "", port: "587", user: "", password: "" },
  razorpay: { keyId: "", keySecret: "" },
  cloudinary: { cloudName: "", apiKey: "", apiSecret: "" },
  maintenanceMode: false,
};

const GlobalSettings = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateSection = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await api.put("/api/admin/settings", {
        website: settings.website,
        smtp: { ...settings.smtp, port: Number(settings.smtp.port) },
        razorpay: settings.razorpay,
        cloudinary: settings.cloudinary,
        maintenanceMode: settings.maintenanceMode,
      });
      setMessage("Global settings saved successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClassName = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Platform configuration</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Global Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Manage the platform metadata, integrations, and operational access.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={18} aria-hidden="true" />{message}</div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Website Meta</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Site title<input value={settings.website.title} onChange={(event) => updateSection("website", "title", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700">SEO keywords<input value={settings.website.keywords} onChange={(event) => updateSection("website", "keywords", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">Meta description<textarea rows="3" value={settings.website.description} onChange={(event) => updateSection("website", "description", event.target.value)} className={inputClassName} /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">SMTP Mailer</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">SMTP host<input placeholder="smtp.example.com" value={settings.smtp.host} onChange={(event) => updateSection("smtp", "host", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700">Port<input type="number" min="1" value={settings.smtp.port} onChange={(event) => updateSection("smtp", "port", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700">Username<input value={settings.smtp.user} onChange={(event) => updateSection("smtp", "user", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700">Password<input type="password" autoComplete="new-password" value={settings.smtp.password} onChange={(event) => updateSection("smtp", "password", event.target.value)} className={inputClassName} /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Payment Gateway — Razorpay</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Key ID<input value={settings.razorpay.keyId} onChange={(event) => updateSection("razorpay", "keyId", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700">Key Secret<input type="password" autoComplete="new-password" value={settings.razorpay.keySecret} onChange={(event) => updateSection("razorpay", "keySecret", event.target.value)} className={inputClassName} /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Cloudinary</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">Cloud name<input value={settings.cloudinary.cloudName} onChange={(event) => updateSection("cloudinary", "cloudName", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700">API key<input value={settings.cloudinary.apiKey} onChange={(event) => updateSection("cloudinary", "apiKey", event.target.value)} className={inputClassName} /></label>
            <label className="text-sm font-semibold text-slate-700">API secret<input type="password" autoComplete="new-password" value={settings.cloudinary.apiSecret} onChange={(event) => updateSection("cloudinary", "apiSecret", event.target.value)} className={inputClassName} /></label>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><h2 className="text-lg font-bold text-slate-900">Maintenance Mode</h2><p className="mt-1 text-sm text-slate-500">Temporarily restrict learner access while platform work is in progress.</p></div>
          <button type="button" role="switch" aria-checked={settings.maintenanceMode} onClick={() => setSettings((current) => ({ ...current, maintenanceMode: !current.maintenanceMode }))} className={`relative h-7 w-12 rounded-full transition-colors ${settings.maintenanceMode ? "bg-indigo-600" : "bg-slate-200"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.maintenanceMode ? "translate-x-6" : "translate-x-1"}`} /></button>
        </section>

        <div className="flex justify-end"><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><Save size={18} aria-hidden="true" />{isSaving ? "Saving..." : "Save Settings"}</button></div>
      </form>
    </div>
  );
};

export default GlobalSettings;
