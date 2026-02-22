import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { problemService } from "../../services/problemService";
import { submissionService } from "../../services/submissionService";
import { Search, CheckCircle, Code2, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD"];

const DIFFICULTY_STYLES = {
    EASY: {
        bg: "rgba(16, 185, 129, 0.1)",
        color: "#10B981",
        border: "rgba(16, 185, 129, 0.3)",
    },
    MEDIUM: {
        bg: "rgba(245, 158, 11, 0.1)",
        color: "#F59E0B",
        border: "rgba(245, 158, 11, 0.3)",
    },
    HARD: {
        bg: "rgba(239, 68, 68, 0.1)",
        color: "#EF4444",
        border: "rgba(239, 68, 68, 0.3)",
    },
};

function parseTags(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export default function Practice() {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [problems, setProblems] = useState([]);
    const [solvedIds, setSolvedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 20;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Load problems
    const loadProblems = async (pageNum = 1, diff = difficulty, searchQuery = search) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: pageNum,
                limit: pageSize,
            };

            if (diff && diff !== "ALL") {
                params.difficulty = diff.toUpperCase();
            }

            if (searchQuery && searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            const response = await problemService.getProblems(params);
            const data = response.data;

            if (data.success) {
                setProblems(data.problems || []);
                setTotal(data.pagination?.total || data.problems?.length || 0);
                setPage(pageNum);
            } else {
                setProblems([]);
                setTotal(0);
                setError(data.message || "Failed to load problems");
            }
        } catch (err) {
            setProblems([]);
            setTotal(0);
            setError(err.message || "Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    // Load solved problems (for logged-in users)
    const loadSolvedProblems = async () => {
        try {
            const response = await submissionService.getSubmissions({
                verdict: "ACCEPTED",
                limit: 500,
            });
            const submissions = response.data?.submissions || response.data?.content || response.data || [];
            if (Array.isArray(submissions)) {
                const solvedSet = new Set(submissions.map((s) => s.problem_id || s.problemId));
                setSolvedIds(solvedSet);
            }
        } catch {
            // Silently fail - user might not be logged in
        }
    };

    // Initial load
    useEffect(() => {
        loadProblems(1, difficulty, search);
        loadSolvedProblems();
    }, []);

    // Handle difficulty change
    const handleDifficultyChange = (diff) => {
        setDifficulty(diff);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (diff !== "ALL") {
                next.set("difficulty", diff);
            } else {
                next.delete("difficulty");
            }
            return next;
        });
        loadProblems(1, diff, search);
    };

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (search.trim()) {
                next.set("search", search);
            } else {
                next.delete("search");
            }
            return next;
        });
        loadProblems(1, difficulty, search);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearch("");
        setDifficulty("ALL");
        setStatusFilter("ALL");
        setSearchParams({});
        loadProblems(1, "ALL", "");
    };

    // Filter by status (client-side)
    const filteredProblems = useMemo(() => {
        let list = [...problems];
        if (statusFilter === "SOLVED") {
            list = list.filter((p) => solvedIds.has(p.id));
        } else if (statusFilter === "UNSOLVED") {
            list = list.filter((p) => !solvedIds.has(p.id));
        }
        return list;
    }, [problems, statusFilter, solvedIds]);

    // Count solved
    const solvedCount = useMemo(() => {
        return problems.filter((p) => solvedIds.has(p.id)).length;
    }, [problems, solvedIds]);

    return (

        <div className="min-h-screen p-6" style={{ background: "#FAFAFA" }}>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "#0B0B0B" }}
                        >
                            <Code2 size={20} color="#F7E800" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: "#0B0B0B" }}>
                                Practice
                            </h1>
                            <p className="text-sm" style={{ color: "#6B7280" }}>
                                Sharpen your coding skills
                            </p>
                        </div>
                    </div>
                    <div
                        className="px-4 py-2 rounded-lg"
                        style={{ background: "#0B0B0B", color: "#F7E800" }}
                    >
                        <span className="font-bold">{solvedCount}</span>
                        <span style={{ color: "#9CA3AF" }}> / {total} solved</span>
                    </div>
                </div>

                {/* Filters */}
                <div
                    className="p-4 rounded-xl flex flex-wrap items-center gap-4"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
                >
                    {/* Difficulty Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} style={{ color: "#6B7280" }} />
                        <div
                            className="flex rounded-lg p-1"
                            style={{ background: "#F3F4F6" }}
                        >
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => handleDifficultyChange(d)}
                                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                                    style={
                                        difficulty === d
                                            ? { background: "#0B0B0B", color: "#FFFFFF" }
                                            : { color: "#6B7280" }
                                    }
                                >
                                    {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div
                        className="flex rounded-lg p-1"
                        style={{ background: "#F3F4F6" }}
                    >
                        {["ALL", "SOLVED", "UNSOLVED"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                                style={
                                    statusFilter === s
                                        ? { background: "#0B0B0B", color: "#FFFFFF" }
                                        : { color: "#6B7280" }
                                }
                            >
                                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 ml-auto">
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: "#9CA3AF" }}
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search problems..."
                                className="pl-9 pr-4 py-2 rounded-lg text-sm w-64"
                                style={{
                                    background: "#F9FAFB",
                                    border: "1px solid #E5E7EB",
                                    outline: "none",
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{ background: "#0B0B0B", color: "#FFFFFF" }}
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        className="p-4 rounded-xl text-center"
                        style={{ background: "#FEE2E2", color: "#DC2626" }}
                    >
                        <p>{error}</p>
                        <button
                            onClick={() => loadProblems(1, difficulty, search)}
                            className="mt-2 underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Problems Table */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
                >
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#6B7280", width: "50px" }}
                                >
                                    #
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#6B7280" }}
                                >
                                    Title
                                </th>
                                <th
                                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#6B7280", width: "120px" }}
                                >
                                    Difficulty
                                </th>
                                <th
                                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#6B7280", width: "100px" }}
                                >
                                    Points
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell"
                                    style={{ color: "#6B7280" }}
                                >
                                    Tags
                                </th>
                                <th
                                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "#6B7280", width: "80px" }}
                                >
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Loading Skeleton */}
                            {loading &&
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr
                                        key={`skeleton-${i}`}
                                        style={{ borderBottom: "1px solid #F3F4F6" }}
                                    >
                                        <td className="px-4 py-4">
                                            <div
                                                className="h-4 w-6 rounded animate-pulse"
                                                style={{ background: "#E5E7EB" }}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div
                                                className="h-4 w-48 rounded animate-pulse"
                                                style={{ background: "#E5E7EB" }}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div
                                                className="h-6 w-16 rounded mx-auto animate-pulse"
                                                style={{ background: "#E5E7EB" }}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div
                                                className="h-4 w-12 rounded mx-auto animate-pulse"
                                                style={{ background: "#E5E7EB" }}
                                            />
                                        </td>
                                        <td className="px-4 py-4 hidden lg:table-cell">
                                            <div
                                                className="h-5 w-24 rounded animate-pulse"
                                                style={{ background: "#E5E7EB" }}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div
                                                className="h-5 w-5 rounded-full mx-auto animate-pulse"
                                                style={{ background: "#E5E7EB" }}
                                            />
                                        </td>
                                    </tr>
                                ))}

                            {/* Empty State */}
                            {!loading && filteredProblems.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center">
                                        <Code2
                                            size={40}
                                            className="mx-auto mb-3"
                                            style={{ color: "#D1D5DB" }}
                                        />
                                        <p
                                            className="text-lg font-medium"
                                            style={{ color: "#6B7280" }}
                                        >
                                            No problems found
                                        </p>
                                        <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
                                            Try adjusting your filters
                                        </p>
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                                            style={{ background: "#0B0B0B", color: "#FFFFFF" }}
                                        >
                                            Clear all filters
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {/* Problem Rows */}
                            {!loading &&
                                filteredProblems.map((problem, index) => {
                                    const isSolved = solvedIds.has(problem.id);
                                    const tags = parseTags(problem.tags);
                                    const diffStyle =
                                        DIFFICULTY_STYLES[problem.difficulty?.toUpperCase()] ||
                                        DIFFICULTY_STYLES.EASY;

                                    return (
                                        <tr
                                            key={problem.id}
                                            className="transition-colors hover:bg-gray-50"
                                            style={{
                                                borderBottom: "1px solid #F3F4F6",
                                                background: isSolved
                                                    ? "rgba(16, 185, 129, 0.03)"
                                                    : "transparent",
                                            }}
                                        >
                                            {/* Index */}
                                            <td
                                                className="px-4 py-4 font-mono text-sm"
                                                style={{ color: "#9CA3AF" }}
                                            >
                                                {(page - 1) * pageSize + index + 1}
                                            </td>

                                            {/* Title */}
                                            <td className="px-4 py-4">
                                                <Link
                                                    to={`/problems/${problem.id}`}
                                                    className="font-medium hover:underline"
                                                    style={{ color: "#0B0B0B" }}
                                                >
                                                    {problem.title}
                                                </Link>
                                            </td>

                                            {/* Difficulty */}
                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className="px-3 py-1 rounded-full text-xs font-semibold"
                                                    style={{
                                                        background: diffStyle.bg,
                                                        color: diffStyle.color,
                                                        border: `1px solid ${diffStyle.border}`,
                                                    }}
                                                >
                                                    {problem.difficulty
                                                        ? problem.difficulty.charAt(0) +
                                                        problem.difficulty.slice(1).toLowerCase()
                                                        : "Easy"}
                                                </span>
                                            </td>

                                            {/* Points */}
                                            <td
                                                className="px-4 py-4 text-center font-mono font-semibold"
                                                style={{ color: "#0B0B0B" }}
                                            >
                                                {problem.points || 100}
                                                <span
                                                    className="text-xs font-normal ml-1"
                                                    style={{ color: "#9CA3AF" }}
                                                >
                                                    pts
                                                </span>
                                            </td>

                                            {/* Tags */}
                                            <td className="px-4 py-4 hidden lg:table-cell">
                                                <div className="flex gap-1 flex-wrap">
                                                    {tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 rounded text-xs"
                                                            style={{
                                                                background: "#F3F4F6",
                                                                color: "#4B5563",
                                                            }}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {tags.length > 2 && (
                                                        <span
                                                            className="px-2 py-0.5 rounded text-xs"
                                                            style={{
                                                                background: "#0B0B0B",
                                                                color: "#F7E800",
                                                            }}
                                                        >
                                                            +{tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 text-center">
                                                {isSolved ? (
                                                    <CheckCircle
                                                        size={20}
                                                        className="mx-auto"
                                                        style={{ color: "#10B981" }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-5 h-5 rounded-full border-2 mx-auto"
                                                        style={{ borderColor: "#D1D5DB" }}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => loadProblems(page - 1, difficulty, search)}
                            disabled={page <= 1}
                            className="p-2 rounded-lg disabled:opacity-40 transition-colors"
                            style={{ background: "#F3F4F6" }}
                        >
                            <ChevronLeft size={20} style={{ color: "#6B7280" }} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => loadProblems(pageNum, difficulty, search)}
                                        className="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
                                        style={
                                            page === pageNum
                                                ? { background: "#0B0B0B", color: "#FFFFFF" }
                                                : { background: "#F3F4F6", color: "#6B7280" }
                                        }
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => loadProblems(page + 1, difficulty, search)}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg disabled:opacity-40 transition-colors"
                            style={{ background: "#F3F4F6" }}
                        >
                            <ChevronRight size={20} style={{ color: "#6B7280" }} />
                        </button>
                    </div>
                )}

                {/* Debug Info (Remove in production) */}
                <div
                    className="p-4 rounded-xl text-xs font-mono"
                    style={{ background: "#F3F4F6", color: "#6B7280" }}
                >
                    <p>🔍 Debug: API URL = {import.meta.env.VITE_API_BASE_URL || "NOT SET"}</p>
                    <p>📊 Total Problems: {total} | Current Page: {page} | Showing: {filteredProblems.length}</p>
                </div>
            </div>
        </div>
    );
}
