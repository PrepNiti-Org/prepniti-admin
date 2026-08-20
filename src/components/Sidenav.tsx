"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    Sliders,
    Layers,
    Menu,
    BarChart3,
    History,
    MessageSquare,
    LayoutDashboard,
    Users,
} from "lucide-react";

export interface NavGroup {
    title: string;
    items: {
        name: string;
        href: string;
        icon: React.ComponentType<{ className?: string }>;
    }[];
}

export const navGroups: NavGroup[] = [
    {
        title: "Overview",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "User Dashboards", href: "/users", icon: Users },
        ],
    },
    {
        title: "Test Papers & Content",
        items: [
            { name: "Mock Test Papers", href: "/manage", icon: Layers },
            { name: "Create Test Paper", href: "/assemble", icon: Sliders },
            { name: "PDF & AI Question Creator", href: "/upload", icon: UploadCloud },
        ],
    },
    {
        title: "Operations & Logs",
        items: [
            { name: "Attempts Analytics", href: "/analytics", icon: BarChart3 },
            { name: "User Feedback", href: "/feedback", icon: MessageSquare },
            { name: "System Audit Logs", href: "/audit-logs", icon: History },
        ],
    },
];

// Flat export for compatibility
export const navLinks = navGroups.flatMap(g => g.items);

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
            <div className={`h-14 flex items-center shrink-0 border-b border-sidebar-border/40 ${isCollapsed ? "justify-center" : "px-4 justify-between"}`}>
                {!isCollapsed && (
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Navigation
                    </span>
                )}
                <button
                    onClick={onToggle}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/75 hover:text-sidebar-foreground cursor-pointer transition-colors focus:outline-none"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-4 w-4 shrink-0" />
                </button>
            </div>

            <div className="flex-1 py-4 px-2 space-y-6 overflow-y-auto overflow-x-hidden">
                {navGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                        {!isCollapsed && (
                            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                {group.title}
                            </div>
                        )}
                        <div className="space-y-1">
                            {group.items.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;

                                return (
                                    <div key={link.name}>
                                        <Link
                                            href={link.href}
                                            onClick={onItemClick}
                                            className={`relative flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                                                isActive
                                                    ? "text-sidebar-primary-foreground font-bold"
                                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidenav-active-bg"
                                                    className="absolute inset-0 rounded-xl bg-sidebar-primary"
                                                    initial={false}
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                                />
                                            )}

                                            <Icon className={`relative z-10 h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />

                                            <AnimatePresence initial={false}>
                                                {!isCollapsed && (
                                                    <motion.span
                                                        initial={{ width: 0, opacity: 0 }}
                                                        animate={{ width: "auto", opacity: 1 }}
                                                        exit={{ width: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="relative z-10 whitespace-nowrap overflow-hidden tracking-normal"
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
                    </div>
                ))}
            </div>
        </aside>
    );
}
