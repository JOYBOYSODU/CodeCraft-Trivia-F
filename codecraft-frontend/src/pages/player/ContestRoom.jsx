import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { contestService } from "../../services/contestService";
import { submissionService } from "../../services/submissionService";
import { useContestWebSocket } from "../../hooks/useWebSocket";
import { useAuth } from "../../context/AuthContext";
import ContestTimer from "../../components/ContestTimer";
import LeaderboardTable from "../../components/LeaderboardTable";
import ConnectionStatus from "../../components/ConnectionStatus";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Trophy, List, History, AlertTriangle, Sparkles, Award, TrendingUp } from "lucide-react";

export default function ContestRoom() {
    const { id } = useParams();
    const { user } = useAuth();

    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("problems");
    const tabSwitchCount = useRef(0);

    const isLive = contest?.status === "LIVE";

    // WebSocket connection with live event handlers
    const { status: wsStatus } = useContestWebSocket(id, {
        // Live leaderboard updates
        onLeaderboardUpdate: (data) => {
            if (!contest?.leaderboard_frozen) {
                setLeaderboard(data.leaderboard || data);
            }
        },

        // Problem solve notifications
        onProblemSolve: (data) => {
            const { username, problemTitle, points } = data;
            if (username !== user?.username) {
                toast.success(
                    `🎯 ${username} solved ${problemTitle} (+${points} pts)`,
                    { duration: 4000, icon: '⚡' }
                );
            }
        },

        // Rank change notifications
        onRankChange: (data) => {
            const { username, oldRank, newRank, change } = data;
            if (username === user?.username) {
                const icon = change > 0 ? '📈' : '📉';
                const color = change > 0 ? 'success' : 'error';
                toast[color](
                    `${icon} Rank changed: ${oldRank} → ${newRank}`,
                    { duration: 5000 }
                );
            }
        },

        // Level-up notifications
        onLevelUp: (data) => {
            const { newTier, xpGained } = data;
            toast.success(
                <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-400" />
                    <div>
                        <p className="font-bold">Level Up!</p>
                        <p className="text-sm">Reached {newTier} tier! (+{xpGained} XP)</p>
                    </div>
                </div>,
                { duration: 6000 }
            );
        },

        // Achievement unlock notifications
        onAchievement: (data) => {
            const { title } = data;
            toast.success(
                <div className="flex items-center gap-2">
                    <Award size={20} className="text-green-400" />
                    <div>
                        <p className="font-bold">🏆 Achievement Unlocked!</p>
                        <p className="text-sm">{title}</p>
                    </div>
                </div>,
                { duration: 6000 }
            );
        },

        // Contest status changes
        onStatusChange: (data) => {
            const { status, message } = data;
            if (status === 'ENDED') {
                toast.error('Contest has ended!', { duration: 5000 });
                setContest(prev => ({ ...prev, status: 'ENDED' }));
            } else if (status === 'LIVE') {
                toast.success('Contest is now LIVE!', { duration: 5000 });
                setContest(prev => ({ ...prev, status: 'LIVE' }));
            }
            if (message) toast.info(message);
        },
    });

    const loadData = useCallback(async () => {
        try {
            const [cRes, sRes, lRes] = await Promise.all([
                contestService.getContest(id),
                submissionService.getSubmissions({ contest_id: id }),
                contestService.getLeaderboard(id),
            ]);
            setContest(cRes.data);
            setProblems(cRes.data?.problems ?? []);
            setSubmissions(sRes.data?.content ?? sRes.data ?? []);
            setLeaderboard(lRes.data ?? []);
        } catch {
            // Don't show error toast, just set contest to null
            // This will trigger the "No contest available" message
            setContest(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadData(); }, [loadData]);

    // Anti-cheat: tab visibility
    useEffect(() => {
        if (!isLive) return;
        const handler = () => {
            if (document.hidden) {
                tabSwitchCount.current += 1;
                toast.error(`Tab switch #${tabSwitchCount.current} detected`);
            }
        };
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    }, [isLive]);

    if (loading) return <Loader fullscreen text="Loading contest..." />;
    if (!contest) return <div className="flex items-center justify-center h-full text-slate-400">No contest available</div>;

    const TABS = [
        { key: "problems", label: "Problems", icon: List },
        { key: "submissions", label: "Submissions", icon: History },
        { key: "leaderboard", label: "Leaderboard", icon: Trophy },
    ];

    const labelChar = ["A", "B", "C", "D", "E", "F"];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="card flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`badge ${contest.status === "LIVE" ? "status-live" : contest.status === "UPCOMING" ? "status-upcoming" : "status-ended"}`}>
                            {contest.status}
                        </span>
                        {isLive && <ConnectionStatus status={wsStatus} showLabel size="sm" />}
                    </div>
                    <h1 className="text-xl font-mono font-bold text-slate-100">{contest.title}</h1>
                    {contest.description && (
                        <p className="text-slate-400 text-sm mt-1">{contest.description}</p>
                    )}
                </div>
                {isLive && (
                    <div className="shrink-0">
                        <ContestTimer
                            endTime={contest.end_time}
                            onExpire={() => toast.error("Contest has ended!")}
                        />
                    </div>
                )}
            </div>

            {/* Anti-cheat warning */}
            {isLive && (
                <div className="flex items-center gap-2 text-sm text-warning bg-warning/10 border border-warning/30 rounded-card px-4 py-2">
                    <AlertTriangle size={14} />
                    Contest mode active: tab switches and paste are monitored
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-border flex gap-0">
                {/* eslint-disable-next-line no-unused-vars */}
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150 border-b-2 ${activeTab === key
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-400 hover:text-white"
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "problems" && (
                <div className="space-y-2">
                    {problems.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No problems assigned</p>
                    ) : problems.map((p, i) => {
                        const solved = submissions.some((s) => s.problem_id === p.id && s.verdict === "ACCEPTED");
                        return (
                            <Link
                                key={p.id}
                                to={`/problems/${p.id}?contestId=${id}`}
                                className={`card flex items-center justify-between gap-3 hover:border-primary/40 transition-colors ${solved ? "border-success/40" : ""}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-primary text-sm w-6">{labelChar[i]}</span>
                                    <div>
                                        <p className="font-medium text-slate-200">{p.title}</p>
                                        <p className="text-xs text-slate-400">{p.points} points · {p.difficulty}</p>
                                    </div>
                                </div>
                                {solved && <span className="badge badge-success">Solved</span>}
                            </Link>
                        );
                    })}
                </div>
            )}

            {activeTab === "submissions" && (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="table-header">Problem</th>
                                <th className="table-header">Language</th>
                                <th className="table-header text-right">Verdict</th>
                                <th className="table-header text-right hidden md:table-cell">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length === 0 ? (
                                <tr><td colSpan={4} className="table-cell text-center py-8 text-slate-500">No submissions yet</td></tr>
                            ) : submissions.map((s) => {
                                const cls = {
                                    ACCEPTED: "badge-success", WRONG_ANSWER: "badge-danger",
                                    TIME_LIMIT: "badge-warning", COMPILE_ERROR: "badge-warning"
                                };
                                return (
                                    <tr key={s.id} className="table-row">
                                        <td className="table-cell">{s.problem_title ?? `#${s.problem_id}`}</td>
                                        <td className="table-cell"><span className="badge badge-secondary">{s.language}</span></td>
                                        <td className="table-cell text-right">
                                            <span className={`badge ${cls[s.verdict] ?? "badge-primary"}`}>{s.verdict?.replace("_", " ")}</span>
                                        </td>
                                        <td className="table-cell text-right hidden md:table-cell text-slate-400 font-mono text-xs">
                                            {s.runtime_ms}ms
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "leaderboard" && (
                <LeaderboardTable entries={leaderboard} frozen={contest.leaderboard_frozen} />
            )}
        </div>
    );
}
