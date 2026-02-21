import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contestService } from "../../services/contestService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Trophy, Users, Clock, Building2, Briefcase, Lock, ChevronRight, Search } from "lucide-react";

const STATUS_CLASSES = {
    LIVE: "status-live",
    UPCOMING: "status-upcoming",
    ENDED: "status-ended",
    DRAFT: "status-draft",
};

function ContestCard({ contest }) {
    const isHiring = contest.shortlist_count != null;
    const isHosted = contest.host_id != null;
    const statusCls = STATUS_CLASSES[contest.status] ?? "badge badge-primary";
    const actionLabel = { LIVE: "Join Now →", UPCOMING: "View Details", ENDED: "View Results" }[contest.status] ?? "Open";

    return (
        <Link
            to={`/contests/${contest.id}`}
            className={`card hover:border-indigo-500/40 transition-all duration-200 space-y-3 flex flex-col group ${contest.status === "ENDED" ? "opacity-75" : ""
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <span className={statusCls}>{contest.status}</span>
                        {isHosted && (
                            <span className="badge badge-secondary flex items-center gap-1">
                                <Building2 size={9} /> Company
                            </span>
                        )}
                        {isHiring && (
                            <span className="badge badge-warning flex items-center gap-1">
                                <Briefcase size={9} /> Hiring
                            </span>
                        )}
                        {!contest.is_public && (
                            <span className="badge badge-danger flex items-center gap-1">
                                <Lock size={9} /> Private
                            </span>
                        )}
                    </div>
                    <h3 className="font-mono font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                        {contest.title}
                    </h3>
                    {contest.description && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{contest.description}</p>
                    )}
                </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock size={11} />{contest.duration_mins}m</span>
                <span className="flex items-center gap-1"><Users size={11} />{contest.participant_count ?? 0}</span>
                {contest.job_role && (
                    <span className="flex items-center gap-1"><Briefcase size={11} />{contest.job_role}</span>
                )}
            </div>

            <p className="text-xs text-slate-500">
                {contest.status === "LIVE" ? `Ends: ${new Date(contest.end_time).toLocaleString()}` :
                    contest.status === "UPCOMING" ? `Starts: ${new Date(contest.start_time).toLocaleString()}` :
                        `Ended: ${new Date(contest.end_time).toLocaleString()}`}
            </p>

            {/* CTA */}
            <div className={`mt-auto btn-primary text-center text-sm py-2 w-full ${contest.status === "LIVE" ? "bg-red-600 hover:bg-red-700" : ""
                }`}>
                {actionLabel}
            </div>
        </Link>
    );
}

export default function Contests() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [inviteCode, setInviteCode] = useState("");

    useEffect(() => {
        setLoading(true);
        const params = filter !== "ALL" ? { status: filter } : {};
        contestService.getContests(params)
            .then((res) => setContests(res.data?.content ?? res.data ?? []))
            .catch(() => toast.error("Failed to load contests"))
            .finally(() => setLoading(false));
    }, [filter]);

    const handleJoinPrivate = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) return;
        try {
            const res = await contestService.joinByInvite(inviteCode.trim());
            toast.success("Joined contest!");
            setInviteCode("");
            const id = res.data?.contest_id ?? res.data?.id;
            if (id) window.location.href = `/contests/${id}`;
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Invalid invite code");
        }
    };

    const FILTERS = ["ALL", "LIVE", "UPCOMING", "ENDED"];
    const live = contests.filter((c) => c.status === "LIVE");

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-mono font-bold text-slate-100">Contests</h1>
                    {live.length > 0 && (
                        <p className="text-sm text-red-400 mt-0.5">
                            🔴 {live.length} live contest{live.length > 1 ? "s" : ""} happening now
                        </p>
                    )}
                </div>
                {/* Private join */}
                <form onSubmit={handleJoinPrivate} className="flex items-center gap-2">
                    <input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Private invite code…"
                        className="input-field w-44 text-sm"
                    />
                    <button type="submit" className="btn-primary text-sm px-3 py-2 flex items-center gap-1">
                        <Lock size={13} /> Join
                    </button>
                </form>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 flex-wrap">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f
                                ? f === "LIVE" ? "bg-red-600 text-white"
                                    : f === "UPCOMING" ? "bg-indigo-600 text-white"
                                        : "bg-slate-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                    >
                        {f === "LIVE" && <span className="mr-1">🔴</span>}{f}
                    </button>
                ))}
            </div>

            {loading ? <Loader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contests.length === 0 ? (
                        <div className="col-span-full text-center py-16 text-slate-500 card">
                            <Trophy size={32} className="mx-auto mb-2 opacity-30" />
                            <p>No contests found</p>
                            <button onClick={() => setFilter("ALL")} className="text-indigo-400 hover:underline text-sm mt-1">
                                Show all contests
                            </button>
                        </div>
                    ) : contests.map((c) => <ContestCard key={c.id} contest={c} />)}
                </div>
            )}
        </div>
    );
}
