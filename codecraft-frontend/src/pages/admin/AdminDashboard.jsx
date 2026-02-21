import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { submissionService } from "../../services/submissionService";
import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import { Users, BookOpen, Swords, Activity, ArrowRight, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosInstance.get("/admin/stats"),
            submissionService.getSubmissions({ limit: 10 }),
        ]).then(([sRes, subRes]) => {
            setStats(sRes.data);
            setSubs(subRes.data?.content ?? subRes.data ?? []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader text="Loading dashboard..." />;

    const cards = [
        { icon: Users, label: "Total Users", val: stats?.total_users, color: "text-indigo-400", to: "/admin/users" },
        { icon: BookOpen, label: "Total Problems", val: stats?.total_problems, color: "text-cyan-400", to: "/admin/problems" },
        { icon: Swords, label: "Active Contests", val: stats?.active_contests, color: "text-yellow-400", to: "/admin/contests" },
        { icon: Activity, label: "Submissions", val: stats?.total_submissions, color: "text-emerald-400", to: null },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-mono font-bold text-slate-100">Admin Overview</h1>

            {/* Stat cards — all clickable */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {cards.map(({ icon: Icon, label, val, color, to }) => {
                    const inner = (
                        <div className="flex items-center gap-4">
                            <Icon size={20} className={color} />
                            <div>
                                <p className="text-2xl font-mono font-bold text-slate-100">{val ?? "—"}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                            </div>
                        </div>
                    );
                    return to ? (
                        <Link key={label} to={to} className="card hover:border-indigo-500/40 transition-colors">
                            {inner}
                        </Link>
                    ) : (
                        <div key={label} className="card">{inner}</div>
                    );
                })}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { to: "/admin/users", label: "Manage Users", cls: "btn-secondary" },
                    { to: "/admin/hosts", label: "Approve Hosts", cls: "btn-secondary" },
                    { to: "/admin/problems/create", label: "New Problem", cls: "btn-primary" },
                    { to: "/admin/contests/create", label: "New Contest", cls: "btn-primary" },
                    { to: "/admin/announcements", label: "Post Announcement", cls: "btn-secondary" },
                    { to: "/admin/problems", label: "All Problems", cls: "btn-secondary" },
                    { to: "/admin/contests", label: "All Contests", cls: "btn-secondary" },
                ].map((l) => (
                    <Link key={l.to} to={l.to} className={`${l.cls} text-center text-sm py-2.5 flex items-center justify-center gap-1`}>
                        {l.label} <ChevronRight size={13} />
                    </Link>
                ))}
            </div>

            {/* Recent submissions */}
            <div className="card">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-mono font-semibold text-slate-200">Recent Submissions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="table-header">User</th>
                                <th className="table-header">Problem</th>
                                <th className="table-header">Language</th>
                                <th className="table-header text-right">Verdict</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subs.length === 0 ? (
                                <tr><td colSpan={4} className="table-cell text-center py-8 text-slate-500">No submissions</td></tr>
                            ) : subs.map((s) => {
                                const cls = { ACCEPTED: "badge-success", WRONG_ANSWER: "badge-danger", TIME_LIMIT: "badge-warning" };
                                return (
                                    <tr key={s.id} className="table-row">
                                        <td className="table-cell">{s.user_name ?? s.user_id}</td>
                                        <td className="table-cell">{s.problem_title ?? `#${s.problem_id}`}</td>
                                        <td className="table-cell"><span className="badge badge-secondary">{s.language}</span></td>
                                        <td className="table-cell text-right">
                                            <span className={`badge ${cls[s.verdict] ?? "badge-primary"}`}>{s.verdict?.replace("_", " ")}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
