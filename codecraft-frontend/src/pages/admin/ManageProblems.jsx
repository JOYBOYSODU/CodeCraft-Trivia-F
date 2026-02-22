import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { problemService } from '../../services/problemService';
import toast from 'react-hot-toast';

const ManageProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await problemService.getAllProblems();
      const data = response.data;
      setProblems(data?.content ?? data?.problems ?? data ?? response ?? []);
    } catch (err) {
      // Handle 404 gracefully - endpoint might not be implemented yet
      if (err.response?.status === 404) {
        setProblems([]);
      } else {
        toast.error('Failed to load problems');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      await problemService.deleteProblem(problemId);
      setProblems(problems.filter(p => p.id !== problemId));
      toast.success('Problem deleted');
    } catch (err) {
      toast.error('Failed to delete problem');
    }
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive);
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const startIdx = (currentPage - 1) * pageSize;
  const paginatedProblems = filteredProblems.slice(startIdx, startIdx + pageSize);
  const totalPages = Math.ceil(filteredProblems.length / pageSize);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Problems Bank</h1>
          <a
            href="/admin/problems/create"
            className="flex items-center gap-2 bg-[#F7E800] text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition no-underline"
          >
            <Plus size={20} />
            Create Problem
          </a>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F7E800]"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F7E800]"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F7E800]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F7E800]"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Difficulty</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acceptance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded skeleton-line"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedProblems.length === 0 ? (
                <tr className="border-b border-gray-200">
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No problems found
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((problem) => (
                  <tr key={problem.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{problem.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          problem.difficulty === 'easy'
                            ? 'bg-green-100 text-green-700'
                            : problem.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {problem.acceptanceRate ? `${problem.acceptanceRate.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          problem.isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {problem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => toast.info('Edit functionality coming soon')}
                        className="p-2 text-[#F7E800] hover:bg-yellow-50 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(problem.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIdx + 1} to {Math.min(startIdx + pageSize, filteredProblems.length)} of{' '}
              {filteredProblems.length} problems
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        currentPage === pageNum
                          ? 'bg-[#F7E800] text-gray-900'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProblems;
