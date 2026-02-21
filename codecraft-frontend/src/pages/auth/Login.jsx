import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";
import { Eye, EyeOff, Code2, LogIn } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
        setLoading(true);
        try {
            const res = await authService.login(form);
            const { token, user } = res.data;
            login(token, user);
            toast.success("Welcome back!");
            const dest = { ADMIN: "/admin", HOST: "/host", PLAYER: "/dashboard" }[user.role] ?? "/dashboard";
            navigate(dest, { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message ?? "Login failed";
            if (msg.toLowerCase().includes("banned")) toast.error("Account banned. Contact support.");
            else if (msg.toLowerCase().includes("suspended")) toast.error("Account suspended. Contact support.");
            else toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <Code2 className="text-indigo-400" size={24} />
                        <span className="font-mono font-bold text-xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            CodeCraft
                        </span>
                    </Link>
                    <p className="text-slate-400 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                        <input
                            type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                            className="input-field" placeholder="you@example.com" autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"} value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                                className="input-field pr-10" placeholder="••••••••" autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <LogIn size={15} />}
                        Sign In
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-indigo-400 hover:underline font-medium">Create one</Link>
                    </p>
                </form>

                <p className="text-center text-xs text-slate-600">
                    <Link to="/" className="hover:text-slate-400 transition-colors">← Back to home</Link>
                </p>
            </div>
        </div>
    );
}
