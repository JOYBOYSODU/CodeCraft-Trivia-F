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
import Problem from "../pages/player/Problem";
import Contests from "../pages/player/Contests";
import ContestRoom from "../pages/player/ContestRoom";
import Leaderboard from "../pages/player/Leaderboard";
import Profile from "../pages/player/Profile";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ApproveHosts from "../pages/admin/ApproveHosts";
import CreateProblemAdmin from "../pages/admin/CreateProblem";
import ManageProblems from "../pages/admin/ManageProblems";
import CreateContestAdmin from "../pages/admin/CreateContest";
import ManageContests from "../pages/admin/ManageContests";
import PostAnnouncement from "../pages/admin/PostAnnouncement";

// Host pages
import HostDashboard from "../pages/host/HostDashboard";
import HostCreateProblem from "../pages/host/CreateProblem";
import HostCreateContest from "../pages/host/CreateContest";
import HostManageContest from "../pages/host/ManageContest";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Public: practice visible without login */}
                <Route element={<PlayerLayout />}>
                    <Route path="/practice" element={<Practice />} />
                </Route>

                {/* Player routes: guard → layout → pages */}
                <Route element={<ProtectedRoute allowedRoles={["PLAYER"]} />}>
                    <Route element={<PlayerLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/problems/:id" element={<Problem />} />
                        <Route path="/contests" element={<Contests />} />
                        <Route path="/contests/:id" element={<ContestRoom />} />
                        <Route path="/leaderboard/:contestId" element={<Leaderboard />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Admin routes: guard → layout → pages */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<ManageUsers />} />
                        <Route path="/admin/hosts" element={<ApproveHosts />} />
                        <Route path="/admin/problems" element={<ManageProblems />} />
                        <Route path="/admin/problems/create" element={<CreateProblemAdmin />} />
                        <Route path="/admin/problems/:id/edit" element={<CreateProblemAdmin />} />
                        <Route path="/admin/contests" element={<ManageContests />} />
                        <Route path="/admin/contests/create" element={<CreateContestAdmin />} />
                        <Route path="/admin/announcements" element={<PostAnnouncement />} />
                    </Route>
                </Route>

                {/* Host routes: guard → layout → pages */}
                <Route element={<ProtectedRoute allowedRoles={["HOST", "COMPANY"]} />}>
                    <Route element={<HostLayout />}>
                        <Route path="/host" element={<HostDashboard />} />
                        <Route path="/host/problems/create" element={<HostCreateProblem />} />
                        <Route path="/host/contests/create" element={<HostCreateContest />} />
                        <Route path="/host/contests" element={<HostManageContest />} />
                        <Route path="/host/contests/:id" element={<HostManageContest />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
