import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { problemService } from "../../services/problemService";

export default function HostManageProblems() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("all");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await problemService.hostGetAll();
                const data = res.data;
                setProblems(data?.content ?? data?.problems ?? data ?? []);
            } catch (err) {
                toast.error("Failed to load problems");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const filteredProblems = useMemo(() => {
        return problems.filter((p) => {
            const title = (p.title ?? "").toLowerCase();
            const matchesSearch = title.includes(searchTerm.toLowerCase());
            const matchesDifficulty =
                difficultyFilter === "all" ||
                (p.difficulty ?? "").toLowerCase() === difficultyFilter;
            return matchesSearch && matchesDifficulty;
        });
    }, [problems, searchTerm, difficultyFilter]);

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Problems</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F7E800]"
                        />
                    </div>

                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F7E800]"
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Difficulty</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Points</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td colSpan={4} className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded skeleton-line"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProblems.length === 0 ? (
                                <tr className="border-b border-gray-200">
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No problems found
                                    </td>
                                </tr>
                            ) : (
                                filteredProblems.map((problem) => (
                                    <tr key={problem.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{problem.title}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    (problem.difficulty ?? "").toLowerCase() === "easy"
                                                        ? "bg-green-100 text-green-700"
                                                        : (problem.difficulty ?? "").toLowerCase() === "medium"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {problem.difficulty ?? "UNKNOWN"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{problem.points ?? "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    problem.is_active === false || problem.isActive === false
                                                        ? "bg-gray-100 text-gray-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {problem.is_active === false || problem.isActive === false ? "Inactive" : "Active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
