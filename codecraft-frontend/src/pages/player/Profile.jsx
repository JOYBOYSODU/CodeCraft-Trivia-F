import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { playerService } from "../../services/playerService";
import { submissionService } from "../../services/submissionService";
import Loader from "../../components/Loader";
import { User, Star, Trophy, Flame, Code, ArrowRight, Swords } from "lucide-react";

function XPBar({ xp, xpToNext }) {
    const pct = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 100;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
                <span>{xp} XP earned</span>
                <span>{pct}%</span>
                <span>{xpToNext} XP to next level</span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366F1, #22D3EE)" }} />
            </div>
        </div>
    );
}

const VERDICT_CLS = {
    ACCEPTED: "badge-success", WRONG_ANSWER: "badge-danger",
    TIME_LIMIT: "badge-warning", COMPILE_ERROR: "badge-warning", RUNTIME_ERROR: "badge-danger",
};

export default function Profile() {
    const { user } = useAuth();
    const [player, setPlayer] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            playerService.getMe(),
            submissionService.getSubmissions({ limit: 10 }),
        ]).then(([pRes, sRes]) => {
            setPlayer(pRes.data);
            setSubmissions(sRes.data?.content ?? sRes.data ?? []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader text="Loading profile..." />;

    const tierCls = { BRONZE: "tier-bronze", SILVER: "tier-silver", GOLD: "tier-gold" }[player?.tier] ?? "badge-primary";

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Profile card */}
            <div className="card flex items-start gap-5">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {user?.profile_picture ? (
                        <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={28} className="text-indigo-400" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-mono font-bold text-slate-100">{user?.name}</h1>
                        {user?.is_verified && <span className="text-cyan-400 text-sm">✓ Verified</span>}
                    </div>
                    <p className="text-slate-400 text-sm">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {player?.tier && <span className={tierCls}>{player.tier}</span>}
                        {player?.sub_rank && <span className="badge badge-secondary">{player.sub_rank}</span>}
                        {player?.preferred_mode && <span className="badge badge-primary">{player.preferred_mode}</span>}
                        <span className="text-xs text-slate-500 font-mono">Level {player?.level ?? 1}</span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-2xl font-mono font-bold text-slate-100">#{player?.rank ?? "—"}</p>
                    <p className="text-xs text-slate-400">Global Rank</p>
                </div>
            </div>

            {/* XP bar */}
            {player && (
                <div className="card space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-slate-200">Level {player.level}</span>
                    </div>
                    <XPBar xp={player.xp ?? 0} xpToNext={player.xp_to_next ?? 1000} />
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: Code, label: "Solved", val: player?.total_solved ?? 0, color: "text-cyan-400", to: "/practice" },
                    { icon: Trophy, label: "Contest Wins", val: player?.total_wins ?? 0, color: "text-yellow-400", to: "/contests" },
                    { icon: Flame, label: "Streak", val: `${player?.streak_days ?? 0}d`, color: "text-orange-400", to: null },
                    { icon: Star, label: "Contests", val: player?.total_contests ?? 0, color: "text-indigo-400", to: "/contests" },
                ].map(({ icon: Icon, label, val, color, to }) => {
                    const inner = (
                        <>
                            <Icon size={18} className={`mx-auto mb-1 ${color}`} />
                            <p className="text-xl font-mono font-bold text-slate-100">{val}</p>
                            <p className="text-xs text-slate-400">{label}</p>
                        </>
                    );
                    return to ? (
                        <Link key={label} to={to} className="card text-center hover:border-indigo-500/30 transition-colors">{inner}</Link>
                    ) : (
                        <div key={label} className="card text-center">{inner}</div>
                    );
                })}
            </div>

            {/* Difficulty breakdown */}
            {player && (
                <div className="card">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-mono font-semibold text-slate-200">Solved by Difficulty</h2>
                        <Link to="/practice" className="text-indigo-400 text-xs flex items-center gap-1 hover:underline">
                            Practice more <ArrowRight size={11} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { label: "Easy", val: player.easy_solved ?? 0, color: "text-emerald-400", diff: "EASY" },
                            { label: "Medium", val: player.medium_solved ?? 0, color: "text-yellow-400", diff: "MEDIUM" },
                            { label: "Hard", val: player.hard_solved ?? 0, color: "text-red-400", diff: "HARD" },
                        ].map(({ label, val, color, diff }) => (
                            <Link key={label} to={`/practice?difficulty=${diff}`} className="hover:opacity-80 transition-opacity">
                                <p className={`text-2xl font-mono font-bold ${color}`}>{val}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent submissions */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-mono font-semibold text-slate-200">Recent Submissions</h2>
                    <Link to="/practice" className="text-indigo-400 text-xs flex items-center gap-1 hover:underline">
                        Solve more <ArrowRight size={11} />
                    </Link>
                </div>
                {submissions.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                        <Swords size={24} className="mx-auto text-slate-600" />
                        <p className="text-slate-500 text-sm">No submissions yet.</p>
                        <Link to="/practice" className="btn-primary text-sm px-4 py-1.5 inline-flex items-center gap-1">
                            Start Practicing <ArrowRight size={13} />
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="table-header">Problem</th>
                                    <th className="table-header">Language</th>
                                    <th className="table-header text-right">Verdict</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((s) => (
                                    <tr key={s.id} className="table-row">
                                        <td className="table-cell">
                                            <Link to={`/problems/${s.problem_id}`}
                                                className="hover:text-indigo-400 transition-colors">
                                                {s.problem_title ?? `Problem #${s.problem_id}`}
                                            </Link>
                                        </td>
                                        <td className="table-cell"><span className="badge badge-secondary">{s.language}</span></td>
                                        <td className="table-cell text-right">
                                            <span className={`badge ${VERDICT_CLS[s.verdict] ?? "badge-primary"}`}>
                                                {s.verdict?.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
