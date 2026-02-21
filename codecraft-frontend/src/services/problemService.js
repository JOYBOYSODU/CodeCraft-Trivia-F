import axiosInstance from "../api/axiosInstance";

export const problemService = {
    // Public / Player
    getProblems: (params) => axiosInstance.get("/problems", { params }),
    getProblem: (id) => axiosInstance.get(`/problems/${id}`),

    // Admin
    adminCreate: (data) => axiosInstance.post("/admin/problems", data),
    adminUpdate: (id, data) => axiosInstance.put(`/admin/problems/${id}`, data),
    adminDelete: (id) => axiosInstance.delete(`/admin/problems/${id}`),
    adminGetAll: (params) => axiosInstance.get("/admin/problems", { params }),

    // Host
    hostCreate: (data) => axiosInstance.post("/host/problems", data),
    hostGetAll: () => axiosInstance.get("/host/problems"),
};
