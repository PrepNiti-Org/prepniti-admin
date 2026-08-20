"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Sidenav } from "./Sidenav";
import { Loader2, LogOut, ShieldAlert, User as UserIcon, Menu } from "lucide-react";
import { Toaster } from "sonner";
import Link from "next/link";

import { ModeToggle } from "./theme/ModeToggle";

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { loading, isAuthenticated, user, logout } = useAdminAuth();
    const pathname = usePathname();
    const didRedirect = useRef(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isLoginPage = pathname === "/login";

    useEffect(() => {
        if (!loading && !isAuthenticated && !isLoginPage && !didRedirect.current) {
            didRedirect.current = true;
            window.location.replace("/login");
        }
    }, [loading, isAuthenticated, isLoginPage]);

    useEffect(() => {
        if (isAuthenticated) {
            didRedirect.current = false;
        }
    }, [isAuthenticated]);

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (loading || !isAuthenticated) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="text-sm font-semibold text-muted-foreground font-sans">
                        Verifying secure credentials...
                    </span>
                </div>
            </div>
        );
    }

    const avatarUrl = user?.username ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}` : "";
    const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "AD";

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
            <div className="fixed inset-0 -z-50 h-full w-full bg-background pointer-events-none">
                <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>
            </div>

            <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b bg-background/90 backdrop-blur-xl h-14 flex items-center shadow-sm shrink-0">
                <div className="w-full mx-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Link href="/upload" className="flex items-center gap-2 font-bold text-lg tracking-tight ml-2">
                            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent flex items-center gap-1.5 font-extrabold">
                                PrepNiti
                            </span>
                            <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                Admin Console
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <ModeToggle />
                        {user && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-muted-foreground">
                                    Signed in as <strong className="text-foreground">{user.username}</strong>
                                </span>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border hover:border-destructive hover:text-destructive-foreground hover:bg-destructive rounded-xl text-[11px] font-bold transition-all cursor-pointer text-muted-foreground"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="hidden md:flex flex-col shrink-0 border-r bg-background/50 backdrop-blur-xl transition-all duration-300">
                    <Sidenav isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
                </div>

                <main className="flex-1 overflow-y-auto relative py-8 px-4 sm:px-8">
                    {children}
                </main>
            </div>
            <Toaster position="top-right" theme="dark" richColors closeButton />
        </div>
    );
}
