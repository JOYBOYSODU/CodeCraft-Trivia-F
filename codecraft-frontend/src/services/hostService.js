import axiosInstance from "../api/axiosInstance";

export const hostService = {
    getMe: () => axiosInstance.get("/host/me"),
    getContests: () => axiosInstance.get("/host/contests"),
    getParticipants: (contestId) => axiosInstance.get(`/host/contests/${contestId}/participants`),
    shortlist: (contestId, participantId) =>
        axiosInstance.patch(`/host/contests/${contestId}/participants/${participantId}/shortlist`),
};
