"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../lib/api";
import { Search, Loader2, Calendar, HardDrive, User, Globe, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    SortingState
} from "@tanstack/react-table";

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
    const [sorting, setSorting] = useState<SortingState>([
        { id: "created_at", desc: true } // Sort by newest by default
    ]);

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

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
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
    }, [logs, searchQuery, filterAction]);

    const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
        {
            accessorKey: "created_at",
            header: "Timestamp",
            cell: ({ row }) => (
                <div className="text-muted-foreground font-mono whitespace-nowrap flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {new Date(row.original.created_at).toLocaleString()}
                </div>
            )
        },
        {
            accessorKey: "action",
            header: "Operation",
            cell: ({ row }) => (
                <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[9px] uppercase border ${getActionBadgeColor(row.original.action)}`}>
                    {formatActionName(row.original.action)}
                </span>
            )
        },
        {
            id: "administrator",
            accessorFn: (row) => row.user?.username || "Admin",
            header: "Administrator",
            cell: ({ row }) => {
                const username = row.original.user?.username || "Admin";
                const email = row.original.user?.email || "Unknown";
                return (
                    <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" /> {username}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">{email}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "details",
            header: "Action Details",
            cell: ({ row }) => (
                <div className="flex items-start gap-1.5 leading-relaxed max-w-md font-sans">
                    <HardDrive className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/60 shrink-0" />
                    <span>{row.original.details}</span>
                </div>
            )
        },
        {
            accessorKey: "ip_address",
            header: "IP Address",
            cell: ({ row }) => (
                <div className="text-muted-foreground font-mono text-[10px] whitespace-nowrap flex items-center gap-1">
                    <Globe className="h-3 w-3 text-muted-foreground/60" />
                    {row.original.ip_address}
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data: filteredLogs,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

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
                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs font-sans">
                                    <thead>
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <tr key={headerGroup.id} className="bg-muted/50 border-y border-border font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                                                {headerGroup.headers.map((header, idx) => {
                                                    const isSorted = header.column.getIsSorted();
                                                    return (
                                                        <th
                                                            key={header.id}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            className={`p-4 ${idx === 0 ? 'pl-6' : ''} ${idx === headerGroup.headers.length - 1 ? 'pr-6' : ''} select-none cursor-pointer hover:bg-muted/80 transition-colors`}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                {header.column.getCanSort() && (
                                                                    <span>
                                                                        {isSorted === "asc" ? (
                                                                            <ChevronUp className="h-3 w-3 text-primary" />
                                                                        ) : isSorted === "desc" ? (
                                                                            <ChevronDown className="h-3 w-3 text-primary" />
                                                                        ) : (
                                                                            <ChevronsUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {table.getRowModel().rows.map(row => (
                                            <tr key={row.id} className="hover:bg-muted/10 font-medium transition-colors">
                                                {row.getVisibleCells().map((cell, idx) => (
                                                    <td
                                                        key={cell.id}
                                                        className={`p-4 ${idx === 0 ? 'pl-6' : ''} ${idx === row.getVisibleCells().length - 1 ? 'pr-6' : ''}`}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border gap-4 text-xs text-muted-foreground font-sans">
                                <div className="flex items-center gap-2">
                                    <span>Rows per page:</span>
                                    <select
                                        value={table.getState().pagination.pageSize}
                                        onChange={e => table.setPageSize(Number(e.target.value))}
                                        className="bg-primary/5 hover:bg-primary/10 border border-border rounded-xl px-2.5 py-1.5 cursor-pointer text-foreground focus:outline-none font-semibold text-xs transition-colors"
                                    >
                                        {[5, 10, 20, 50].map(pageSize => (
                                            <option key={pageSize} value={pageSize} className="bg-background">
                                                {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <span>
                                        Page <strong className="text-foreground">{table.getState().pagination.pageIndex + 1}</strong> of{" "}
                                        <strong className="text-foreground">{table.getPageCount()}</strong>
                                    </span>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            className="px-3 py-1.5 border border-border rounded-xl bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 cursor-pointer font-bold text-xs transition-all"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className="px-3 py-1.5 border border-border rounded-xl bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 cursor-pointer font-bold text-xs transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
