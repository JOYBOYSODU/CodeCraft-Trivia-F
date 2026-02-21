import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// Decode JWT payload without a library
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

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
            const payload = parseJwt(storedToken);
            // Check token expiry
            if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                setRole(parsedUser.role);
            } else {
                // Expired — clear storage
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((tokenStr, userData) => {
        // Block banned / suspended accounts
        if (userData.status === "BANNED") {
            throw new Error("Your account has been banned. Please contact support.");
        }
        if (userData.status === "SUSPENDED") {
            throw new Error("Your account is suspended. Please contact support.");
        }
        localStorage.setItem("token", tokenStr);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(tokenStr);
        setUser(userData);
        setRole(userData.role);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setRole(null);
        window.location.href = "/login";
    }, []);

    // Update stored user (e.g., after profile fetch)
    const updateUser = useCallback((updatedData) => {
        const merged = { ...user, ...updatedData };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser(merged);
        setRole(merged.role);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, token, role, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
