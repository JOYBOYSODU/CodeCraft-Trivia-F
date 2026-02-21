import axiosInstance from "../api/axiosInstance";

export const announcementService = {
    getAnnouncements: (params) => axiosInstance.get("/announcements", { params }),
};
