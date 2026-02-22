import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Layouts
import PlayerLayout from "../layouts/PlayerLayout";
import AdminLayout from "../layouts/AdminLayout";
import HostLayout from "../layouts/HostLayout";

// Auth pages
import Landing from "../pages/auth/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Player pages
import Dashboard from "../pages/player/Dashboard";
import Practice from "../pages/player/Practice";
import PracticePage from "../pages/player/PracticePage";
import Problem from "../pages/player/Problem";
import Contests from "../pages/player/Contests";
import ContestRoom from "../pages/player/ContestRoom";
import Leaderboard from "../pages/player/Leaderboard";
import Profile from "../pages/player/Profile";
import GlobalLeaderboard from "../pages/player/GlobalLeaderboard";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ApproveHosts from "../pages/admin/ApproveHosts";
import ManageProblems from "../pages/admin/ManageProblems";
import ManageContests from "../pages/admin/ManageContests";
import PostAnnouncement from "../pages/admin/PostAnnouncement";
import CompanyApprovals from "../pages/admin/CompanyApprovals";
import CreateProblem from "../pages/admin/CreateProblem";
import CreateContest from "../pages/admin/CreateContest";

// Host pages
import HostDashboard from "../pages/host/HostDashboard";
import HostCreateContest from "../pages/host/CreateContest";
import ContestResults from "../pages/host/ContestResults";
import HostManageProblems from "../pages/host/ManageProblems";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Player routes: guard → layout → pages */}
                <Route element={<ProtectedRoute allowedRoles={["PLAYER"]} />}>
                    <Route element={<PlayerLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/practice" element={<Practice />} />
                        <Route path="/ai-recommendations" element={<PracticePage />} />
                        <Route path="/problems/:id" element={<Problem />} />
                        <Route path="/contests" element={<Contests />} />
                        <Route path="/contests/:id" element={<ContestRoom />} />
                        <Route path="/leaderboard/:contestId" element={<Leaderboard />} />
                        <Route path="/leaderboard" element={<GlobalLeaderboard />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Admin routes: guard → layout → pages */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<ManageUsers />} />
                        <Route path="/admin/approve-hosts" element={<ApproveHosts />} />
                        <Route path="/admin/company-approvals" element={<CompanyApprovals />} />
                        <Route path="/admin/problems" element={<ManageProblems />} />
                        <Route path="/admin/create-problem" element={<CreateProblem />} />
                        <Route path="/admin/contests" element={<ManageContests />} />
                        <Route path="/admin/create-contest" element={<CreateContest />} />
                        <Route path="/admin/announcements" element={<PostAnnouncement />} />
                    </Route>
                </Route>

                {/* Host routes: guard → layout → pages */}
                <Route element={<ProtectedRoute allowedRoles={["HOST", "COMPANY"]} />}>
                    <Route element={<HostLayout />}>
                        <Route path="/host" element={<HostDashboard />} />
                        <Route path="/host/dashboard" element={<HostDashboard />} />
                        <Route path="/host/problems" element={<HostManageProblems />} />
                        <Route path="/host/create-contest" element={<HostCreateContest />} />
                        <Route path="/host/contest/:contestId/results" element={<ContestResults />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
