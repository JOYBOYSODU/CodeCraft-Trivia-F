import axiosInstance from "../api/axiosInstance";

export const playerService = {
    getMe: () => axiosInstance.get("/players/profile"),
    getStats: () => axiosInstance.get("/players/stats"),
    getLeaderboard: (page = 0, limit = 100) => axiosInstance.get("/leaderboard/global", { params: { page, limit } }),
};
