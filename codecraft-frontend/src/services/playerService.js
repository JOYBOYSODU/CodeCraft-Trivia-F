import axiosInstance from "../api/axiosInstance";

export const playerService = {
    getMe: () => axiosInstance.get("/player/me"),
    getStats: () => axiosInstance.get("/player/stats"),
};
