import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { hostService } from "../../services/hostService";
import Loader from "../../components/Loader";
import { Building2, AlertTriangle, PlusCircle, Trophy } from "lucide-react";

export default function HostDashboard() {
    const [host, setHost] = useState(null);
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([hostService.getMe(), hostService.getContests()])
            .then(([hRes, cRes]) => {
                setHost(hRes.data);
                setContests(cRes.data?.content ?? cRes.data ?? []);
            }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader text="Loading host dashboard..." />;

    const isApproved = host?.status === "APPROVED";

    return (
        <div className="space-y-6">
            {/* Host info */}
            <div className="card flex items-start gap-4">
                <Building2 className="text-secondary shrink-0" size={32} />
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-mono font-bold text-slate-100">{host?.company_name ?? "Your Company"}</h1>
                        <span className={`badge ${isApproved ? "badge-success" : "badge-warning"}`}>{host?.status ?? "PENDING"}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">{host?.type} · {host?.company_size} employees</p>
                    <p className="text-slate-400 text-sm mt-1">{host?.total_contests ?? 0} contests hosted</p>
                </div>
            </div>

            {/* Approval warning */}
            {!isApproved && (
                <div className="flex items-start gap-3 bg-warning/10 border border-warning/30 rounded-card px-4 py-3">
                    <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                    <div>
                        <p className="text-warning font-semibold text-sm">Account Pending Approval</p>
                        <p className="text-slate-400 text-xs mt-1">Contest creation is disabled until an admin approves your account.</p>
                    </div>
                </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
                <Link
                    to="/host/problems/create"
                    className={`card flex items-center gap-3 hover:border-primary/40 transition-colors ${!isApproved ? "opacity-50 pointer-events-none" : ""}`}
                >
                    <PlusCircle className="text-primary" size={20} />
                    <span className="font-medium text-slate-200">New Problem</span>
                </Link>
                <Link
                    to="/host/contests/create"
                    className={`card flex items-center gap-3 hover:border-secondary/40 transition-colors ${!isApproved ? "opacity-50 pointer-events-none" : ""}`}
                >
                    <Trophy className="text-secondary" size={20} />
                    <span className="font-medium text-slate-200">New Contest</span>
                </Link>
            </div>

            {/* My contests */}
            <div className="card">
                <h2 className="font-mono font-semibold text-slate-200 mb-3">My Contests</h2>
                {contests.length === 0 ? (
                    <p className="text-slate-500 text-sm">No contests yet. {isApproved ? "Create your first contest!" : ""}</p>
                ) : (
                    <div className="space-y-2">
                        {contests.map((c) => (
                            <Link key={c.id} to={`/host/contests/${c.id}`}
                                className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0 hover:text-primary transition-colors">
                                <span className="text-sm text-slate-200">{c.title}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">{c.participant_count ?? 0} participants</span>
                                    <span className={`badge text-xs ${c.status === "LIVE" ? "status-live" : c.status === "UPCOMING" ? "status-upcoming" : "status-ended"}`}>{c.status}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
