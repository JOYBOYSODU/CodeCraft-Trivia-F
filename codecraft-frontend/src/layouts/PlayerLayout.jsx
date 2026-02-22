import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import WelcomeRecommendModal from "../components/practice/WelcomeRecommendModal";

export default function PlayerLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            const hasSeenRecommendations = localStorage.getItem(
                `ai_rec_seen_${user.id}`
            );

            // Show modal only on first login (player has never seen recommendations)
            if (!hasSeenRecommendations) {
                // Defer state update to avoid cascading render warning
                setTimeout(() => setShowWelcomeModal(true), 0);
                // Mark as seen for this session
                localStorage.setItem(`ai_rec_seen_${user.id}`, "true");
            }
        }
    }, [user?.id]);

    const handleViewRoadmap = () => {
        setShowWelcomeModal(false);
        navigate("/practice");
    };

    const handleDismiss = () => {
        setShowWelcomeModal(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-bg">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>

            {/* Welcome AI Recommendations Modal */}
            {user && (
                <WelcomeRecommendModal
                    isOpen={showWelcomeModal}
                    playerName={user.name || "Player"}
                    onViewRoadmap={handleViewRoadmap}
                    onDismiss={handleDismiss}
                />
            )}
        </div>
    );
}
