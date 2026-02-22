import axiosInstance from "../api/axiosInstance";

export const submissionService = {
    submit: (data) => axiosInstance.post("/submissions", data),
    getSubmissions: (params) => axiosInstance.get("/submissions", { params }),
    getSubmission: (id) => axiosInstance.get(`/submissions/${id}`),
};