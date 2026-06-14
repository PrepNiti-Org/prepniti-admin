"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
}

export function useAdminAuth() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = Cookies.get("admin_token");
        const storedUser = localStorage.getItem("admin_user");

        if (token && storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed && parsed.role === "admin") {
                    setUser(parsed);
                    setIsAuthenticated(true);
                }
            } catch (e) {
                console.error("Failed to parse admin session", e);
            }
        }
        setLoading(false);
    }, []);

    const logout = () => {
        Cookies.remove("admin_token");
        localStorage.removeItem("admin_user");
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = "/login";
    };

    return { user, loading, isAuthenticated, logout };
}
