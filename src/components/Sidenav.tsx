"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Sliders, Settings, Menu, BarChart3, History, MessageSquare, LayoutDashboard, Users, ShieldAlert } from "lucide-react";

export const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Dashboards", href: "/users", icon: Users },
    { name: "Chat Audit", href: "/chat-audit", icon: ShieldAlert },
    { name: "Ingest PDF", href: "/upload", icon: UploadCloud },
    { name: "Assemble Paper", href: "/assemble", icon: Sliders },
    { name: "Manage Mocks", href: "/manage", icon: Settings },
    { name: "Attempts Analytics", href: "/analytics", icon: BarChart3 },
    { name: "System Audit Logs", href: "/audit-logs", icon: History },
    { name: "User Feedback", href: "/feedback", icon: MessageSquare },
];

interface SidenavProps {
    className?: string;
    onItemClick?: () => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export function Sidenav({ className = "", onItemClick, isCollapsed = false, onToggle }: SidenavProps) {
    const pathname = usePathname();

    return (
        <aside className={`flex flex-col h-full bg-sidebar border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} ${className}`}>
            <div className={`h-14 flex items-center shrink-0 border-b border-transparent ${isCollapsed ? "justify-center" : "px-3"}`}>
                <button
                    onClick={onToggle}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/75 hover:text-sidebar-foreground cursor-pointer transition-colors focus:outline-none"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-5 w-5 shrink-0" />
                </button>
            </div>

            <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto overflow-x-hidden">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <div key={link.name}>
                            <Link
                                href={link.href}
                                onClick={onItemClick}
                                className={`relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive
                                    ? "text-sidebar-primary-foreground font-semibold"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidenav-active-bg"
                                        className="absolute inset-0 rounded-xl bg-sidebar-primary"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <Icon className={`relative z-10 h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? "scale-110 drop-shadow-sm" : "group-hover:scale-110"}`} />

                                <AnimatePresence initial={false}>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: "auto", opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative z-10 whitespace-nowrap overflow-hidden tracking-wide text-xs"
                                        >
                                            {link.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
