import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { problemService } from "../../services/problemService";
import toast from "react-hot-toast";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const LANGUAGES = ["PYTHON", "JAVA", "JAVASCRIPT", "CPP"];

const emptyCase = () => ({ input: "", output: "", explanation: "", is_sample: true });

export default function CreateProblem({ isHost = false }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState({
        title: "", desc: { statement: "", constraints: "" },
        difficulty: "EASY", points: 100, tags: "",
        time_limit_ms: 2000, memory_limit_mb: 256,
        starter_code: { python: "", java: "", javascript: "", cpp: "" },
    });
    const [cases, setCases] = useState([emptyCase()]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    useEffect(() => {
        if (!isEdit) return;
        const svc = isHost ? problemService.hostGetAll : problemService.adminGetAll;
        problemService.getProblem(id)
            .then((r) => {
                const p = r.data;
                setForm({
                    title: p.title ?? "",
                    desc: (typeof p.desc === "string" ? JSON.parse(p.desc) : p.desc) ?? { statement: "", constraints: "" },
                    difficulty: p.difficulty ?? "EASY",
                    points: p.points ?? 100,
                    tags: (p.tags ?? []).join(", "),
                    time_limit_ms: p.time_limit_ms ?? 2000,
                    memory_limit_mb: p.memory_limit_mb ?? 256,
                    starter_code: (typeof p.starter_code === "string" ? JSON.parse(p.starter_code) : p.starter_code) ?? {},
                });
                const c = (typeof p.cases === "string" ? JSON.parse(p.cases) : p.cases) ?? [];
                setCases(c.length ? c : [emptyCase()]);
            })
            .catch(() => toast.error("Failed to load problem"))
            .finally(() => setFetching(false));
    }, [id, isEdit]);

    const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
    const setDesc = (field, val) => setForm((f) => ({ ...f, desc: { ...f.desc, [field]: val } }));
    const setStarter = (lang, val) => setForm((f) => ({ ...f, starter_code: { ...f.starter_code, [lang]: val } }));

    const addCase = () => setCases((c) => [...c, emptyCase()]);
    const removeCase = (i) => setCases((c) => c.filter((_, idx) => idx !== i));
    const updateCase = (i, field, val) =>
        setCases((arr) => arr.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error("Title is required"); return; }
        setLoading(true);
        const payload = {
            ...form,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            cases: JSON.stringify(cases),
            desc: JSON.stringify(form.desc),
            starter_code: JSON.stringify(form.starter_code),
        };
        try {
            if (isEdit) {
                await (isHost ? problemService.adminUpdate(id, payload) : problemService.adminUpdate(id, payload));
                toast.success("Problem updated");
            } else {
                await (isHost ? problemService.hostCreate(payload) : problemService.adminCreate(payload));
                toast.success("Problem created");
            }
            navigate(isHost ? "/host" : "/admin/problems");
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Failed to save problem");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-slate-400 text-sm">Loading…</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-mono font-bold text-slate-100">
                {isEdit ? "Edit Problem" : "Create Problem"}
            </h1>

            {/* Basic info */}
            <div className="card space-y-4">
                <h2 className="font-mono font-semibold text-slate-200">Problem Info</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
                    <input value={form.title} onChange={(e) => set("title", e.target.value)} className="input-field" placeholder="Two Sum" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Difficulty</label>
                        <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}
                            className="input-field">
                            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Points</label>
                        <input type="number" value={form.points} onChange={(e) => set("points", +e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags (comma-separated)</label>
                        <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className="input-field" placeholder="Array, DP" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Time Limit (ms)</label>
                        <input type="number" value={form.time_limit_ms} onChange={(e) => set("time_limit_ms", +e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Memory Limit (MB)</label>
                        <input type="number" value={form.memory_limit_mb} onChange={(e) => set("memory_limit_mb", +e.target.value)} className="input-field" />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="card space-y-4">
                <h2 className="font-mono font-semibold text-slate-200">Description</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Statement</label>
                    <textarea value={form.desc.statement} onChange={(e) => setDesc("statement", e.target.value)}
                        rows={6} className="input-field resize-y" placeholder="Given an array of numbers..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Constraints</label>
                    <textarea value={form.desc.constraints} onChange={(e) => setDesc("constraints", e.target.value)}
                        rows={3} className="input-field resize-y font-mono text-xs" placeholder="1 ≤ n ≤ 10^5" />
                </div>
            </div>

            {/* Starter code */}
            <div className="card space-y-3">
                <h2 className="font-mono font-semibold text-slate-200">Starter Code</h2>
                {LANGUAGES.map((lang) => (
                    <div key={lang}>
                        <label className="block text-xs font-medium text-slate-400 mb-1">{lang}</label>
                        <textarea
                            value={form.starter_code[lang.toLowerCase()] ?? ""}
                            onChange={(e) => setStarter(lang.toLowerCase(), e.target.value)}
                            rows={3}
                            className="input-field font-mono text-xs resize-y"
                            placeholder={`# ${lang} starter code`}
                        />
                    </div>
                ))}
            </div>

            {/* Test cases */}
            <div className="card space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-mono font-semibold text-slate-200">Test Cases</h2>
                    <button type="button" onClick={addCase} className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5">
                        <Plus size={13} /> Add Case
                    </button>
                </div>
                {cases.map((tc, i) => (
                    <div key={i} className="border border-border rounded-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-mono text-slate-300">Case {i + 1}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateCase(i, "is_sample", !tc.is_sample)}
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-badge border transition-colors ${tc.is_sample ? "border-success/40 text-success bg-success/10" : "border-border text-slate-400"
                                        }`}
                                >
                                    {tc.is_sample ? <Eye size={11} /> : <EyeOff size={11} />}
                                    {tc.is_sample ? "Visible" : "Hidden"}
                                </button>
                                {cases.length > 1 && (
                                    <button type="button" onClick={() => removeCase(i)} className="text-danger hover:text-red-400">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Input</label>
                                <textarea value={tc.input} onChange={(e) => updateCase(i, "input", e.target.value)}
                                    rows={3} className="input-field font-mono text-xs resize-y" placeholder="1 2 3" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Expected Output</label>
                                <textarea value={tc.output} onChange={(e) => updateCase(i, "output", e.target.value)}
                                    rows={3} className="input-field font-mono text-xs resize-y" placeholder="6" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Explanation (optional)</label>
                            <input value={tc.explanation ?? ""} onChange={(e) => updateCase(i, "explanation", e.target.value)}
                                className="input-field text-xs" placeholder="Add 1+2+3 = 6" />
                        </div>
                    </div>
                ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 flex items-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isEdit ? "Update Problem" : "Create Problem"}
            </button>
        </form>
    );
}
