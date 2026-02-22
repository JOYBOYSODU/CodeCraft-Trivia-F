import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import ErrorModal from "../../components/ErrorModal";
import { parseError } from "../../utils/errorHandler";
import toast from "react-hot-toast";
import { Eye, EyeOff, Code2, UserPlus } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const defaultRole = location.state?.role ?? "PLAYER";
    const initialRole = defaultRole === "HOST" ? "COMPANY" : defaultRole;

    const [role, setRole] = useState(initialRole);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [modalError, setModalError] = useState(null);

    const set = (f, v) => {
        setForm((p) => ({ ...p, [f]: v }));
        setErrors((prev) => ({ ...prev, [f]: undefined }));
    };

    const getStrength = (value) => {
        let score = 0;
        if (value.length >= 8) score += 1;
        if (/[A-Z]/.test(value)) score += 1;
        if (/[0-9]/.test(value)) score += 1;
        if (/[^A-Za-z0-9]/.test(value)) score += 1;
        return score;
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.name) nextErrors.name = "Full name is required";
        if (!form.email) nextErrors.email = "Email is required";
        if (!form.password) nextErrors.password = "Password is required";
        if (form.password && form.password.length < 8) nextErrors.password = "Password must be at least 8 characters";
        return nextErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        setLoading(true);
        try {
            if (role === "ADMIN") {
                await authService.registerAdmin({ 
                    name: form.name, 
                    email: form.email, 
                    password: form.password
                });
            } else if (role === "COMPANY" || role === "HOST") {
                await authService.registerCompany({
                    name: form.name,
                    email: form.email,
                    password: form.password
                });
            } else {
                await authService.register({ 
                    name: form.name, 
                    email: form.email, 
                    password: form.password 
                });
            }
            toast.success("Account created! Please sign in.");
            navigate("/login");
        } catch (err) {
            const parsedError = parseError(err);
            setModalError(parsedError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-bg">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <Code2 className="text-primary" size={24} />
                        <span className="font-mono font-bold text-xl text-gradient">
                            CommitArena
                        </span>
                    </Link>
                    <p className="text-slate-600 text-sm">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
                    {loading && <div className="skeleton skeleton-line" />}
                    <div className="card border-dashed">
                        <p className="text-sm text-slate-600">
                            {role === "ADMIN" ? (
                                <>
                                    Create an <span className="font-semibold text-slate-900">Admin</span> account.
                                    Host accounts must be created by an administrator.
                                </>
                            ) : role === "COMPANY" ? (
                                <>
                                    Company accounts are created by administrators only.
                                </>
                            ) : (
                                <>
                                    Register as a <span className="font-semibold text-slate-900">Player</span> to compete in contests.
                                </>
                            )}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">I want to</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: "PLAYER", title: "Player", sub: "Compete in contests", enabled: true },
                                { value: "COMPANY", title: "Company", sub: "Host contests", enabled: true },
                                { value: "ADMIN", title: "Admin", sub: "Platform management", enabled: true },
                            ].map(({ value, title, sub, enabled }) => (
                                <button
                                    key={value}
                                    type="button"
                                    disabled={!enabled}
                                    onClick={() => {
                                        setRole(value);
                                        setErrors({});
                                    }}
                                    aria-disabled={!enabled}
                                    className={`p-3 rounded-input border text-left transition-all ${value === role
                                            ? "border-black bg-yellow-300/40 text-black"
                                            : "border-slate-300 text-slate-600"
                                        } ${enabled ? "hover:border-slate-500" : "opacity-50 cursor-not-allowed"}`}
                                >
                                    <p className="font-semibold text-sm">{title}</p>
                                    <p className="text-xs opacity-70 mt-0.5">{sub}</p>
                                </button>
                            ))}
                        </div>
                    </div>



                    {/* Common fields */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                        <input value={form.name} onChange={(e) => set("name", e.target.value)}
                            className={`input-field ${errors.name ? "input-error" : ""}`} placeholder="John Doe" autoComplete="name" />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                            className={`input-field ${errors.email ? "input-error" : ""}`} placeholder="you@example.com" autoComplete="email" />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                            <input type={showPw ? "text" : "password"} value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                                className={`input-field pr-10 ${errors.password ? "input-error" : ""}`}
                                placeholder="Min. 8 characters" autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900">
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.password && <p className="form-error">{errors.password}</p>}
                        <div className="pw-meter">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <span
                                    key={i}
                                    className={`pw-bar ${getStrength(form.password) > i ? "is-active" : ""}`}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <UserPlus size={15} />}
                        Create Account
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-slate-900 hover:underline font-medium">Sign in</Link>
                    </p>
                </form>

                <p className="text-center text-xs text-slate-600">
                    <Link to="/" className="hover:text-slate-900 transition-colors">← Back to home</Link>
                </p>
            </div>

            <ErrorModal error={modalError} onClose={() => setModalError(null)} />
        </div>
    );
}
