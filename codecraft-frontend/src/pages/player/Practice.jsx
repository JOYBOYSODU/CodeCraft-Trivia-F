import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { problemService } from "../../services/problemService";
import { submissionService } from "../../services/submissionService";
import { Search, CheckCircle, ArrowUpDown, Code2 } from "lucide-react";

const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD"];

const DIFF_CLS = {
    EASY: "difficulty-easy",
    MEDIUM: "difficulty-medium",
    HARD: "difficulty-hard",
};

function parseTags(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
}

function getAcceptanceRate(p) {
    if (p?.acceptance_rate != null) return p.acceptance_rate * 100;
    const accepted = p?.accepted_submissions ?? p?.accepted_count ?? 0;
    const total = p?.total_submissions ?? p?.submission_count ?? 0;
    if (!total) return null;
    return (accepted / total) * 100;
}

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

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, limit: 20 });
    const [pageSize, setPageSize] = useState(20);

    const totalPages = Math.max(1, Math.ceil(pagination.total / pageSize));

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const load = (pg = 1) => {
        setLoading(true);
        const params = { page: pg, limit: pageSize };
        if (difficulty !== "ALL") params.difficulty = difficulty.toLowerCase();
        if (search.trim()) params.search = search.trim();

        problemService.getProblems(params)
            .then((r) => {
                const data = r.data;
                const list = data?.problems ?? data?.content ?? data ?? [];
                setProblems(list);
                setPagination({
                    total: data?.pagination?.total ?? data?.total ?? list.length,
                    limit: data?.pagination?.limit ?? pageSize,
                });
                setPage(pg);
            })
            .catch(() => { setProblems([]); })
            .finally(() => setLoading(false));
    };

    // Reload when difficulty, pageSize change
    useEffect(() => {
        load(1);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (difficulty !== "ALL") next.set("difficulty", difficulty); else next.delete("difficulty");
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty, pageSize]);

    // Load solved set once
    useEffect(() => {
        submissionService.getSubmissions({ verdict: "ACCEPTED", limit: 500 })
            .then((r) => {
                const subs = r.data?.content ?? r.data ?? [];
                setSolvedIds(new Set(subs.map((s) => s.problem_id ?? s.problemId)));
            }).catch(() => { });
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (search.trim()) next.set("search", search); else next.delete("search");
            return next;
        });
        load(1);
    };

    const availableTags = useMemo(() => {
        const tagSet = new Set();
        problems.forEach((p) => parseTags(p.tags).forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).slice(0, 12);
    }, [problems]);

    const filteredProblems = useMemo(() => {
        let list = [...problems];
        if (statusFilter === "SOLVED") list = list.filter((p) => solvedIds.has(p.id));
        if (statusFilter === "UNSOLVED") list = list.filter((p) => !solvedIds.has(p.id));
        if (selectedTags.length > 0) {
            list = list.filter((p) => parseTags(p.tags).some((t) => selectedTags.includes(t)));
        }
        if (sortKey === "difficulty") {
            const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
            list.sort((a, b) => ((order[a.difficulty] ?? 2) - (order[b.difficulty] ?? 2)) * (sortDir === "asc" ? 1 : -1));
        }
        if (sortKey === "acceptance") {
            list.sort((a, b) => {
                const aR = getAcceptanceRate(a) ?? -1;
                const bR = getAcceptanceRate(b) ?? -1;
                return (aR - bR) * (sortDir === "asc" ? 1 : -1);
            });
        }
        return list;
    }, [problems, statusFilter, selectedTags, solvedIds, sortKey, sortDir]);

    const solvedCount = filteredProblems.filter((p) => solvedIds.has(p.id)).length;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code2 size={20} className="text-primary" />
                    <h1 className="text-2xl font-mono font-bold text-primary">Practice</h1>
                </div>
                <span className="text-xs font-mono" style={{ color: "#6B7280" }}>
                    <span className="font-semibold text-primary">{solvedCount}</span>
                    {" "}/ {filteredProblems.length} solved
                </span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">

                {/* Difficulty */}
                <div className="flex items-center gap-1 p-1 rounded-lg"
                    style={{ background: "rgba(11,11,11,0.05)", border: "1px solid rgba(11,11,11,0.1)" }}>
                    {DIFFICULTIES.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className="px-3 py-1 rounded text-xs font-semibold transition-all"
                            style={difficulty === d
                                ? { background: "#0B0B0B", color: "#fff" }
                                : { color: "#4B5563" }}
                        >
                            {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Status */}
                <div className="flex items-center gap-1 p-1 rounded-lg"
                    style={{ background: "rgba(11,11,11,0.05)", border: "1px solid rgba(11,11,11,0.1)" }}>
                    {["ALL", "SOLVED", "UNSOLVED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className="px-3 py-1 rounded text-xs font-semibold transition-all"
                            style={statusFilter === s
                                ? { background: "#0B0B0B", color: "#fff" }
                                : { color: "#4B5563" }}
                        >
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex gap-1.5 flex-1 max-w-xs ml-auto">
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

            {/* Tag chips */}
            {availableTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs" style={{ color: "#6B7280" }}>Tags:</span>
                    {availableTags.map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => setSelectedTags((prev) =>
                                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                )}
                                className="badge"
                                style={active
                                    ? { background: "#0B0B0B", color: "#F7E800", borderColor: "#0B0B0B" }
                                    : { background: "rgba(11,11,11,0.06)", color: "#4B5563", borderColor: "rgba(11,11,11,0.15)" }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Table */}
            <div className="card overflow-hidden p-0">
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(11,11,11,0.1)" }}>
                            <th className="table-header w-8">#</th>
                            <th className="table-header">Title</th>
                            <th className="table-header">
                                <button
                                    type="button"
                                    onClick={() => toggleSort("difficulty")}
                                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#6B7280" }}
                                >
                                    Difficulty <ArrowUpDown size={11} />
                                </button>
                            </th>
                            <th className="table-header text-right hidden md:table-cell">Points</th>
                            <th className="table-header text-right">
                                <button
                                    type="button"
                                    onClick={() => toggleSort("acceptance")}
                                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider ml-auto"
                                    style={{ color: "#6B7280" }}
                                >
                                    Accept% <ArrowUpDown size={11} />
                                </button>
                            </th>
                            <th className="table-header hidden lg:table-cell">Tags</th>
                            <th className="table-header text-right w-14">Done</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Skeleton */}
                        {loading && Array.from({ length: 8 }).map((_, i) => (
                            <tr key={`sk-${i}`} className="table-row">
                                <td className="table-cell p-3"><div className="skeleton skeleton-line" style={{ width: 20 }} /></td>
                                <td className="table-cell p-3"><div className="skeleton skeleton-line" style={{ width: "65%" }} /></td>
                                <td className="table-cell p-3"><div className="skeleton skeleton-line" style={{ width: 56 }} /></td>
                                <td className="table-cell p-3 text-right hidden md:table-cell"><div className="skeleton skeleton-line" style={{ width: 32, marginLeft: "auto" }} /></td>
                                <td className="table-cell p-3 text-right"><div className="skeleton skeleton-line" style={{ width: 40, marginLeft: "auto" }} /></td>
                                <td className="table-cell p-3 hidden lg:table-cell"><div className="skeleton skeleton-line" style={{ width: 80 }} /></td>
                                <td className="table-cell p-3 text-right"><div className="skeleton skeleton-line" style={{ width: 18, marginLeft: "auto" }} /></td>
                            </tr>
                        ))}

                        {/* Empty */}
                        {!loading && filteredProblems.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-14">
                                    <Code2 size={28} className="mx-auto mb-2" style={{ color: "#D1D5DB" }} />
                                    <p className="text-sm" style={{ color: "#6B7280" }}>No problems match your filters.</p>
                                    <button
                                        className="text-xs mt-1 underline text-primary"
                                        onClick={() => { setSearch(""); setDifficulty("ALL"); setStatusFilter("ALL"); setSelectedTags([]); load(1); }}
                                    >
                                        Reset all filters
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* Rows */}
                        {!loading && filteredProblems.map((p, i) => {
                            const isSolved = solvedIds.has(p.id);
                            const tags = parseTags(p.tags);
                            const rate = getAcceptanceRate(p);
                            return (
                                <tr
                                    key={p.id}
                                    className="table-row"
                                    style={isSolved ? { background: "rgba(16,185,129,0.05)" } : {}}
                                >
                                    <td className="table-cell p-3 font-mono text-xs" style={{ color: "#9CA3AF" }}>
                                        {(page - 1) * pageSize + i + 1}
                                    </td>
                                    <td className="table-cell p-3">
                                        <Link
                                            to={`/problems/${p.id}`}
                                            className="font-medium text-primary hover:underline transition-colors"
                                        >
                                            {p.title}
                                        </Link>
                                    </td>
                                    <td className="table-cell p-3">
                                        <span className={DIFF_CLS[p.difficulty?.toUpperCase()] ?? "badge badge-primary"}>
                                            {p.difficulty ? p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase() : "—"}
                                        </span>
                                    </td>
                                    <td className="table-cell p-3 text-right hidden md:table-cell font-mono text-sm font-semibold text-primary">
                                        {p.points ?? 0}
                                        <span className="text-xs font-normal ml-0.5" style={{ color: "#9CA3AF" }}>pts</span>
                                    </td>
                                    <td className="table-cell p-3 text-right font-mono text-xs" style={{ color: "#9CA3AF" }}>
                                        {rate == null ? "—" : `${rate.toFixed(1)}%`}
                                    </td>
                                    <td className="table-cell p-3 hidden lg:table-cell">
                                        <div className="flex gap-1 flex-wrap">
                                            {tags.slice(0, 2).map((t) => (
                                                <span key={t} className="badge badge-secondary" style={{ fontSize: "0.65rem" }}>{t}</span>
                                            ))}
                                            {tags.length > 2 && (
                                                <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>+{tags.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="table-cell p-3 text-right">
                                        {isSolved
                                            ? <CheckCircle size={15} className="ml-auto" style={{ color: "#10B981" }} />
                                            : <span className="w-4 h-4 rounded-full inline-block ml-auto border" style={{ borderColor: "#D1D5DB", display: "block" }} />
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: "#6B7280" }}>Rows per page:</span>
                    {[20, 50, 100].map((size) => (
                        <button
                            key={size}
                            onClick={() => setPageSize(size)}
                            className="px-2.5 py-1 rounded text-xs font-semibold transition-all"
                            style={pageSize === size
                                ? { background: "#0B0B0B", color: "#fff" }
                                : { background: "rgba(11,11,11,0.06)", color: "#4B5563" }}
                        >
                            {size}
                        </button>
                    ))}
                </div>

                {!loading && totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => load(page - 1)}
                            disabled={page <= 1}
                            className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                        >
                            ← Prev
                        </button>
                        <span className="text-xs font-mono" style={{ color: "#6B7280" }}>
                            Page <span className="font-semibold text-primary">{page}</span> / {totalPages}
                        </span>
                        <button
                            onClick={() => load(page + 1)}
                            disabled={page >= totalPages}
                            className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
