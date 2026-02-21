import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
    token: "token",
    user: "user",
};

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

function readStoredAuth() {
    const localToken = localStorage.getItem(STORAGE_KEYS.token);
    const localUser = localStorage.getItem(STORAGE_KEYS.user);
    if (localToken && localUser) {
        return { token: localToken, user: localUser, storage: localStorage };
    }
    const sessionToken = sessionStorage.getItem(STORAGE_KEYS.token);
    const sessionUser = sessionStorage.getItem(STORAGE_KEYS.user);
    if (sessionToken && sessionUser) {
        return { token: sessionToken, user: sessionUser, storage: sessionStorage };
    }
    return null;
}

function clearStoredAuth() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.token);
    sessionStorage.removeItem(STORAGE_KEYS.user);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const stored = readStoredAuth();
        if (stored) {
            const payload = parseJwt(stored.token);
            if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
                const parsedUser = JSON.parse(stored.user);
                setToken(stored.token);
                setUser(parsedUser);
                setRole(parsedUser.role);
            } else {
                clearStoredAuth();
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((tokenStr, userData, options = {}) => {
        // Block banned / suspended accounts
        if (userData.status === "BANNED") {
            throw new Error("Your account has been banned. Please contact support.");
        }
        if (userData.status === "SUSPENDED") {
            throw new Error("Your account is suspended. Please contact support.");
        }
        clearStoredAuth();
        const storage = options.remember ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEYS.token, tokenStr);
        storage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
        setToken(tokenStr);
        setUser(userData);
        setRole(userData.role);
    }, []);

    const logout = useCallback(() => {
        clearStoredAuth();
        setToken(null);
        setUser(null);
        setRole(null);
        window.location.href = "/login";
    }, []);

    // Update stored user (e.g., after profile fetch)
    const updateUser = useCallback((updatedData) => {
        const merged = { ...user, ...updatedData };
        const stored = readStoredAuth();
        const storage = stored?.storage ?? localStorage;
        storage.setItem(STORAGE_KEYS.user, JSON.stringify(merged));
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
