import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { hostService } from "../../services/hostService";
import { contestService } from "../../services/contestService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Users, Award, CheckCircle, XCircle } from "lucide-react";

export default function ManageContest() {
    const { id } = useParams();
    const [contests, setContests] = useState([]);
    const [selected, setSelected] = useState(id ?? null);
    const [participants, setParticipants] = useState([]);
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPart, setLoadingPart] = useState(false);

    useEffect(() => {
        hostService.getContests()
            .then((r) => setContests(r.data?.content ?? r.data ?? []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selected) return;
        setLoadingPart(true);
        Promise.all([
            contestService.getContest(selected),
            hostService.getParticipants(selected),
        ]).then(([cRes, pRes]) => {
            setContest(cRes.data);
            setParticipants(pRes.data?.content ?? pRes.data ?? []);
        }).catch(() => toast.error("Failed to load participants"))
            .finally(() => setLoadingPart(false));
    }, [selected]);

    const toggleShortlist = async (participant) => {
        try {
            await hostService.shortlist(selected, participant.id);
            const wasShortlisted = !!participant.shortlisted_at;
            setParticipants((prev) => prev.map((p) =>
                p.id === participant.id
                    ? { ...p, shortlist_status: wasShortlisted ? "NOT_SHORTLISTED" : "SHORTLISTED", shortlisted_at: wasShortlisted ? null : new Date().toISOString() }
                    : p
            ));
            toast.success(wasShortlisted ? "Removed from shortlist" : "Shortlisted!");
        } catch { toast.error("Failed to update shortlist"); }
    };

    if (loading) return <Loader text="Loading contests..." />;

    const isEnded = contest?.status === "ENDED";

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-mono font-bold text-slate-100">Manage Contests</h1>

            {/* Contest selector */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Contest</label>
                <select
                    value={selected ?? ""}
                    onChange={(e) => setSelected(e.target.value)}
                    className="input-field"
                >
                    <option value="" disabled>Choose a contest…</option>
                    {contests.map((c) => (
                        <option key={c.id} value={c.id}>{c.title} ({c.status})</option>
                    ))}
                </select>
            </div>

            {/* Participants */}
            {selected && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-secondary" />
                            <h2 className="font-mono font-semibold text-slate-200">Participants</h2>
                            {contest && <span className="text-xs text-slate-400">({contest.participant_count ?? 0} total)</span>}
                        </div>
                        {isEnded && contest?.shortlist_count && (
                            <span className="badge badge-warning flex items-center gap-1">
                                <Award size={11} /> Target: {contest.shortlist_count} shortlisted
                            </span>
                        )}
                    </div>

                    {loadingPart ? <Loader /> : (
                        <div className="card overflow-hidden p-0">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="table-header">Rank</th>
                                        <th className="table-header">Player</th>
                                        <th className="table-header text-right hidden md:table-cell">Score</th>
                                        <th className="table-header text-right hidden md:table-cell">Solved</th>
                                        <th className="table-header text-right">Shortlist</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.length === 0 && (
                                        <tr><td colSpan={5} className="table-cell text-center py-8 text-slate-500">No participants yet</td></tr>
                                    )}
                                    {participants.map((p) => {
                                        const isShortlisted = !!p.shortlisted_at || p.shortlist_status === "SHORTLISTED";
                                        return (
                                            <tr key={p.id} className={`table-row ${isShortlisted ? "bg-success/5" : ""}`}>
                                                <td className="table-cell font-mono text-slate-300">#{p.final_rank ?? "—"}</td>
                                                <td className="table-cell font-medium text-slate-200">{p.username}</td>
                                                <td className="table-cell text-right hidden md:table-cell text-slate-300 font-mono">{p.raw_score ?? "—"}</td>
                                                <td className="table-cell text-right hidden md:table-cell text-slate-300">{p.problems_solved ?? 0}</td>
                                                <td className="table-cell text-right">
                                                    {isEnded ? (
                                                        <button
                                                            onClick={() => toggleShortlist(p)}
                                                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-input border transition-colors ml-auto ${isShortlisted
                                                                    ? "border-success/40 bg-success/10 text-success hover:bg-success/20"
                                                                    : "border-border text-slate-400 hover:border-slate-500 hover:text-white"
                                                                }`}
                                                        >
                                                            {isShortlisted ? <><CheckCircle size={11} /> Shortlisted</> : <><XCircle size={11} /> Shortlist</>}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">Contest not ended</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
