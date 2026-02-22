import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { playerService } from "../../services/playerService";
import { Trophy, Medal, Star, Shield, Search } from "lucide-react";

export default function GlobalLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        playerService.getLeaderboard(1, 100) // Changed page 0 to 1 as per backend logic
            .then((res) => setLeaderboard(res.data?.leaderboard ?? []))
            .catch(() => setLeaderboard([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredLeaderboard = leaderboard.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "12px" }} />
                        <div>
                            <div className="skeleton skeleton-line" style={{ width: "200px", height: "16px" }} />
                            <div className="skeleton skeleton-line" style={{ width: "250px", height: "12px", marginTop: "10px" }} />
                        </div>
                    </div>
                </div>
                <div className="card overflow-hidden p-0 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-slate-900/40">
                                <th className="table-header w-20 text-center">Rank</th>
                                <th className="table-header">Player</th>
                                <th className="table-header text-center w-32">Tier</th>
                                <th className="table-header text-right w-24">XP</th>
                                <th className="table-header text-right w-24">Solved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <tr key={`skeleton-${i}`} className="table-row">
                                    <td className="table-cell text-center"><div className="skeleton mx-auto" style={{ height: "20px", width: "24px" }} /></td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-4">
                                            <div className="skeleton rounded-full" style={{ height: "40px", width: "40px" }} />
                                            <div>
                                                <div className="skeleton" style={{ height: "14px", width: "140px", marginBottom: "6px" }} />
                                                <div className="skeleton" style={{ height: "12px", width: "90px" }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell"><div className="skeleton mx-auto" style={{ height: "24px", width: "64px", borderRadius: "99px" }} /></td>
                                    <td className="table-cell text-right"><div className="skeleton ml-auto" style={{ height: "14px", width: "48px" }} /></td>
                                    <td className="table-cell text-right"><div className="skeleton ml-auto" style={{ height: "14px", width: "32px" }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const getRankIcon = (rank) => {
        if (rank === 1) return (
            <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-yellow-500/30 blur-md rounded-full"></div>
                <Trophy className="text-yellow-400 drop-shadow-md relative z-10" size={28} />
            </div>
        );
        if (rank === 2) return (
            <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-slate-300/20 blur-md rounded-full"></div>
                <Medal className="text-slate-300 drop-shadow-md relative z-10" size={26} />
            </div>
        );
        if (rank === 3) return (
            <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-amber-700/30 blur-md rounded-full"></div>
                <Medal className="text-amber-600 drop-shadow-md relative z-10" size={26} />
            </div>
        );
        return <span className="text-slate-400 font-mono font-bold text-lg">{rank}</span>;
    };

    const getTierBadge = (tier) => {
        const t = tier || "BRONZE";
        const tierCls = {
            BRONZE: "border-orange-900/50 bg-orange-900/10 text-orange-400",
            SILVER: "border-slate-400/50 bg-slate-400/10 text-slate-300",
            GOLD: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
        }[t] ?? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400";
        return <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full border ${tierCls}`}>{t}</span>;
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-indigo-500/10">
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] flex-shrink-0">
                        <Trophy size={28} className="text-indigo-400" />
                        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                            Global Leaderboard
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 font-medium">Climb the ranks and earn your spot amongst the elite.</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-72 group">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors z-10" size={18} />
                    <input
                        type="text"
                        placeholder="Search players by name..."
                        className="input w-full pl-10 bg-slate-800/80 backdrop-blur-sm border border-slate-600 focus:border-indigo-400 focus:bg-slate-800 text-white placeholder:text-slate-300 shadow-sm relative z-10 transition-all rounded-lg py-2.5"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Leaderboard Table Container */}
            <div className="card overflow-hidden p-0 bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl relative">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-800/90 border-b border-slate-600 text-xs uppercase tracking-wider text-white font-bold shadow-sm">
                                <th className="py-4 pl-6 pr-4 text-center w-20">Rank</th>
                                <th className="py-4 px-4 text-left">Player</th>
                                <th className="py-4 px-4 text-center w-32">Tier</th>
                                <th className="py-4 px-4 text-right w-32">Overall XP</th>
                                <th className="py-4 pl-4 pr-6 text-right w-24">Solved</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filteredLeaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                                <Shield size={32} className="text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-slate-300 font-medium text-lg">
                                                    {searchTerm ? "No players match your search." : "The leaderboard is quiet... for now."}
                                                </p>
                                                <p className="text-slate-500 text-sm mt-1">Check back later once developers start competing!</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaderboard.map((player, idx) => {
                                    const rank = player.rank ?? idx + 1;
                                    const isTop3 = rank <= 3;
                                    return (
                                        <tr
                                            key={player.id || idx}
                                            className={`group hover:bg-white/[0.03] transition-all duration-300 ${isTop3 ? 'bg-gradient-to-r from-transparent to-transparent hover:to-white/[0.02]' : ''}`}
                                        >
                                            <td className="py-4 pl-6 pr-4 text-center align-middle">
                                                {getRankIcon(rank)}
                                            </td>
                                            <td className="py-4 px-4 align-middle">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm transition-transform group-hover:scale-105 ${isTop3 ? 'bg-gradient-to-br from-indigo-500/80 to-purple-600/80 text-white shadow-indigo-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                                                        {(player.name || player.username || "?").substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className={`font-semibold text-base tracking-wide transition-colors ${isTop3 ? 'text-black' : 'text-slate-300 group-hover:text-slate-200'}`}>
                                                            {player.name || player.username}
                                                        </div>
                                                        <div className="text-xs font-mono text-indigo-400 mt-0.5">
                                                            Level {player.level ?? 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center align-middle">
                                                {getTierBadge(player.tier)}
                                            </td>
                                            <td className="py-4 px-4 text-right align-middle">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Star size={14} className={`${isTop3 ? 'text-yellow-400' : 'text-indigo-400/70'}`} />
                                                    <span className={`font-mono text-base ${isTop3 ? 'text-black font-bold' : 'text-slate-300'}`}>
                                                        {(player.xp || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 pl-4 pr-6 text-right align-middle font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
                                                {player.total_solved || 0}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
