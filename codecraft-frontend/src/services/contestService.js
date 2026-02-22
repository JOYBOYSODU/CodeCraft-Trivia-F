import axiosInstance from "../api/axiosInstance";

export const contestService = {
    // Public / Player
    getContests: (params) => axiosInstance.get("/contests", { params }),
    getContest: (id) => axiosInstance.get(`/contests/${id}`),
    joinByInvite: (inviteCode) => axiosInstance.post(`/contests/join`, { inviteCode }),

    // Admin
    createContest: (data) => axiosInstance.post("/admin/contests", data),
    adminCreate: (data) => axiosInstance.post("/admin/contests", data),
    adminUpdate: (id, data) => axiosInstance.put(`/admin/contests/${id}`, data),
    adminGetAll: (params) => axiosInstance.get("/admin/contests", { params }),
    adminFreezeLeaderboard: (id, frozen) =>
        axiosInstance.patch(`/admin/contests/${id}/freeze`, { leaderboard_frozen: frozen }),
    adminEndContest: (id) => axiosInstance.post(`/admin/contests/${id}/end`),

    // Host
    hostCreate: (data) => axiosInstance.post("/host/contests", data),
    hostGetAll: () => axiosInstance.get("/host/contests"),
    hostGetOne: (id) => axiosInstance.get(`/host/contests/${id}`),

    // Leaderboard
    getLeaderboard: (contestId) => axiosInstance.get(`/leaderboard/${contestId}`),
};
