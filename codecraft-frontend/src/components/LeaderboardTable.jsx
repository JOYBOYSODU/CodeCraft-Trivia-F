import { useAuth } from "../context/AuthContext";
import { Snowflake } from "lucide-react";

function formatPenalty(mins) {
    if (!mins && mins !== 0) return "—";
    return `${mins}m`;
}

export default function LeaderboardTable({ entries = [], frozen = false }) {
    const { user } = useAuth();

    return (
        <div className="card overflow-hidden p-0">
            {frozen && (
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border-b border-secondary/30 text-secondary text-sm font-medium">
                    <Snowflake size={14} />
                    Leaderboard is frozen — showing last known rankings
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="table-header w-12">#</th>
                            <th className="table-header">Player</th>
                            <th className="table-header text-right">Score</th>
                            <th className="table-header text-right">Solved</th>
                            <th className="table-header text-right">Accuracy</th>
                            <th className="table-header text-right">Penalty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length === 0 && (
                            <tr>
                                <td colSpan={6} className="table-cell text-center text-slate-500 py-8">
                                    No participants yet
                                </td>
                            </tr>
                        )}
                        {entries.map((entry, idx) => {
                            const isCurrentUser = user && entry.userId === user.id;
                            const rank = entry.final_rank ?? idx + 1;
                            return (
                                <tr
                                    key={entry.userId ?? idx}
                                    className={`table-row ${isCurrentUser ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                                >
                                    <td className="table-cell w-12">
                                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-200">{entry.username}</span>
                                            {isCurrentUser && (
                                                <span className="text-xs text-primary">(you)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="table-cell text-right font-mono font-semibold text-slate-100">
                                        {entry.raw_score ?? "—"}
                                    </td>
                                    <td className="table-cell text-right text-slate-300">
                                        {entry.problems_solved ?? 0}
                                    </td>
                                    <td className="table-cell text-right text-slate-300">
                                        {entry.accuracy_score != null ? `${(entry.accuracy_score * 100).toFixed(1)}%` : "—"}
                                    </td>
                                    <td className="table-cell text-right text-slate-400 font-mono">
                                        {formatPenalty(entry.penalty_mins)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
