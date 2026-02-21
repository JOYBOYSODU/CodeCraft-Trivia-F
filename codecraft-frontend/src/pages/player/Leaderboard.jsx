import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { contestService } from "../../services/contestService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import LeaderboardTable from "../../components/LeaderboardTable";
import toast from "react-hot-toast";
import { Trophy, RefreshCw } from "lucide-react";

export default function Leaderboard() {
    const { contestId } = useParams();
    const { token } = useAuth();
    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            contestService.getContest(contestId),
            contestService.getLeaderboard(contestId),
        ]).then(([cRes, lRes]) => {
            setContest(cRes.data);
            setLeaderboard(lRes.data ?? []);
        }).catch(() => toast.error("Failed to load leaderboard"))
            .finally(() => setLoading(false));
    }, [contestId]);

    // WebSocket subscription
    useEffect(() => {
        const topic = `/topic/contest/${contestId}/leaderboard`;
        socketService.connect(token, () => {
            socketService.subscribe(topic, (data) => {
                if (!contest?.leaderboard_frozen) {
                    setLeaderboard(Array.isArray(data) ? data : []);
                }
            });
        });
        return () => socketService.unsubscribe(topic);
    }, [contestId, token, contest?.leaderboard_frozen]);

    if (loading) {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="skeleton" style={{ width: "28px", height: "28px", borderRadius: "999px" }} />
                        <div>
                            <div className="skeleton skeleton-line" style={{ width: "160px" }} />
                            <div className="skeleton skeleton-line" style={{ width: "220px", marginTop: "8px" }} />
                        </div>
                    </div>
                    <div className="skeleton skeleton-line" style={{ width: "90px" }} />
                </div>
                <div className="card overflow-hidden p-0">
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
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={`leaderboard-skeleton-${i}`} className="table-row">
                                    <td className="table-cell"><div className="skeleton" style={{ height: "12px", width: "18px" }} /></td>
                                    <td className="table-cell"><div className="skeleton" style={{ height: "12px", width: "120px" }} /></td>
                                    <td className="table-cell text-right"><div className="skeleton" style={{ height: "12px", width: "40px", marginLeft: "auto" }} /></td>
                                    <td className="table-cell text-right"><div className="skeleton" style={{ height: "12px", width: "30px", marginLeft: "auto" }} /></td>
                                    <td className="table-cell text-right"><div className="skeleton" style={{ height: "12px", width: "45px", marginLeft: "auto" }} /></td>
                                    <td className="table-cell text-right"><div className="skeleton" style={{ height: "12px", width: "40px", marginLeft: "auto" }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="text-gold" size={22} />
                    <div>
                        <h1 className="text-xl font-mono font-bold text-slate-100">Leaderboard</h1>
                        {contest && <p className="text-sm text-slate-400">{contest.title}</p>}
                    </div>
                </div>
                {contest?.leaderboard_frozen && (
                    <span className="badge badge-secondary flex items-center gap-1">
                        <RefreshCw size={10} /> Frozen
                    </span>
                )}
            </div>

            <LeaderboardTable entries={leaderboard} frozen={contest?.leaderboard_frozen} />
        </div>
    );
}
