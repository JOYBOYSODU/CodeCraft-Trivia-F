import axiosInstance from "../api/axiosInstance";

export const problemService = {
    // Public / Player
    getProblems: (params) => axiosInstance.get("/problems", { params }),
    getProblem: (id) => axiosInstance.get(`/problems/${id}`),
    
    // Generic methods (try admin first, fallback to public)
    getAllProblems: (params) => axiosInstance.get("/problems", { params }),
    getAll: (params) => axiosInstance.get("/problems", { params }),
    createProblem: (data) => axiosInstance.post("/problems", data),
    updateProblem: (id, data) => axiosInstance.put(`/problems/${id}`, data),
    deleteProblem: (id) => axiosInstance.delete(`/problems/${id}`),

    // Admin
    adminCreate: (data) => axiosInstance.post("/problems", data),
    adminUpdate: (id, data) => axiosInstance.put(`/problems/${id}`, data),
    adminDelete: (id) => axiosInstance.delete(`/problems/${id}`),
    adminGetAll: (params) => axiosInstance.get("/problems", { params }),

    // Host
    hostCreate: (data) => axiosInstance.post("/host/problems", data),
    hostGetAll: () => axiosInstance.get("/host/problems"),
    hostUpdate: (id, data) => axiosInstance.put(`/host/problems/${id}`, data),
};
