import axiosInstance from "../api/axiosInstance";

export const authService = {
    login: (data) => axiosInstance.post("/auth/login", data),
    register: (data) => axiosInstance.post("/auth/register", data),
    registerAdmin: (data) => axiosInstance.post("/auth/register-admin", data),
};
