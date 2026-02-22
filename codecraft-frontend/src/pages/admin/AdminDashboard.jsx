import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, FileText, Trophy } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlayers: 0,
    totalHosts: 0,
    pendingApprovals: 0,
    activeContests: 0,
    totalProblems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response);
    } catch (err) {
      toast.error('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform, users, and content</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-blue-900">Total Users</h3>
              <Users size={20} className="text-blue-600" />
            </div>
            {loading ? (
              <div className="h-8 bg-blue-200 rounded skeleton-line"></div>
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-900 mb-2">{stats.totalUsers}</div>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-blue-700 hover:text-blue-900 text-sm font-medium"
                >
                  Manage Users →
                </button>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-yellow-900">Pending Approvals</h3>
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            {loading ? (
              <div className="h-8 bg-yellow-200 rounded skeleton-line"></div>
            ) : (
              <>
                <div className="text-3xl font-bold text-yellow-900 mb-2">{stats.pendingApprovals}</div>
                <button
                  onClick={() => navigate('/admin/approve-hosts')}
                  className="text-yellow-700 hover:text-yellow-900 text-sm font-medium"
                >
                  Review Requests →
                </button>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-purple-900">Total Problems</h3>
              <FileText size={20} className="text-purple-600" />
            </div>
            {loading ? (
              <div className="h-8 bg-purple-200 rounded skeleton-line"></div>
            ) : (
              <>
                <div className="text-3xl font-bold text-purple-900 mb-2">{stats.totalProblems}</div>
                <button
                  onClick={() => navigate('/admin/problems')}
                  className="text-purple-700 hover:text-purple-900 text-sm font-medium"
                >
                  Manage Problems →
                </button>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-green-900">Active Contests</h3>
              <Trophy size={20} className="text-green-600" />
            </div>
            {loading ? (
              <div className="h-8 bg-green-200 rounded skeleton-line"></div>
            ) : (
              <>
                <div className="text-3xl font-bold text-green-900 mb-2">{stats.activeContests}</div>
                <button
                  onClick={() => navigate('/admin/contests')}
                  className="text-green-700 hover:text-green-900 text-sm font-medium"
                >
                  Manage Contests →
                </button>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-emerald-900">Players</h3>
              <Users size={20} className="text-emerald-600" />
            </div>
            {loading ? (
              <div className="h-8 bg-emerald-200 rounded skeleton-line"></div>
            ) : (
              <div className="text-3xl font-bold text-emerald-900">{stats.totalPlayers}</div>
            )}
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-orange-900">Hosts</h3>
              <Users size={20} className="text-orange-600" />
            </div>
            {loading ? (
              <div className="h-8 bg-orange-200 rounded skeleton-line"></div>
            ) : (
              <div className="text-3xl font-bold text-orange-900">{stats.totalHosts}</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/problems')}
            className="bg-[#F7E800] hover:bg-yellow-400 text-gray-900 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-between"
          >
            <span>📚 Manage Problems</span>
            <span>→</span>
          </button>

          <button
            onClick={() => navigate('/admin/announcements')}
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-between"
          >
            <span>📢 Post Announcements</span>
            <span>→</span>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="bg-green-100 hover:bg-green-200 text-green-900 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-between"
          >
            <span>👥 Manage Users</span>
            <span>→</span>
          </button>

          <button
            onClick={() => navigate('/admin/contests')}
            className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-between"
          >
            <span>🏆 Manage Contests</span>
            <span>→</span>
          </button>

          <button
            onClick={() => navigate('/admin/approve-hosts')}
            className="bg-red-100 hover:bg-red-200 text-red-900 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-between"
          >
            <span>⚠️ Host Approvals</span>
            <span>→</span>
          </button>

          <button
            onClick={fetchDashboardStats}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-between"
          >
            <span>🔄 Refresh Stats</span>
            <span>→</span>
          </button>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Information</h2>
          <div className="space-y-3 text-gray-700">
            <p>• Use the Manage Users section to view all users and update their status</p>
            <p>• Post platform announcements that will be shown to users based on their role</p>
            <p>• Manage the problems bank and track which problems are used in contests</p>
            <p>• Review and approve new host accounts before they can create contests</p>
            <p>• Monitor active contests and manage contest approvals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
