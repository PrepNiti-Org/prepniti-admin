"use client";

import { Calendar, User, HardDrive } from "lucide-react";
import Link from "next/link";

interface AuditLogUser {
    username: string;
    email: string;
}

interface AuditLog {
    id: string;
    action: string;
    details: string;
    created_at: string;
    user?: AuditLogUser;
}

interface RecentAuditLogsProps {
    data: AuditLog[];
}

const ACTION_COLORS: Record<string, string> = {
    ADMIN_LOGIN:     "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
    PDF_INGEST:      "border-cyan-500/30 text-cyan-400 bg-cyan-500/5",
    MOCK_COMPILE:    "border-indigo-500/30 text-indigo-400 bg-indigo-500/5",
    QUESTION_CREATE: "border-purple-500/30 text-purple-400 bg-purple-500/5",
    MOCK_DELETE:     "border-rose-500/30 text-rose-400 bg-rose-500/5",
};

export function RecentAuditLogs({ data }: RecentAuditLogsProps) {
    if (!data || data.length === 0) {
        return (
            <div className="py-8 text-center text-xs text-muted-foreground">
                No recent transaction logs found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="divide-y divide-border/60">
                {data.map((log) => {
                    const actionClass = ACTION_COLORS[log.action] || "border-border text-muted-foreground bg-muted/20";
                    return (
                        <div key={log.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                                <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider font-mono uppercase ${actionClass}`}>
                                    {log.action.replace("_", " ")}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap flex items-center gap-1">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {new Date(log.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-foreground/90 font-medium leading-relaxed flex items-start gap-1">
                                <HardDrive className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/50 shrink-0" />
                                <span className="line-clamp-2">{log.details}</span>
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                <User className="h-2.5 w-2.5" />
                                <span>{log.user?.username || "System Admin"}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Link
                href="/audit-logs"
                className="block text-center text-xs font-bold text-primary hover:underline pt-2 border-t border-border/40"
            >
                View All Audit Logs
            </Link>
        </div>
    );
}
