import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { playerService } from "../../services/playerService";
import { submissionService } from "../../services/submissionService";
import Loader from "../../components/Loader";
import { User, Star, Trophy, Flame, Code, ArrowRight, Swords, CheckCircle2 } from "lucide-react";

function XPBar({ xp, xpToNext }) {
    const pct = xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs" style={{ color: "#4B5563" }}>
                <span>{xp} XP earned</span>
                <span style={{ fontWeight: 700, color: "#0B0B0B" }}>{pct}%</span>
                <span>{xpToNext} XP to next level</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(11,11,11,0.1)", border: "1px solid rgba(11,11,11,0.15)" }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0B0B0B, #F7E800)" }}
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
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", padding: "0.5rem 0" }}>

            {/* ── Profile Hero Card ── */}
            <div className="card" style={{ padding: "1.5rem", display: "flex", gap: "1.25rem", alignItems: "center" }}>
                {/* Avatar */}
                <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    border: "2px solid #0B0B0B",
                    background: "#F7E800",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, overflow: "hidden"
                }}>
                    {user?.profile_picture ? (
                        <img src={user.profile_picture} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <User size={32} color="#0B0B0B" />
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#0B0B0B", fontFamily: "'JetBrains Mono', monospace" }}>
                            {user?.name}
                        </h1>
                        {user?.is_verified && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.75rem", color: "#16A34A", fontWeight: 600 }}>
                                <CheckCircle2 size={13} /> Verified
                            </span>
                        )}
                    </div>
                    <p style={{ margin: "0.2rem 0 0.5rem", fontSize: "0.85rem", color: "#4B5563" }}>{user?.email}</p>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                        {player?.tier && <span className={tierCls}>{player.tier}</span>}
                        {player?.sub_rank && <span className="badge badge-secondary">{player.sub_rank}</span>}
                        {player?.preferred_mode && <span className="badge badge-primary">{player.preferred_mode}</span>}
                        <span style={{ fontSize: "0.75rem", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
                            Level {player?.level ?? 1}
                        </span>
                    </div>
                </div>

                {/* Rank */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#0B0B0B", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                        #{player?.rank ?? "—"}
                    </p>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Global Rank
                    </p>
                </div>
            </div>

            {/* ── XP Bar ── */}
            {player && (
                <div className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#0B0B0B", fontSize: "0.9rem" }}>
                            Level {player.level} Progress
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                            {player.xp ?? 0} / {player.xp_to_next ?? 1000} XP
                        </span>
                    </div>
                    <XPBar xp={player.xp ?? 0} xpToNext={player.xp_to_next ?? 1000} />
                </div>
            )}

            {/* ── Stats Grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                {[
                    { icon: Code, label: "Solved", val: player?.total_solved ?? 0, color: "#0B0B0B", bg: "#F7E800", to: "/practice" },
                    { icon: Trophy, label: "Contest Wins", val: player?.total_wins ?? 0, color: "#0B0B0B", bg: "#FFF3A6", to: "/contests" },
                    { icon: Flame, label: "Streak", val: `${player?.streak_days ?? 0}d`, color: "#0B0B0B", bg: "#FFF0E6", to: null },
                    { icon: Star, label: "Contests", val: player?.total_contests ?? 0, color: "#0B0B0B", bg: "#F0F0F0", to: "/contests" },
                ].map((item) => {
                    const Icon = item.icon;
                    const { label, val, color, bg, to } = item;
                    const inner = (
                        <div style={{ textAlign: "center", padding: "0.25rem 0" }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: "50%",
                                background: bg, border: "1.5px solid rgba(11,11,11,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 0.6rem"
                            }}>
                                <Icon size={18} color={color} />
                            </div>
                            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#0B0B0B", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{val}</p>
                            <p style={{ margin: "0.3rem 0 0", fontSize: "0.72rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                        </div>
                    );
                    return to ? (
                        <Link key={label} to={to} className="card" style={{ textDecoration: "none", transition: "border-color 150ms, box-shadow 150ms" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#F7E800"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(247,232,0,0.25)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#0B0B0B"; e.currentTarget.style.boxShadow = "none"; }}>
                            {inner}
                        </Link>
                    ) : (
                        <div key={label} className="card">{inner}</div>
                    );
                })}
            </div>

            {/* ── Difficulty Breakdown ── */}
            {player && (
                <div className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <h2 style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#0B0B0B", fontSize: "0.9rem" }}>
                            Solved by Difficulty
                        </h2>
                        <Link to="/practice" style={{ color: "#4B5563", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", fontWeight: 600 }}>
                            Practice more <ArrowRight size={11} />
                        </Link>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                        {[
                            { label: "Easy", val: player.easy_solved ?? 0, color: "#16A34A", bg: "rgba(16,185,129,0.12)", border: "rgba(16,163,74,0.3)", diff: "EASY" },
                            { label: "Medium", val: player.medium_solved ?? 0, color: "#D97706", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", diff: "MEDIUM" },
                            { label: "Hard", val: player.hard_solved ?? 0, color: "#DC2626", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", diff: "HARD" },
                        ].map(({ label, val, color, bg, border, diff }) => (
                            <Link key={label} to={`/practice?difficulty=${diff}`} style={{
                                textDecoration: "none", textAlign: "center",
                                background: bg, border: `1.5px solid ${border}`,
                                borderRadius: "8px", padding: "1rem 0.75rem",
                                transition: "opacity 150ms"
                            }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                                <p style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{val}</p>
                                <p style={{ margin: "0.35rem 0 0", fontSize: "0.72rem", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Recent Submissions ── */}
            <div className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h2 style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#0B0B0B", fontSize: "0.9rem" }}>
                        Recent Submissions
                    </h2>
                    <Link to="/practice" style={{ color: "#4B5563", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", fontWeight: 600 }}>
                        Solve more <ArrowRight size={11} />
                    </Link>
                </div>

                {submissions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2.5rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: "50%",
                            background: "rgba(11,11,11,0.05)", border: "1.5px solid rgba(11,11,11,0.12)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Swords size={24} color="#9CA3AF" />
                        </div>
                        <p style={{ margin: 0, color: "#6B7280", fontSize: "0.875rem", fontWeight: 500 }}>No submissions yet.</p>
                        <p style={{ margin: 0, color: "#9CA3AF", fontSize: "0.8rem" }}>Start solving problems to track your progress</p>
                        <Link to="/practice" className="btn-primary" style={{ marginTop: "0.25rem", gap: "0.4rem" }}>
                            Start Practicing <ArrowRight size={13} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid rgba(11,11,11,0.15)" }}>
                                    <th className="table-header" style={{ paddingLeft: 0 }}>Problem</th>
                                    <th className="table-header">Language</th>
                                    <th className="table-header" style={{ textAlign: "right", paddingRight: 0 }}>Verdict</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((s) => (
                                    <tr key={s.id} className="table-row">
                                        <td className="table-cell" style={{ paddingLeft: 0, paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
                                            <Link to={`/problems/${s.problem_id}`} style={{ color: "#0B0B0B", textDecoration: "none", fontWeight: 500 }}
                                                onMouseEnter={e => { e.currentTarget.style.color = "#4B5563"; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = "#0B0B0B"; }}>
                                                {s.problem_title ?? `Problem #${s.problem_id}`}
                                            </Link>
                                        </td>
                                        <td className="table-cell" style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
                                            <span className="badge badge-secondary">{s.language}</span>
                                        </td>
                                        <td className="table-cell" style={{ textAlign: "right", paddingRight: 0, paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
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
