"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Search, Loader2, Calendar, HardDrive, User, Globe } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";

interface AuditLog {
    id: string;
    user_id: string;
    user?: {
        username: string;
        email: string;
    };
    action: string;
    details: string;
    ip_address: string;
    created_at: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAction, setFilterAction] = useState("all");

    const loadAuditLogs = () => {
        setLoading(true);
        api.get<AuditLog[]>("/admin/audit-logs")
            .then(res => {
                setLogs(res.data || []);
            })
            .catch(() => {
                toast.error("Failed to load system transaction audit logs.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const username = log.user?.username || "Guest";
        const email = log.user?.email || "";
        const details = log.details || "";
        const action = log.action || "";

        const matchesSearch =
            username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            action.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAction = filterAction === "all" || action === filterAction;

        return matchesSearch && matchesAction;
    });

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case "ADMIN_LOGIN":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "PDF_INGEST":
                return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
            case "MOCK_COMPILE":
                return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            case "MOCK_RENAME":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "MOCK_DELETE":
                return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case "QUESTION_CREATE":
                return "bg-purple-500/10 text-purple-400 border-purple-500/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const formatActionName = (action: string) => {
        return action.replace("_", " ");
    };

    const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="pb-4 border-b border-border">
                <h1 className="text-2xl font-extrabold tracking-tight">System Audit Logs</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Trace secure administrative actions, mock creations, database schema operations, and login histories.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <input
                        type="text"
                        placeholder="Search logs by user or details..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                    <option value="all" className="bg-background">All Operations</option>
                    {uniqueActions.map(action => (
                        <option key={action} value={action} className="bg-background">
                            {formatActionName(action)}
                        </option>
                    ))}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Administrative Operations Log</CardTitle>
                    <CardDescription>Immutable transaction records from secure administrator API channels.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs">Fetching system audit logs...</span>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground font-sans text-xs">
                            No matching audit log entries found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs font-sans">
                                <thead>
                                    <tr className="bg-muted/50 border-y border-border font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                                        <th className="p-4 pl-6">Timestamp</th>
                                        <th className="p-4">Operation</th>
                                        <th className="p-4">Administrator</th>
                                        <th className="p-4">Action Details</th>
                                        <th className="p-4 pr-6">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-muted/10 font-medium transition-colors">
                                            <td className="p-4 pl-6 text-muted-foreground font-mono whitespace-nowrap flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[9px] uppercase border ${getActionBadgeColor(log.action)}`}>
                                                    {formatActionName(log.action)}
                                                </span>
                                            </td>
                                            <td className="p-4 font-semibold text-foreground">
                                                <div className="flex flex-col">
                                                    <span className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /> {log.user?.username || "Admin"}</span>
                                                    <span className="text-[10px] text-muted-foreground font-normal">{log.user?.email || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-foreground leading-relaxed max-w-md font-sans">
                                                <div className="flex items-start gap-1.5">
                                                    <HardDrive className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/60 shrink-0" />
                                                    <span>{log.details}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3 text-muted-foreground/60" />
                                                    {log.ip_address}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
