import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Building2 } from "lucide-react";

export default function ApproveHosts() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        axiosInstance.get("/admin/hosts")
            .then((r) => setHosts(r.data?.content ?? r.data ?? []))
            .catch((err) => {
                // Handle 404 gracefully - endpoint might not be implemented yet
                if (err.response?.status === 404) {
                    setHosts([]);
                } else {
                    toast.error("Failed to load hosts");
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => load(), 0);
        return () => clearTimeout(timer);

    }, []);

    const approve = async (id) => {
        try {
            await axiosInstance.patch(`/admin/hosts/${id}/approve`);
            toast.success("Host approved");
            setHosts((prev) => prev.map((h) => h.id === id ? { ...h, status: "APPROVED" } : h));
        } catch { toast.error("Failed to approve host"); }
    };

    const reject = async (id) => {
        try {
            await axiosInstance.patch(`/admin/hosts/${id}/reject`);
            toast.success("Host rejected");
            load();
        } catch { toast.error("Failed to reject host"); }
    };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-mono font-bold text-slate-100">Approve Hosts</h1>
            {loading ? <Loader /> : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="table-header">Company</th>
                                <th className="table-header hidden md:table-cell">Type</th>
                                <th className="table-header hidden md:table-cell">Size</th>
                                <th className="table-header">Status</th>
                                <th className="table-header text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hosts.length === 0 && (
                                <tr><td colSpan={5} className="table-cell text-center py-8 text-slate-500">No host accounts</td></tr>
                            )}
                            {hosts.map((h) => (
                                <tr key={h.id} className="table-row">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-secondary" />
                                            <span className="font-medium text-slate-200">{h.company_name}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell hidden md:table-cell text-slate-400">{h.type}</td>
                                    <td className="table-cell hidden md:table-cell text-slate-400">{h.company_size}</td>
                                    <td className="table-cell">
                                        <span className={`badge ${h.status === "APPROVED" ? "badge-success" : h.status === "PENDING" ? "badge-warning" : "badge-danger"}`}>
                                            {h.status}
                                        </span>
                                    </td>
                                    <td className="table-cell text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {h.status !== "APPROVED" && (
                                                <button onClick={() => approve(h.id)} className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5">
                                                    <CheckCircle size={12} /> Approve
                                                </button>
                                            )}
                                            <button onClick={() => reject(h.id)} className="btn-danger flex items-center gap-1 text-xs px-3 py-1.5">
                                                <XCircle size={12} /> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
