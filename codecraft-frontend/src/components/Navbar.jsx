import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Code2, User, ChevronDown, Settings, UserCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function TierBadge({ tier }) {
    const cls = {
        BRONZE: "tier-bronze",
        SILVER: "tier-silver",
        GOLD: "tier-gold",
    }[tier] ?? "badge badge-primary";
    return <span className={cls}>{tier}</span>;
}

function AvatarDropdown({ user, role, logout }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roleHome = role === "ADMIN" ? "/admin" : role === "HOST" ? "/host" : "/dashboard";
    const profileLink = role === "PLAYER" ? "/profile" : roleHome;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
                {user.profile_picture ? (
                    <img
                        src={user.profile_picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
                        <User size={16} className="text-yellow-600" />
                    </div>
                )}
                <span className="hidden sm:block text-sm text-slate-700 font-medium">
                    {user.name}
                </span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        {user.is_verified && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                                ✓ Verified
                            </span>
                        )}
                    </div>

                    <div className="py-1">
                        <Link
                            to={profileLink}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                        >
                            <UserCircle size={16} />
                            Profile
                        </Link>
                        
                        {role === "PLAYER" && (
                            <Link
                                to="/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                            >
                                <Settings size={16} />
                                Settings
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-slate-200 py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
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
                                        { to: "/ai-recommendations", label: "AI Recommendations" },
                                        { to: "/contests", label: "Contests" },
                                        { to: "/profile", label: "Profile" },
                                    ].map((l) => (
                                        <Link
                                            key={l.to}
                                            to={l.to}
                                            className={`px-3 py-1.5 rounded-input transition-colors duration-200 font-medium
                        ${location.pathname.startsWith(l.to)
                                                    ? "text-primary bg-primary/10"
                                                    : "text-slate-600 hover:text-black hover:bg-black/5"}`}
                                        >
                                            {l.label}
                                        </Link>
                                    ))}
                                </nav>
                            )}

                            {(role === "HOST" || role === "COMPANY") && (
                                <nav className="hidden md:flex items-center gap-1 text-sm">
                                    {[
                                        { to: "/host", label: "Dashboard" },
                                        { to: "/host/problems", label: "Problems" },
                                        { to: "/host/contests", label: "Contests" },
                                        { to: "/host/contests/create", label: "Create Contest" },
                                        { to: "/host/problems/create", label: "Create Problem" },
                                    ].map((l) => (
                                        <Link
                                            key={l.to}
                                            to={l.to}
                                            className={`px-3 py-1.5 rounded-input transition-colors duration-200 font-medium
                        ${location.pathname.startsWith(l.to)
                                                    ? "text-primary bg-primary/10"
                                                    : "text-slate-600 hover:text-black hover:bg-black/5"}`}
                                        >
                                            {l.label}
                                        </Link>
                                    ))}
                                </nav>
                            )}

                            {role === "ADMIN" && (
                                <nav className="hidden md:flex items-center gap-1 text-sm">
                                    {[
                                        { to: "/admin", label: "Dashboard" },
                                        { to: "/admin/users", label: "Users" },
                                        { to: "/admin/contests", label: "Contests" },
                                        { to: "/admin/problems", label: "Problems" },
                                        { to: "/admin/announcements", label: "Announcements" },
                                    ].map((l) => (
                                        <Link
                                            key={l.to}
                                            to={l.to}
                                            className={`px-3 py-1.5 rounded-input transition-colors duration-200 font-medium
                        ${location.pathname.startsWith(l.to)
                                                    ? "text-primary bg-primary/10"
                                                    : "text-slate-600 hover:text-black hover:bg-black/5"}`}
                                        >
                                            {l.label}
                                        </Link>
                                    ))}
                                </nav>
                            )}

                            <AvatarDropdown user={user} role={role} logout={logout} />
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
