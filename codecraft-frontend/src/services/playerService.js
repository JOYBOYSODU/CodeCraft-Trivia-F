import axiosInstance from "../api/axiosInstance";

export const playerService = {
    getMe: () => axiosInstance.get("/player/me"),
    getStats: () => axiosInstance.get("/player/stats"),
    getLeaderboard: (page = 0, size = 100) => axiosInstance.get("/player/leaderboard", { params: { page, size } }),
};
