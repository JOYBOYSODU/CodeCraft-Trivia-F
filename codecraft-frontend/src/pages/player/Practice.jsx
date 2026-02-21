import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { problemService } from "../../services/problemService";
import { submissionService } from "../../services/submissionService";
import { Search, CheckCircle } from "lucide-react";

const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD"];
const DIFF_CLS = { EASY: "difficulty-easy", MEDIUM: "difficulty-medium", HARD: "difficulty-hard" };

export default function Practice() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [problems, setProblems] = useState([]);
    const [solvedIds, setSolvedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") ?? "ALL");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const load = (pg = 0) => {
        setLoading(true);
        const params = { page: pg, size: 20 };
        if (difficulty !== "ALL") params.difficulty = difficulty;
        if (search.trim()) params.search = search.trim();
        problemService.getAll(params)
            .then((r) => {
                const data = r.data;
                setProblems(data?.content ?? data ?? []);
                setTotalPages(data?.totalPages ?? 1);
                setPage(pg);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(0); }, [difficulty]);

    // Load solved set once
    useEffect(() => {
        submissionService.getSubmissions({ verdict: "ACCEPTED" })
            .then((r) => {
                const subs = r.data?.content ?? r.data ?? [];
                setSolvedIds(new Set(subs.map((s) => s.problem_id)));
            }).catch(() => { });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ search, difficulty: difficulty !== "ALL" ? difficulty : "" });
        load(0);
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-mono font-bold text-slate-100">Practice</h1>
                <span className="text-xs text-slate-400">{problems.length} problems loaded</span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Difficulty tabs */}
                <div className="flex items-center gap-1">
                    {DIFFICULTIES.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${difficulty === d ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-1 flex-1 max-w-xs ml-auto">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search problems…"
                        className="input-field text-sm"
                    />
                    <button type="submit" className="btn-secondary px-3">
                        <Search size={13} />
                    </button>
                </form>
            </div>

            {/* Table */}
            {loading ? (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="table-header w-8">#</th>
                                <th className="table-header">Title</th>
                                <th className="table-header">Difficulty</th>
                                <th className="table-header text-right hidden md:table-cell">Points</th>
                                <th className="table-header hidden lg:table-cell">Tags</th>
                                <th className="table-header text-right w-16">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <tr key={`practice-skeleton-${i}`} className="table-row">
                                    <td className="table-cell"><div className="skeleton" style={{ height: "12px", width: "18px" }} /></td>
                                    <td className="table-cell"><div className="skeleton" style={{ height: "12px", width: "70%" }} /></td>
                                    <td className="table-cell"><div className="skeleton" style={{ height: "12px", width: "60px" }} /></td>
                                    <td className="table-cell text-right hidden md:table-cell"><div className="skeleton" style={{ height: "12px", width: "30px", marginLeft: "auto" }} /></td>
                                    <td className="table-cell hidden lg:table-cell"><div className="skeleton" style={{ height: "12px", width: "90px" }} /></td>
                                    <td className="table-cell text-right"><div className="skeleton" style={{ height: "12px", width: "20px", marginLeft: "auto" }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <>
                    <div className="card overflow-hidden p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="table-header w-8">#</th>
                                    <th className="table-header">Title</th>
                                    <th className="table-header">Difficulty</th>
                                    <th className="table-header text-right hidden md:table-cell">Points</th>
                                    <th className="table-header hidden lg:table-cell">Tags</th>
                                    <th className="table-header text-right w-16">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="table-cell text-center py-12 text-slate-500">
                                            No problems found.{" "}
                                            <button onClick={() => { setSearch(""); setDifficulty("ALL"); load(0); }}
                                                className="text-indigo-400 hover:underline">Reset filters</button>
                                        </td>
                                    </tr>
                                )}
                                {problems.map((p, i) => {
                                    const solved = solvedIds.has(p.id);
                                    return (
                                        <tr key={p.id} className={`table-row ${solved ? "bg-emerald-900/10" : ""}`}>
                                            <td className="table-cell text-slate-500 font-mono text-xs">{i + 1 + page * 20}</td>
                                            <td className="table-cell">
                                                <Link
                                                    to={`/problems/${p.id}`}
                                                    className="font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                                                >
                                                    {p.title}
                                                </Link>
                                            </td>
                                            <td className="table-cell">
                                                <span className={`badge ${DIFF_CLS[p.difficulty] ?? "badge-primary"}`}>
                                                    {p.difficulty}
                                                </span>
                                            </td>
                                            <td className="table-cell text-right hidden md:table-cell text-slate-300 font-mono text-sm">
                                                {p.points}
                                            </td>
                                            <td className="table-cell hidden lg:table-cell">
                                                <div className="flex gap-1 flex-wrap">
                                                    {(p.tags ?? []).slice(0, 2).map((t) => (
                                                        <span key={t} className="badge badge-secondary text-xs">{t}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="table-cell text-right">
                                                {solved
                                                    ? <CheckCircle size={15} className="text-emerald-400 ml-auto" />
                                                    : <span className="w-4 h-4 border border-slate-600 rounded-full inline-block" />
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={() => load(page - 1)} disabled={page === 0}
                                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                            <span className="text-xs text-slate-400 font-mono">Page {page + 1} / {totalPages}</span>
                            <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
