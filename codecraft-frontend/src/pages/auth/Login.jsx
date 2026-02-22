import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import ErrorModal from "../../components/ErrorModal";
import { parseError } from "../../utils/errorHandler";
import toast from "react-hot-toast";
import { Eye, EyeOff, Code2, LogIn } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(true);
    const [errors, setErrors] = useState({});
    const [modalError, setModalError] = useState(null);

    const set = (f, v) => {
        setForm((p) => ({ ...p, [f]: v }));
        setErrors((prev) => ({ ...prev, [f]: undefined, form: undefined }));
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.email) nextErrors.email = "Email is required";
        if (!form.password) nextErrors.password = "Password is required";
        return nextErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        setLoading(true);
        try {
            const res = await authService.login(form);
            const { token, user } = res.data;
            login(token, user, { remember });
            toast.success("Welcome back!");
            const dest = { ADMIN: "/admin", HOST: "/host", COMPANY: "/host", PLAYER: "/dashboard" }[user.role] ?? "/dashboard";
            navigate(dest, { replace: true });
        } catch (err) {
            const parsedError = parseError(err);
            setModalError(parsedError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-bg">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <Code2 className="text-primary" size={24} />
                        <span className="font-mono font-bold text-xl text-gradient">
                            CommitArena
                        </span>
                    </Link>
                    <p className="text-slate-600 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-4">
                    {loading && <div className="skeleton skeleton-line" />}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                            className={`input-field ${errors.email ? "input-error" : ""}`}
                            placeholder="you@example.com" autoComplete="email"
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"} value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                                className={`input-field pr-10 ${errors.password ? "input-error" : ""}`}
                                placeholder="••••••••" autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900">
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="accent-black"
                        />
                        Remember me
                    </label>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <LogIn size={15} />}
                        Sign In
                    </button>

                    {errors.form && <p className="form-error text-center">{errors.form}</p>}

                    <p className="text-center text-sm text-slate-600">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-slate-900 hover:underline font-medium">Create one</Link>
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
