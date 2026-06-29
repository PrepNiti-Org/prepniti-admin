"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = Cookies.get("admin_token");
        const stored = localStorage.getItem("admin_user");
        if (token && stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.role === "admin") {
                    window.location.replace("/upload");
                }
            } catch (_) { }
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });

            if (data.user?.role !== "admin") {
                toast.error("Access Denied", {
                    description: "This workspace is restricted to administrator accounts only.",
                });
                setLoading(false);
                return;
            }

            Cookies.set("admin_token", data.token, {
                expires: 7,
                secure: window.location.protocol === "https:",
                sameSite: "strict",
            });
            localStorage.setItem("admin_user", JSON.stringify(data.user));

            toast.success(`Welcome, ${data.user.username}`, {
                description: "Admin workspace unlocked.",
            });
            window.location.replace("/upload");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } }; message?: string };
            toast.error("Login Failed", {
                description: error.response?.data?.error || error.message || "Invalid credentials.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none" />

            <div className="hidden bg-sidebar lg:flex flex-col justify-between p-10 text-sidebar-foreground border-r border-sidebar-border relative z-10">
                <div className="flex items-center text-lg font-bold tracking-tight gap-2">
                    <ShieldAlert className="h-5 w-5 text-sidebar-primary" />
                    <span>PrepNiti Admin Portal</span>
                </div>
                <div className="space-y-4">
                    <blockquote className="space-y-2 max-w-md">
                        <p className="text-lg font-medium leading-relaxed italic text-white/90">
                            &ldquo;The best way to find yourself is to lose yourself in the service of others.&rdquo;
                        </p>
                        <footer className="text-sm opacity-80 font-semibold">— Mahatma Gandhi</footer>
                    </blockquote>
                </div>
                <div className="text-xs opacity-50 font-mono">
                    © {new Date().getFullYear()} PrepNiti Operations Core.
                </div>
            </div>

            <div className="flex items-center justify-center py-12 relative z-10 min-h-screen lg:min-h-0 px-4">
                <div className="mx-auto w-full max-w-[360px] space-y-6 bg-card/65 backdrop-blur-md border border-border p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Sign In Admin
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Enter credentials to access administrative systems
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground block">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@prepniti.io"
                                required
                                className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-xs font-semibold text-muted-foreground block">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 pr-10 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email.trim() || !password.trim()}
                            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying access...
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4" />
                                    Verify credentials
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
