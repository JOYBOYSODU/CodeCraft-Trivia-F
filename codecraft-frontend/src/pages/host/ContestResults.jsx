import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Eye, Trophy, Users } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { hostService } from '../../services/hostService';
import toast from 'react-hot-toast';

const ContestResults = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shortlisted');
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchContestResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId]);

  const fetchContestResults = async () => {
    try {
      setLoading(true);
      const [contestRes, resultsRes] = await Promise.all([
        hostService.getContestById(contestId),
        hostService.getContestResults(contestId),
      ]);
      setContest(contestRes);
      setResults(resultsRes);
    } catch (err) {
      toast.error('Failed to load results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (resultId) => {
    try {
      const subs = await hostService.getSubmissions(contestId, resultId);
      setSubmissions(subs);
      setViewingSubmission(resultId);
    } catch {
      toast.error('Failed to load submissions');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Rank', 'Candidate', 'Email', 'Score', 'Problems Solved', 'Time (mins)', 'Status'];
      const rows = filteredResults.map((result, idx) => [
        idx + 1,
        result.candidateName,
        result.candidateEmail,
        result.score,
        result.problemsSolved,
        Math.round((new Date(result.submissionTime) - new Date(contest.startTime)) / 60000),
        result.isShortlisted ? 'SHORTLISTED' : 'NOT SHORTLISTED',
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contest.title}-results.csv`;
      a.click();
      toast.success('Results exported');
    } catch {
      toast.error('Failed to export results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-gray-200 rounded skeleton-line"></div>
            <div className="h-8 bg-gray-200 rounded skeleton-line w-48"></div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded skeleton-line mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Contest not found</p>
          <button
            onClick={() => navigate('/host/dashboard')}
            className="text-[#F7E800] font-semibold hover:text-yellow-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const shortlistedResults = results.filter(r => r.isShortlisted);
  const filteredResults = activeTab === 'shortlisted' ? shortlistedResults : results;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

  if (viewingSubmission) {
    const selectedResult = results.find(r => r.id === viewingSubmission);
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setViewingSubmission(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium"
          >
            ← Back to Results
          </button>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{selectedResult.candidateName}</h1>
            <p className="text-gray-600">{selectedResult.candidateEmail}</p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-[#F7E800]">{selectedResult.score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Problems Solved</p>
                <p className="text-2xl font-bold text-green-600">{selectedResult.problemsSolved}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${selectedResult.isShortlisted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                  }`}>
                  {selectedResult.isShortlisted ? 'SHORTLISTED' : 'NOT SHORTLISTED'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
            {submissions.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No submissions</p>
            ) : (
              submissions.map((sub, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{sub.problemTitle}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${sub.verdict === 'ACCEPTED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {sub.verdict}
                    </span>
                  </div>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{sub.code}</code>
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/host/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contest.title}</h1>
            <p className="text-gray-600">Results & Leaderboard</p>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="bg-gradient-to-r from-[#F7E800] to-yellow-400 rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-gray-900" />
            <div>
              <p className="text-sm text-gray-700 font-medium">Total Participants</p>
              <p className="text-3xl font-bold text-gray-900">{results.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-gray-900" />
            <div>
              <p className="text-sm text-gray-700 font-medium">Shortlisted</p>
              <p className="text-3xl font-bold text-gray-900">{shortlistedResults.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Eye size={24} className="text-gray-900" />
            <div>
              <p className="text-sm text-gray-700 font-medium">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900">{avgScore}</p>
            </div>
          </div>
        </div>

        {/* Tabs & Export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('shortlisted')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'shortlisted'
                  ? 'bg-[#F7E800] text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Shortlisted ({shortlistedResults.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'all'
                  ? 'bg-[#F7E800] text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Participants ({results.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Score</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Solved</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Time</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, idx) => (
                <tr key={result.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{result.candidateName}</div>
                    <div className="text-sm text-gray-500">{result.candidateEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-2xl font-bold text-[#F7E800]">
                    {result.score}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {result.problemsSolved}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700">
                    {Math.round((new Date(result.submissionTime) - new Date(contest.startTime)) / 60000)} min
                  </td>
                  <td className="px-6 py-4 text-center">
                    {result.isShortlisted ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        SHORTLISTED
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                        NOT SHORTLISTED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewSubmission(result.id)}
                      className="text-[#F7E800] hover:text-yellow-600 font-medium flex items-center justify-end gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredResults.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestResults;
