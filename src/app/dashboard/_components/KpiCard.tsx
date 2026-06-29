"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; label: string };
    icon: LucideIcon;
    iconColor?: string;
    delay?: number;
    onClick?: () => void;
}

export function KpiCard({ title, value, subtitle, trend, icon: Icon, iconColor = "text-primary", delay = 0, onClick }: KpiCardProps) {
    const TrendIcon = trend
        ? trend.value > 0
            ? TrendingUp
            : trend.value < 0
                ? TrendingDown
                : Minus
        : null;

    const trendColor = trend
        ? trend.value > 0
            ? "text-emerald-400"
            : trend.value < 0
                ? "text-rose-400"
                : "text-muted-foreground"
        : "";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm ${onClick ? "cursor-pointer hover:border-primary/40" : ""} transition-colors`}
        >
            <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-primary/5 blur-2xl" />

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        {title}
                    </p>
                    <p className="text-3xl font-black tracking-tight tabular-nums">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
                    )}
                    {trend && TrendIcon && (
                        <div className={`flex items-center gap-1 text-xs font-semibold mt-2 ${trendColor}`}>
                            <TrendIcon className="h-3 w-3" />
                            <span>{Math.abs(trend.value)} {trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ml-4`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </div>
        </motion.div>
    );
}
