import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { problemService } from "../../services/problemService";
import { submissionService } from "../../services/submissionService";
import { Search, CheckCircle, ArrowUpDown } from "lucide-react";

const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD"];
const DIFF_CLS = { EASY: "difficulty-easy", MEDIUM: "difficulty-medium", HARD: "difficulty-hard" };

export default function Practice() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [problems, setProblems] = useState([]);
    const [solvedIds, setSolvedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") ?? "ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const load = (pg = 0) => {
        setLoading(true);
        const params = { page: pg, size: pageSize };
        if (difficulty !== "ALL") params.difficulty = difficulty;
        if (search.trim()) params.search = search.trim();
        problemService.getAllProblems(params)
            .then((r) => {
                const data = r.data;
                const items = data?.content ?? data?.problems ?? data ?? [];
                setProblems(items);
                setTotalPages(data?.totalPages ?? 1);
                setPage(pg);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const timer = setTimeout(() => load(0), 350);
        return () => clearTimeout(timer);
    }, [search, difficulty, pageSize]);

    // Load solved set once
    useEffect(() => {
        submissionService.getSubmissions({ verdict: "ACCEPTED" })
            .then((r) => {
                const subs = r.data?.content ?? r.data ?? [];
                setSolvedIds(new Set(subs.map((s) => s.problem_id)));
            }).catch(() => { });
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ search, difficulty: difficulty !== "ALL" ? difficulty : "" });
        load(0);
    };

    const getAcceptanceRate = (problem) => {
        if (problem?.acceptance_rate != null) return problem.acceptance_rate * 100;
        const accepted = problem?.accepted_submissions ?? problem?.accepted_count ?? 0;
        const total = problem?.total_submissions ?? problem?.submission_count ?? 0;
        if (!total) return null;
        return (accepted / total) * 100;
    };

    const availableTags = useMemo(() => {
        const tagSet = new Set();
        problems.forEach((p) => (p.tags ?? []).forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).slice(0, 12);
    }, [problems]);

    const filteredProblems = useMemo(() => {
        let list = [...problems];
        if (statusFilter !== "ALL") {
            list = list.filter((p) => (statusFilter === "SOLVED" ? solvedIds.has(p.id) : !solvedIds.has(p.id)));
        }
        if (selectedTags.length > 0) {
            list = list.filter((p) => (p.tags ?? []).some((t) => selectedTags.includes(t)));
        }
        if (sortKey === "difficulty") {
            const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
            list.sort((a, b) => (order[a.difficulty] - order[b.difficulty]) * (sortDir === "asc" ? 1 : -1));
        }
        if (sortKey === "acceptance") {
            list.sort((a, b) => {
                const aRate = getAcceptanceRate(a) ?? -1;
                const bRate = getAcceptanceRate(b) ?? -1;
                return (aRate - bRate) * (sortDir === "asc" ? 1 : -1);
            });
        }
        return list;
    }, [problems, statusFilter, selectedTags, solvedIds, sortKey, sortDir]);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-mono font-bold text-slate-100">Practice</h1>
                <span className="text-xs text-slate-400">{filteredProblems.length} problems loaded</span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Difficulty tabs */}
                <div className="flex items-center gap-1">
                    {DIFFICULTIES.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${difficulty === d ? "bg-black text-white" : "bg-slate-100 text-slate-600 hover:text-black"
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                {/* Status filter */}
                <div className="flex items-center gap-1">
                    {["ALL", "SOLVED", "UNSOLVED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? "bg-black text-white" : "bg-slate-100 text-slate-600 hover:text-black"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex gap-1 flex-1 max-w-xs ml-auto">
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

            {availableTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">Tags:</span>
                    {availableTags.map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() =>
                                    setSelectedTags((prev) =>
                                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                    )
                                }
                                className={`chip ${active ? "chip-active" : ""}`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}

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
                                <th className="table-header text-right">Acceptance</th>
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
                                    <td className="table-cell text-right"><div className="skeleton" style={{ height: "12px", width: "40px", marginLeft: "auto" }} /></td>
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
                                <tr className="border-b border-border">
                                    <th className="table-header w-8">#</th>
                                    <th className="table-header">Title</th>
                                    <th className="table-header">
                                        <button
                                            type="button"
                                            className="table-sort"
                                            onClick={() => toggleSort("difficulty")}
                                        >
                                            Difficulty <ArrowUpDown size={12} />
                                        </button>
                                    </th>
                                    <th className="table-header text-right hidden md:table-cell">Points</th>
                                    <th className="table-header text-right">
                                        <button
                                            type="button"
                                            className="table-sort table-sort--right"
                                            onClick={() => toggleSort("acceptance")}
                                        >
                                            Acceptance <ArrowUpDown size={12} />
                                        </button>
                                    </th>
                                    <th className="table-header hidden lg:table-cell">Tags</th>
                                    <th className="table-header text-right w-16">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="table-cell text-center py-12 text-slate-500">
                                            No problems match your filter.{" "}
                                            <button onClick={() => { setSearch(""); setDifficulty("ALL"); setStatusFilter("ALL"); setSelectedTags([]); load(0); }}
                                                className="text-slate-900 hover:underline">Reset filters</button>
                                        </td>
                                    </tr>
                                )}
                                {filteredProblems.map((p, i) => {
                                    const solved = solvedIds.has(p.id);
                                    const rate = getAcceptanceRate(p);
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
                                            <td className="table-cell text-right text-slate-400 font-mono text-xs">
                                                {rate == null ? "—" : `${rate.toFixed(1)}%`}
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
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono">Rows</span>
                            {[20, 50, 100].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setPageSize(size)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${pageSize === size ? "bg-black text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => load(page - 1)} disabled={page === 0}
                                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                                <span className="text-xs text-slate-400 font-mono">Page {page + 1} / {totalPages}</span>
                                <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
