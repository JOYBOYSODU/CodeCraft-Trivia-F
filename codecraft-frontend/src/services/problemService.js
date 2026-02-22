import { publicApi, privateApi } from "./api";

export const problemService = {
    // Get all problems (public)
    getProblems: async (params = {}) => {
        try {
            const response = await publicApi.get("/problems", { params });
            console.log("📦 Problems API Response:", response.data); // Debug
            return response;
        } catch (error) {
            console.error("❌ Get problems error:", error);
            throw error;
        }
    },

    // Get single problem (public)
    getProblem: async (id) => {
        try {
            const response = await publicApi.get(`/problems/${id}`);
            return response;
        } catch (error) {
            console.error("❌ Get problem error:", error);
            throw error;
        }
    },

    // Create problem (admin only)
    createProblem: async (data) => {
        return privateApi.post("/problems", data);
    },

    // Update problem (admin only)
    updateProblem: async (id, data) => {
        return privateApi.put(`/problems/${id}`, data);
    },

    // Delete problem (admin only)
    deleteProblem: async (id) => {
        return privateApi.delete(`/problems/${id}`);
    },
};

export default problemService;