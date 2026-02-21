import axiosInstance from "../api/axiosInstance";

export const adminService = {
  getAllUsers: (params) => axiosInstance.get("/admin/users", { params }),
  updateUserStatus: (id, status) =>
    axiosInstance.put(`/admin/users/${id}/status`, { status }),
  getDashboardStats: () => axiosInstance.get("/admin/stats"),
  createAnnouncement: (data) => axiosInstance.post("/admin/announcements", data),
  getAnnouncements: (params) => axiosInstance.get("/admin/announcements", { params }),
};
