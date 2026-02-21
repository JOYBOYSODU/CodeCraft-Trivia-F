import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { problemService } from "../../services/problemService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

export default function ManageProblems() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        problemService.adminGetAll()
            .then((r) => setProblems(r.data?.content ?? r.data ?? []))
            .catch(() => toast.error("Failed to load problems"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const delProblem = async (id) => {
        if (!confirm("Delete this problem?")) return;
        try {
            await problemService.adminDelete(id);
            toast.success("Deleted");
            setProblems((prev) => prev.filter((p) => p.id !== id));
        } catch { toast.error("Failed to delete"); }
    };

    const diffCls = { EASY: "difficulty-easy", MEDIUM: "difficulty-medium", HARD: "difficulty-hard" };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-mono font-bold text-slate-100">Manage Problems</h1>
                <Link to="/admin/problems/create" className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
                    <PlusCircle size={15} /> New Problem
                </Link>
            </div>
            {loading ? <Loader /> : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="table-header">Title</th>
                                <th className="table-header">Difficulty</th>
                                <th className="table-header text-right">Points</th>
                                <th className="table-header text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.length === 0 && (
                                <tr><td colSpan={4} className="table-cell text-center py-8 text-slate-500">No problems</td></tr>
                            )}
                            {problems.map((p) => (
                                <tr key={p.id} className="table-row">
                                    <td className="table-cell font-medium text-slate-200">{p.title}</td>
                                    <td className="table-cell"><span className={`badge ${diffCls[p.difficulty] ?? "badge-primary"}`}>{p.difficulty}</span></td>
                                    <td className="table-cell text-right font-mono text-slate-300">{p.points}</td>
                                    <td className="table-cell text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/admin/problems/${p.id}/edit`} className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5">
                                                <Pencil size={12} /> Edit
                                            </Link>
                                            <button onClick={() => delProblem(p.id)} className="btn-danger flex items-center gap-1 text-xs px-3 py-1.5">
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
