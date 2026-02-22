import { useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Megaphone } from "lucide-react";

const TYPES = ["INFO", "WARNING", "SUCCESS", "DANGER"];
const TARGET_ROLES = ["ALL", "PLAYER", "HOST", "ADMIN"];

export default function PostAnnouncement() {
    const [form, setForm] = useState({
        title: "", message: "", type: "INFO",
        target_role: "ALL", target_contest: "",
        expires_at: "", is_active: true,
    });
    const [loading, setLoading] = useState(false);

    const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.message) { toast.error("Title and message required"); return; }
        setLoading(true);
        try {
            await axiosInstance.post("/admin/announcements", form);
            toast.success("Announcement posted!");
            setForm({ title: "", message: "", type: "INFO", target_role: "ALL", target_contest: "", expires_at: "", is_active: true });
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Failed to post announcement");
        } finally {
            setLoading(false);
        }
    };

    const typeCls = { INFO: "badge-primary", WARNING: "badge-warning", SUCCESS: "badge-success", DANGER: "badge-danger" };

    return (
        <div className="space-y-5 max-w-2xl">
            <div className="flex items-center gap-2">
                <Megaphone className="text-primary" size={22} />
                <h1 className="text-2xl font-mono font-bold text-slate-100">Post Announcement</h1>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
                    <input value={form.title} onChange={(e) => set("title", e.target.value)} className="input-field" placeholder="System Maintenance" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Message *</label>
                    <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
                        rows={4} className="input-field resize-y" placeholder="We will be performing maintenance..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
                        <div className="flex flex-wrap gap-1">
                            {TYPES.map((t) => (
                                <button key={t} type="button" onClick={() => set("type", t)}
                                    className={`badge ${typeCls[t]} cursor-pointer ${form.type === t ? "ring-1 ring-white/20" : "opacity-60"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Role</label>
                        <select value={form.target_role} onChange={(e) => set("target_role", e.target.value)} className="input-field">
                            {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Contest (optional)</label>
                        <input value={form.target_contest} onChange={(e) => set("target_contest", e.target.value)} className="input-field" placeholder="Contest ID" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Expires At (optional)</label>
                        <input type="datetime-local" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} className="input-field" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
                        id="is_active" className="w-4 h-4 accent-primary" />
                    <label htmlFor="is_active" className="text-sm text-slate-300">Active immediately</label>
                </div>

                <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 flex items-center gap-2">
                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    <Megaphone size={14} />
                    Post Announcement
                </button>
            </form>
        </div>
    );
}
