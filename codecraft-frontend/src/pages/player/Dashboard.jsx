import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { playerService } from "../../services/playerService";
import { contestService } from "../../services/contestService";
import { submissionService } from "../../services/submissionService";
import Loader from "../../components/Loader";
import { Code, Trophy, Flame, Star, ChevronRight, Clock, Users, Swords } from "lucide-react";

function XPBar({ xp, xpToNext }) {
    const pct = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 100;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{xp} XP</span>
                <span>{pct}%</span>
                <span>{xpToNext} XP next level</span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366F1, #22D3EE)" }}
                />
            </div>
        </div>
    );
}

const VERDICT_CLS = {
    ACCEPTED: "badge-success",
    WRONG_ANSWER: "badge-danger",
    TIME_LIMIT: "badge-warning",
    COMPILE_ERROR: "badge-warning",
    RUNTIME_ERROR: "badge-danger",
};

export default function Dashboard() {
    const { user } = useAuth();
    const [player, setPlayer] = useState(null);
    const [contests, setContests] = useState([]);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            playerService.getMe(),
            contestService.getContests({ status: "UPCOMING", limit: 3 }),
            submissionService.getSubmissions({ limit: 5 }),
        ]).then(([pRes, cRes, sRes]) => {
            setPlayer(pRes.data);
            setContests(cRes.data?.content ?? cRes.data ?? []);
            setRecent(sRes.data?.content ?? sRes.data ?? []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader text="Loading dashboard..." />;

    const tier = player?.tier ?? "BRONZE";
    const tierCls = { BRONZE: "tier-bronze", SILVER: "tier-silver", GOLD: "tier-gold" }[tier] ?? "badge-primary";

    return (
        <div className="space-y-6">
            {/* Welcome + XP card */}
            <div className="card space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-mono font-bold text-slate-100">
                            Welcome back, <span className="text-indigo-400">{user?.name ?? "Coder"}</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className={tierCls}>{tier}</span>
                            {player?.sub_rank && <span className="badge badge-secondary">{player.sub_rank}</span>}
                            <span className="text-xs text-slate-400 font-mono">Level {player?.level ?? 1}</span>
                        </div>
                    </div>
                    <Link to="/profile" className="btn-secondary text-xs flex items-center gap-1 px-3 py-1.5">
                        View Profile <ChevronRight size={12} />
                    </Link>
                </div>
                <XPBar xp={player?.xp ?? 0} xpToNext={player?.xp_to_next ?? 1000} />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: Code, label: "Problems Solved", val: player?.total_solved ?? 0, color: "text-secondary", to: "/practice" },
                    { icon: Trophy, label: "Contest Wins", val: player?.total_wins ?? 0, color: "text-yellow-400", to: "/contests" },
                    { icon: Flame, label: "Streak Days", val: player?.streak_days ?? 0, color: "text-orange-400", to: null },
                    { icon: Star, label: "Global Rank", val: `#${player?.rank ?? "—"}`, color: "text-indigo-400", to: "/practice" },
                ].map(({ icon: Icon, label, val, color, to }) => {
                    const content = (
                        <>
                            <Icon size={18} className={`mx-auto mb-1 ${color}`} />
                            <p className="text-xl font-mono font-bold text-slate-100">{val}</p>
                            <p className="text-xs text-slate-400">{label}</p>
                        </>
                    );
                    return to ? (
                        <Link key={label} to={to} className="card text-center hover:border-indigo-500/40 transition-colors">
                            {content}
                        </Link>
                    ) : (
                        <div key={label} className="card text-center">{content}</div>
                    );
                })}
            </div>

            {/* Difficulty breakdown */}
            {player && (
                <div className="card">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-mono font-semibold text-slate-200">Problems by Difficulty</h2>
                        <Link to="/practice" className="text-indigo-400 text-xs flex items-center gap-1 hover:underline">
                            Practice <ChevronRight size={11} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { label: "Easy", val: player.easy_solved ?? 0, color: "text-emerald-400" },
                            { label: "Medium", val: player.medium_solved ?? 0, color: "text-yellow-400" },
                            { label: "Hard", val: player.hard_solved ?? 0, color: "text-red-400" },
                        ].map(({ label, val, color }) => (
                            <Link key={label} to={`/practice?difficulty=${label.toUpperCase()}`} className="hover:opacity-80 transition-opacity">
                                <p className={`text-2xl font-mono font-bold ${color}`}>{val}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming contests */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-mono font-semibold text-slate-200">Upcoming Contests</h2>
                    <Link to="/contests" className="text-indigo-400 text-xs flex items-center gap-1 hover:underline">
                        View all <ChevronRight size={11} />
                    </Link>
                </div>
                {contests.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                        No upcoming contests.{" "}
                        <Link to="/contests" className="text-indigo-400 hover:underline">Browse all</Link>
                    </p>
                ) : (
                    <div className="space-y-2">
                        {contests.map((c) => (
                            <Link
                                key={c.id}
                                to={`/contests/${c.id}`}
                                className="flex items-center justify-between gap-3 py-2 px-3 rounded-input hover:bg-white/5 transition-colors -mx-3"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{c.title}</p>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Clock size={10} />{c.duration_mins}m</span>
                                        <span className="flex items-center gap-1"><Users size={10} />{c.participant_count ?? 0}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="badge status-upcoming">UPCOMING</span>
                                    <ChevronRight size={14} className="text-slate-500" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <Link to="/contests" className="btn-primary w-full text-center text-sm py-2 mt-3 flex items-center justify-center gap-1.5">
                    <Swords size={14} /> Browse Contests
                </Link>
            </div>

            {/* Recent submissions */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-mono font-semibold text-slate-200">Recent Submissions</h2>
                    <Link to="/profile" className="text-indigo-400 text-xs flex items-center gap-1 hover:underline">
                        View all <ChevronRight size={11} />
                    </Link>
                </div>
                {recent.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                        No submissions yet.{" "}
                        <Link to="/practice" className="text-indigo-400 hover:underline">Solve a problem</Link>!
                    </p>
                ) : (
                    <div className="space-y-1.5">
                        {recent.map((s) => (
                            <Link
                                key={s.id}
                                to={`/problems/${s.problem_id}`}
                                className="flex items-center justify-between gap-3 py-2 px-3 rounded-input hover:bg-white/5 transition-colors -mx-3"
                            >
                                <span className="text-sm text-slate-200 truncate">{s.problem_title ?? `Problem #${s.problem_id}`}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="badge badge-secondary text-xs">{s.language}</span>
                                    <span className={`badge ${VERDICT_CLS[s.verdict] ?? "badge-primary"}`}>
                                        {s.verdict?.replace(/_/g, " ")}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
