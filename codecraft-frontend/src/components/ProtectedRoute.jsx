import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const { user, role, isLoading } = useAuth();

    if (isLoading) return <Loader fullscreen text="Authenticating..." />;

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    // Render matched child routes via Outlet
    return <Outlet />;
}
