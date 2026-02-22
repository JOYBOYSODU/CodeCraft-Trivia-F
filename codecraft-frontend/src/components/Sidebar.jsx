import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard, Code, Trophy, User,
    Users, BookOpen, Swords, Megaphone, ShieldCheck,
    Building2, PlusCircle, ListChecks, BarChart2,
} from "lucide-react";

const playerLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/practice", icon: Code, label: "Practice" },
    { to: "/contests", icon: Swords, label: "Contests" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/profile", icon: User, label: "Profile" },
];

const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/approve-hosts", icon: ShieldCheck, label: "Host Approvals" },
    { to: "/admin/company-approvals", icon: Building2, label: "Company Approvals" },
    { to: "/admin/problems", icon: BookOpen, label: "Problems" },
    { to: "/admin/create-problem", icon: PlusCircle, label: "New Problem" },
    { to: "/admin/contests", icon: Swords, label: "Contests" },
    { to: "/admin/create-contest", icon: PlusCircle, label: "New Contest" },
    { to: "/admin/announcements", icon: Megaphone, label: "Announcements" },
];

const hostLinks = [
    { to: "/host", icon: Building2, label: "Dashboard" },
    { to: "/host/problems", icon: BookOpen, label: "Problems" },
    { to: "/host/problems/create", icon: PlusCircle, label: "New Problem" },
    { to: "/host/contests/create", icon: PlusCircle, label: "New Contest" },
    { to: "/host/contests", icon: ListChecks, label: "My Contests" },
];

function SidebarLink({ to, icon: Icon, label, end: endProp }) {

    const I = Icon; // to avoid warning but also keep JSX clean
    return (
        <NavLink
            to={to}
            end={endProp}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
            <I size={16} />
            <span>{label}</span>
        </NavLink>
    );
}

export default function Sidebar() {
    const { role } = useAuth();
    const links = role === "ADMIN" ? adminLinks : role === "HOST" ? hostLinks : playerLinks;

    return (
        <aside className="w-56 shrink-0 border-r border-slate-700 flex flex-col" style={{ background: "#1E293B" }}>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
                {links.map((l, i) => (
                    <SidebarLink
                        key={l.to}
                        {...l}
                        end={i === 0} // exact match for root-of-section links (dashboard, /admin, /host)
                    />
                ))}
            </nav>
        </aside>
    );
}
