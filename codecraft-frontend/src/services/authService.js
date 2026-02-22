import axiosInstance from "../api/axiosInstance";

export const authService = {
    login: (data) => axiosInstance.post("/auth/login", data),
    loginCompany: (data) => axiosInstance.post("/auth/login-company", data),
    loginHost: (data) => axiosInstance.post("/auth/login-host", data),
    register: (data) => axiosInstance.post("/auth/register", data),
    registerCompany: (data) => axiosInstance.post("/auth/register-company", data),
    registerHost: (data) => axiosInstance.post("/auth/register-host", data),
    registerAdmin: (data) => axiosInstance.post("/auth/register-admin", data),
};
