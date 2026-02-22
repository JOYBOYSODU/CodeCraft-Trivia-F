import { publicApi } from "./api";
import axiosInstance from "../api/axiosInstance";

export const problemService = {
    // Public / Player — use publicAxios so expired JWT doesn't block the list
    getProblems: async (params = {}) => {
        try {
            const response = await publicApi.get("/problems", { params });
            return response;
        } catch (error) {
            console.error("❌ Get problems error:", error);
            throw error;
        }
    },

    getProblem: async (id) => {
        try {
            const response = await publicApi.get(`/problems/${id}`);
            return response;
        } catch (error) {
            console.error("❌ Get problem error:", error);
            throw error;
        }
    },

    // Aliases for compatibility
    getAllProblems: (params) => publicApi.get("/problems", { params }),
    getAll: (params) => publicApi.get("/problems", { params }),

    // Admin
    adminCreate: (data) => axiosInstance.post("/admin/problems", data),
    adminUpdate: (id, data) => axiosInstance.put(`/admin/problems/${id}`, data),
    adminDelete: (id) => axiosInstance.delete(`/admin/problems/${id}`),
    adminGetAll: (params) => axiosInstance.get("/admin/problems", { params }),

    // Generic create/update/delete (admin)
    createProblem: (data) => axiosInstance.post("/admin/problems", data),
    updateProblem: (id, data) => axiosInstance.put(`/admin/problems/${id}`, data),
    deleteProblem: (id) => axiosInstance.delete(`/admin/problems/${id}`),

    // Host
    hostCreate: (data) => axiosInstance.post("/host/problems", data),
    hostGetAll: () => axiosInstance.get("/host/problems"),
    hostUpdate: (id, data) => axiosInstance.put(`/host/problems/${id}`, data),
};

export default problemService;