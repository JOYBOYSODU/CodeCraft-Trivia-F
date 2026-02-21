import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contestService } from "../../services/contestService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Snowflake, PlusCircle, StopCircle } from "lucide-react";

const STATUS_CLASSES = {
    LIVE: "status-live",
    UPCOMING: "status-upcoming",
    ENDED: "status-ended",
    DRAFT: "status-draft",
};

export default function ManageContests() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        contestService.adminGetAll()
            .then((r) => setContests(r.data?.content ?? r.data ?? []))
            .catch(() => toast.error("Failed to load contests"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const freezeToggle = async (c) => {
        try {
            await contestService.adminFreezeLeaderboard(c.id, !c.leaderboard_frozen);
            toast.success(c.leaderboard_frozen ? "Leaderboard unfrozen" : "Leaderboard frozen");
            setContests((prev) => prev.map((x) => x.id === c.id ? { ...x, leaderboard_frozen: !c.leaderboard_frozen } : x));
        } catch { toast.error("Failed"); }
    };

    const endContest = async (id) => {
        if (!confirm("End this contest?")) return;
        try {
            await contestService.adminEndContest(id);
            toast.success("Contest ended");
            load();
        } catch { toast.error("Failed to end contest"); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-mono font-bold text-slate-100">Manage Contests</h1>
                <Link to="/admin/contests/create" className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
                    <PlusCircle size={15} /> New Contest
                </Link>
            </div>
            {loading ? <Loader /> : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="table-header">Title</th>
                                <th className="table-header hidden md:table-cell text-right">Participants</th>
                                <th className="table-header">Status</th>
                                <th className="table-header hidden lg:table-cell">Frozen</th>
                                <th className="table-header text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contests.length === 0 && (
                                <tr><td colSpan={5} className="table-cell text-center py-8 text-slate-500">No contests</td></tr>
                            )}
                            {contests.map((c) => (
                                <tr key={c.id} className="table-row">
                                    <td className="table-cell font-medium text-slate-200">{c.title}</td>
                                    <td className="table-cell hidden md:table-cell text-right text-slate-300">{c.participant_count ?? 0}</td>
                                    <td className="table-cell"><span className={`badge ${STATUS_CLASSES[c.status] ?? "badge-primary"}`}>{c.status}</span></td>
                                    <td className="table-cell hidden lg:table-cell">
                                        {c.leaderboard_frozen ? (
                                            <span className="flex items-center gap-1 text-secondary text-xs"><Snowflake size={12} /> Frozen</span>
                                        ) : <span className="text-xs text-slate-500">Live</span>}
                                    </td>
                                    <td className="table-cell text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => freezeToggle(c)}
                                                className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5"
                                            >
                                                <Snowflake size={12} />
                                                {c.leaderboard_frozen ? "Unfreeze" : "Freeze"}
                                            </button>
                                            {c.status !== "ENDED" && (
                                                <button onClick={() => endContest(c.id)} className="btn-danger flex items-center gap-1 text-xs px-3 py-1.5">
                                                    <StopCircle size={12} /> End
                                                </button>
                                            )}
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
