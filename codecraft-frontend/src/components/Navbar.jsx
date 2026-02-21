import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Code2, User } from "lucide-react";

function TierBadge({ tier }) {
    const cls = {
        BRONZE: "tier-bronze",
        SILVER: "tier-silver",
        GOLD: "tier-gold",
    }[tier] ?? "badge badge-primary";
    return <span className={cls}>{tier}</span>;
}

export default function Navbar() {
    const { user, role, logout } = useAuth();
    const location = useLocation();

    const roleHome = role === "ADMIN" ? "/admin" : role === "HOST" ? "/host" : "/dashboard";

    return (
        <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-sm border-b border-border">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
                {/* Logo */}
                <Link to={user ? roleHome : "/"} className="flex items-center gap-2">
                    <Code2 className="text-primary" size={22} />
                    <span className="font-mono font-bold text-lg text-gradient">CodeCraft</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {role === "PLAYER" && (
                                <nav className="hidden md:flex items-center gap-1 text-sm">
                                    {[
                                        { to: "/dashboard", label: "Dashboard" },
                                        { to: "/practice", label: "Practice" },
                                        { to: "/contests", label: "Contests" },
                                        { to: "/profile", label: "Profile" },
                                    ].map((l) => (
                                        <Link
                                            key={l.to}
                                            to={l.to}
                                            className={`px-3 py-1.5 rounded-input transition-colors duration-200 font-medium
                        ${location.pathname.startsWith(l.to)
                                                    ? "text-primary bg-primary/10"
                                                    : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                                        >
                                            {l.label}
                                        </Link>
                                    ))}
                                </nav>
                            )}

                            <div className="flex items-center gap-2">
                                {user.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full border border-border object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                                        <User size={14} className="text-primary" />
                                    </div>
                                )}
                                <span className="hidden sm:block text-sm text-slate-300 font-medium">{user.name}</span>
                                {user.is_verified && (
                                    <span className="text-secondary text-xs">✓</span>
                                )}
                            </div>

                            <button
                                onClick={logout}
                                className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="btn-secondary text-sm px-3 py-1.5">Login</Link>
                            <Link to="/register" className="btn-primary  text-sm px-3 py-1.5">Sign Up</Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
