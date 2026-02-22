import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { ShieldAlert, ShieldCheck, ShieldOff, UserX } from "lucide-react";

const STATUS_OPTIONS = ["ACTIVE", "BANNED", "SUSPENDED", "DORMANT"];

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = () => {
        setLoading(true);
        axiosInstance.get("/admin/users", { params: search ? { search } : {} })
            .then((r) => setUsers(r.data?.content ?? r.data ?? []))
            .catch(() => toast.error("Failed to load users"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => load(), 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const changeStatus = async (userId, status) => {
        try {
            await axiosInstance.put(`/admin/users/${userId}/status`, { status });
            toast.success(`Status updated to ${status}`);
            setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status } : u));
        } catch {
            toast.error("Failed to update status");
        }
    };

    const statusIcon = { ACTIVE: ShieldCheck, BANNED: ShieldOff, SUSPENDED: ShieldAlert, DORMANT: UserX };
    const statusCls = { ACTIVE: "text-success", BANNED: "text-danger", SUSPENDED: "text-warning", DORMANT: "text-slate-400" };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-mono font-bold text-slate-100">Manage Users</h1>
                <div className="flex gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="input-field w-44"
                        onKeyDown={(e) => e.key === "Enter" && load()}
                    />
                    <button onClick={load} className="btn-secondary text-sm px-3">Search</button>
                </div>
            </div>

            {loading ? <Loader /> : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="table-header">Name</th>
                                <th className="table-header hidden md:table-cell">Email</th>
                                <th className="table-header">Role</th>
                                <th className="table-header">Status</th>
                                <th className="table-header text-right">Change Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr><td colSpan={5} className="table-cell text-center py-8 text-slate-500">No users found</td></tr>
                            )}
                            {users.map((u) => {
                                const Icon = statusIcon[u.status] ?? ShieldCheck;
                                return (
                                    <tr key={u.id} className="table-row">
                                        <td className="table-cell font-medium text-slate-200">{u.name}</td>
                                        <td className="table-cell hidden md:table-cell text-slate-400">{u.email}</td>
                                        <td className="table-cell"><span className="badge badge-primary">{u.role}</span></td>
                                        <td className="table-cell">
                                            <Icon size={14} className={`inline mr-1 ${statusCls[u.status]}`} />
                                            <span className={`text-sm ${statusCls[u.status]}`}>{u.status}</span>
                                        </td>
                                        <td className="table-cell text-right">
                                            <select
                                                value={u.status}
                                                onChange={(e) => changeStatus(u.id, e.target.value)}
                                                className="appearance-none bg-bg border border-border text-slate-300 text-xs rounded-input px-2 py-1 focus:outline-none focus:border-primary"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
