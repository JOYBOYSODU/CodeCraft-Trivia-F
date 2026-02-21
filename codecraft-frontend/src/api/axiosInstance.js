import axios from "axios";

const STORAGE_KEYS = {
    token: "token",
    user: "user",
};

function parseJwt(token) {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function readToken() {
    return localStorage.getItem(STORAGE_KEYS.token) || sessionStorage.getItem(STORAGE_KEYS.token);
}

function clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.token);
    sessionStorage.removeItem(STORAGE_KEYS.user);
}

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: attach JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = readToken();
        if (token) {
            const payload = parseJwt(token);
            if (payload?.exp && payload.exp * 1000 <= Date.now()) {
                clearAuth();
                window.location.href = "/login";
                return Promise.reject(new Error("Session expired"));
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuth();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
