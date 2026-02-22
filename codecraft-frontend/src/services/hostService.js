import axiosInstance from "../api/axiosInstance";

export const hostService = {
    getMe: () => axiosInstance.get("/host/me"),
    getCompanyProfile: () => axiosInstance.get("/host/company/profile"),
    getContests: () => axiosInstance.get("/host/contests"),
    getParticipants: (contestId) => axiosInstance.get(`/host/contests/${contestId}/participants`),
    createContest: (data) => axiosInstance.post("/host/contests", data),
    createProblem: (data) => axiosInstance.post("/host/problems", data),
    shortlist: (contestId, participantId) =>
        axiosInstance.patch(`/host/contests/${contestId}/participants/${participantId}/shortlist`),
};
