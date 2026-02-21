import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contestService } from "../../services/contestService";
import { problemService } from "../../services/problemService";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";

export default function CreateContest({ isHost = false }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "", description: "",
        start_time: "", end_time: "", duration_mins: 120,
        is_public: true, invite_code: "",
        job_role: "", shortlist_count: "", min_score: "",
    });
    const [problems, setProblems] = useState([]);
    const [allProblems, setAllProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const svc = isHost ? problemService.hostGetAll() : problemService.adminGetAll();
        svc.then((r) => setAllProblems(r.data?.content ?? r.data ?? []))
            .catch(() => { })
            .finally(() => setFetching(false));
    }, [isHost]);

    const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

    const addProblem = (p) => {
        if (problems.find((x) => x.id === p.id)) return;
        setProblems((arr) => [...arr, { ...p, points_override: p.points ?? 100 }]);
    };
    const removeProblem = (id) => setProblems((arr) => arr.filter((p) => p.id !== id));
    const setPoints = (id, pts) =>
        setProblems((arr) => arr.map((p) => p.id === id ? { ...p, points_override: +pts } : p));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.start_time || !form.end_time) {
            toast.error("Title, start time, and end time are required");
            return;
        }
        setLoading(true);
        const payload = {
            ...form,
            duration_mins: +form.duration_mins,
            shortlist_count: form.shortlist_count ? +form.shortlist_count : undefined,
            min_score: form.min_score ? +form.min_score : undefined,
            problems: problems.map((p) => ({ problem_id: p.id, points: p.points_override })),
        };
        try {
            const svc = isHost ? contestService.hostCreate(payload) : contestService.adminCreate(payload);
            await svc;
            toast.success("Contest created!");
            navigate(isHost ? "/host/contests" : "/admin/contests");
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Failed to create contest");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-mono font-bold text-slate-100">Create Contest</h1>

            {/* Basic info */}
            <div className="card space-y-4">
                <h2 className="font-mono font-semibold text-slate-200">Contest Details</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
                    <input value={form.title} onChange={(e) => set("title", e.target.value)} className="input-field" placeholder="Weekly Challenge #1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                    <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                        rows={3} className="input-field resize-y" placeholder="Contest description..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Time *</label>
                        <input type="datetime-local" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">End Time *</label>
                        <input type="datetime-local" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} className="input-field" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration (minutes)</label>
                    <input type="number" value={form.duration_mins} onChange={(e) => set("duration_mins", +e.target.value)} className="input-field" />
                </div>
                {/* Visibility */}
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => set("is_public", !form.is_public)}
                        className={`px-4 py-2 rounded-input text-sm border transition-colors ${form.is_public ? "border-success bg-success/10 text-success" : "border-border text-slate-400"}`}>
                        {form.is_public ? "🌐 Public" : "🔒 Private"}
                    </button>
                    {!form.is_public && (
                        <input value={form.invite_code} onChange={(e) => set("invite_code", e.target.value)}
                            className="input-field flex-1" placeholder="Invite code (leave blank to auto-generate)" />
                    )}
                </div>
            </div>

            {/* Hiring fields */}
            <div className="card space-y-4">
                <h2 className="font-mono font-semibold text-slate-200">Hiring Options <span className="text-slate-500 font-normal text-xs ml-2">(optional)</span></h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Role</label>
                        <input value={form.job_role} onChange={(e) => set("job_role", e.target.value)} className="input-field" placeholder="Frontend Engineer" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Shortlist Count</label>
                        <input type="number" value={form.shortlist_count} onChange={(e) => set("shortlist_count", e.target.value)} className="input-field" placeholder="10" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Minimum Score</label>
                    <input type="number" value={form.min_score} onChange={(e) => set("min_score", e.target.value)} className="input-field" placeholder="50" />
                </div>
            </div>

            {/* Problem selector */}
            <div className="card space-y-4">
                <h2 className="font-mono font-semibold text-slate-200">Problems</h2>
                {/* Selected problems */}
                {problems.length > 0 && (
                    <div className="space-y-2 mb-2">
                        {problems.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-3 bg-bg border border-border rounded-input px-3 py-2">
                                <span className="font-mono text-primary text-sm font-bold w-5">{"ABCDEFGH"[i]}</span>
                                <span className="flex-1 text-sm text-slate-200">{p.title}</span>
                                <input
                                    type="number"
                                    value={p.points_override}
                                    onChange={(e) => setPoints(p.id, e.target.value)}
                                    className="w-20 input-field text-xs py-1 text-right"
                                    placeholder="Points"
                                />
                                <span className="text-xs text-slate-400">pts</span>
                                <button type="button" onClick={() => removeProblem(p.id)} className="text-danger hover:text-red-400">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* Add from list */}
                {fetching ? (
                    <p className="text-slate-400 text-sm">Loading problems…</p>
                ) : (
                    <div className="border border-border rounded-card overflow-hidden max-h-48 overflow-y-auto">
                        {allProblems.filter((p) => !problems.find((x) => x.id === p.id)).map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => addProblem(p)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors border-b border-border last:border-0"
                            >
                                <span>{p.title}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`badge text-xs ${p.difficulty === "EASY" ? "difficulty-easy" : p.difficulty === "MEDIUM" ? "difficulty-medium" : "difficulty-hard"}`}>{p.difficulty}</span>
                                    <Plus size={13} className="text-primary" />
                                </div>
                            </button>
                        ))}
                        {allProblems.length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-4">No problems available</p>
                        )}
                    </div>
                )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 flex items-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Create Contest
            </button>
        </form>
    );
}
