import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { contestService } from "../../services/contestService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import LeaderboardTable from "../../components/LeaderboardTable";
import Loader from "../../components/Loader";
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

    if (loading) return <Loader text="Loading leaderboard..." />;

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
