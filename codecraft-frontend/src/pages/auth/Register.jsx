import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";
import { Eye, EyeOff, Code2, UserPlus } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const defaultRole = location.state?.role ?? "PLAYER";

    const [role, setRole] = useState(defaultRole);
    const [form, setForm] = useState({ name: "", email: "", password: "", company_name: "", type: "", company_size: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) { toast.error("Name, email, and password required"); return; }
        if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        setLoading(true);
        try {
            await authService.register({ ...form, role });
            toast.success("Account created! Please sign in.");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message ?? "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "#0F172A" }}>
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <Code2 className="text-indigo-400" size={24} />
                        <span className="font-mono font-bold text-xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            CodeCraft
                        </span>
                    </Link>
                    <p className="text-slate-400 text-sm">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
                    {/* Role selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">I want to</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: "PLAYER", title: "Player", sub: "Compete in contests" },
                                { value: "HOST", title: "Company Host", sub: "Host hiring contests" },
                            ].map(({ value, title, sub }) => (
                                <button
                                    key={value} type="button" onClick={() => setRole(value)}
                                    className={`p-3 rounded-input border text-left transition-all ${role === value
                                            ? "border-indigo-500 bg-indigo-500/10 text-white"
                                            : "border-slate-700 text-slate-400 hover:border-slate-500"
                                        }`}
                                >
                                    <p className="font-semibold text-sm">{title}</p>
                                    <p className="text-xs opacity-70 mt-0.5">{sub}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Common fields */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                        <input value={form.name} onChange={(e) => set("name", e.target.value)}
                            className="input-field" placeholder="John Doe" autoComplete="name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                            className="input-field" placeholder="you@example.com" autoComplete="email" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <div className="relative">
                            <input type={showPw ? "text" : "password"} value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                                className="input-field pr-10" placeholder="Min. 8 characters" autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Host extra fields */}
                    {role === "HOST" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Name</label>
                                <input value={form.company_name} onChange={(e) => set("company_name", e.target.value)}
                                    className="input-field" placeholder="Acme Corp" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
                                    <select value={form.type} onChange={(e) => set("type", e.target.value)} className="input-field">
                                        <option value="">Select</option>
                                        {["STARTUP", "ENTERPRISE", "MNC", "PRODUCT", "SERVICE"].map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Team Size</label>
                                    <input value={form.company_size} onChange={(e) => set("company_size", e.target.value)}
                                        className="input-field" placeholder="50" />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <UserPlus size={15} />}
                        Create Account
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-400 hover:underline font-medium">Sign in</Link>
                    </p>
                </form>

                <p className="text-center text-xs text-slate-600">
                    <Link to="/" className="hover:text-slate-400 transition-colors">← Back to home</Link>
                </p>
            </div>
        </div>
    );
}
