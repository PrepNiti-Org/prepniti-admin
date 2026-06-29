"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../lib/api";
import {
    Search,
    Loader2,
    Calendar,
    Mail,
    MessageSquare,
    Tag,
    Trash2,
    Eye,
    CheckCircle2,
    Archive,
    RefreshCw,
    X,
    User,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    SortingState,
} from "@tanstack/react-table";

interface FeedbackUser {
    username: string;
    email: string;
}

interface Feedback {
    id: string;
    user_id?: string;
    user?: FeedbackUser;
    email: string;
    category: string;
    message: string;
    status: string;
    created_at: string;
}

interface FeedbackCounts {
    total: number;
    unread: number;
    read: number;
    resolved: number;
    archived: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    unread: { label: "Unread", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: AlertCircle },
    read: { label: "Read", color: "bg-muted text-muted-foreground border-border", icon: Eye },
    resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
    archived: { label: "Archived", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", icon: Archive },
};

const CATEGORY_COLORS: Record<string, string> = {
    bug: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    feature: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    general: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    complaint: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    suggestion: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

function getCategoryColor(category: string) {
    return CATEGORY_COLORS[category?.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
}

function FeedbackDrawer({
    feedback,
    onClose,
    onStatusChange,
    onDelete,
}: {
    feedback: Feedback;
    onClose: () => void;
    onStatusChange: (id: string, status: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}) {
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleStatus = async (status: string) => {
        setUpdating(true);
        await onStatusChange(feedback.id, status);
        setUpdating(false);
    };

    const handleDelete = async () => {
        if (!confirm("Delete this feedback permanently?")) return;
        setDeleting(true);
        await onDelete(feedback.id);
        setDeleting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative ml-auto w-full max-w-lg h-full bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-base font-bold tracking-tight">Feedback Detail</h2>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{feedback.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                            <StatusBadge status={feedback.status} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</p>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryColor(feedback.category)}`}>
                                <Tag className="h-2.5 w-2.5" />
                                {feedback.category}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">From</p>
                            <p className="text-xs font-medium flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {feedback.email || feedback.user?.email || "—"}
                            </p>
                            {feedback.user?.username && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <User className="h-2.5 w-2.5" /> @{feedback.user.username}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Received</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(feedback.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Message</p>
                        <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                            {feedback.message}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Update Status</p>
                        <div className="grid grid-cols-2 gap-2">
                            {(["read", "resolved", "archived", "unread"] as const).map((s) => {
                                const cfg = STATUS_CONFIG[s];
                                const Icon = cfg.icon;
                                const isActive = feedback.status === s;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => handleStatus(s)}
                                        disabled={isActive || updating}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? cfg.color : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}
                                    >
                                        {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border shrink-0">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete Feedback
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unread;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.color}`}>
            <Icon className="h-2.5 w-2.5" />
            {cfg.label}
        </span>
    );
}

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [counts, setCounts] = useState<FeedbackCounts>({ total: 0, unread: 0, read: 0, resolved: 0, archived: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selected, setSelected] = useState<Feedback | null>(null);
    const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);

    const load = useCallback((status?: string, category?: string, q?: string) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (status && status !== "all") params.set("status", status);
        if (category && category !== "all") params.set("category", category);
        if (q) params.set("q", q);

        api.get<{ feedback: Feedback[]; counts: FeedbackCounts }>(`/admin/feedback?${params.toString()}`)
            .then((res) => {
                setFeedback(res.data.feedback || []);
                setCounts(res.data.counts || { total: 0, unread: 0, read: 0, resolved: 0, archived: 0 });
            })
            .catch(() => toast.error("Failed to load feedback."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load(filterStatus, filterCategory, searchQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterCategory]);

    useEffect(() => {
        const timer = setTimeout(() => load(filterStatus, filterCategory, searchQuery), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleStatusChange = useCallback(async (id: string, status: string) => {
        try {
            await api.patch(`/admin/feedback/${id}/status`, { status });
            toast.success(`Marked as ${status}`);
            setFeedback((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
            if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
            load(filterStatus, filterCategory, searchQuery);
        } catch {
            toast.error("Failed to update status");
        }
    }, [selected, filterStatus, filterCategory, searchQuery, load]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await api.delete(`/admin/feedback/${id}`);
            toast.success("Feedback deleted");
            setFeedback((prev) => prev.filter((f) => f.id !== id));
            setSelected(null);
            load(filterStatus, filterCategory, searchQuery);
        } catch {
            toast.error("Failed to delete feedback");
        }
    }, [filterStatus, filterCategory, searchQuery, load]);

    const openDetail = useCallback(async (fb: Feedback) => {
        setSelected(fb);
        if (fb.status === "unread") {
            try {
                await api.get(`/admin/feedback/${fb.id}`);
                setFeedback((prev) => prev.map((f) => f.id === fb.id ? { ...f, status: "read" } : f));
                setSelected({ ...fb, status: "read" });
                load(filterStatus, filterCategory, searchQuery);
            } catch { /* silent */ }
        }
    }, [filterStatus, filterCategory, searchQuery, load]);

    const uniqueCategories = useMemo(() => Array.from(new Set(feedback.map((f) => f.category).filter(Boolean))), [feedback]);

    const columns = useMemo<ColumnDef<Feedback>[]>(() => [
        {
            accessorKey: "created_at",
            header: "Received",
            cell: ({ row }) => (
                <div className="text-muted-foreground font-mono whitespace-nowrap flex items-center gap-1.5 text-[11px]">
                    <Calendar className="h-3 w-3 text-muted-foreground/60" />
                    {new Date(row.original.created_at).toLocaleString()}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryColor(row.original.category)}`}>
                    <Tag className="h-2.5 w-2.5" />
                    {row.original.category}
                </span>
            ),
        },
        {
            id: "from",
            accessorFn: (row) => row.email || row.user?.email || "",
            header: "From",
            cell: ({ row }) => {
                const email = row.original.email || row.original.user?.email || "—";
                const username = row.original.user?.username;
                return (
                    <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3 text-muted-foreground" /> {email}
                        </span>
                        {username && (
                            <span className="text-[10px] text-muted-foreground">@{username}</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "message",
            header: "Message",
            cell: ({ row }) => (
                <p className="text-xs text-muted-foreground max-w-xs truncate flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                    {row.original.message}
                </p>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); openDetail(row.original); }}
                        className="h-7 px-2.5 flex items-center gap-1.5 text-[10px] font-semibold rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                    >
                        <Eye className="h-3 w-3" /> View
                    </button>
                    {row.original.status !== "resolved" && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(row.original.id, "resolved"); }}
                            className="h-7 px-2.5 flex items-center gap-1.5 text-[10px] font-semibold rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        >
                            <CheckCircle2 className="h-3 w-3" /> Resolve
                        </button>
                    )}
                </div>
            ),
        },
    ], [openDetail, handleStatusChange]);

    const table = useReactTable({
        data: feedback,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 15 } },
    });

    const statCards = [
        { label: "Total", value: counts.total, color: "text-foreground" },
        { label: "Unread", value: counts.unread, color: "text-blue-400" },
        { label: "Resolved", value: counts.resolved, color: "text-emerald-400" },
        { label: "Archived", value: counts.archived, color: "text-zinc-400" },
    ];

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="pb-4 border-b border-border flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">User Feedback</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Review, triage, and resolve feedback submitted by PrepNiti users.
                    </p>
                </div>
                <button
                    onClick={() => load(filterStatus, filterCategory, searchQuery)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted/50 transition-all cursor-pointer"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <Card key={s.label} className="cursor-pointer hover:border-primary/30 transition-all" onClick={() => setFilterStatus(s.label.toLowerCase() === "total" ? "all" : s.label.toLowerCase())}>
                        <CardContent className="p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <input
                        type="text"
                        placeholder="Search message or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-primary/10 text-foreground border border-primary/50 h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                    <option value="all">All Statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                    ))}
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-primary/10 text-foreground border border-primary/50 h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Feedback Submissions</CardTitle>
                    <CardDescription>Click a row or "View" to open the detail panel.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs">Loading feedback...</span>
                        </div>
                    ) : feedback.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground text-xs">
                            No feedback entries match your filters.
                        </div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs font-sans">
                                    <thead>
                                        {table.getHeaderGroups().map((hg) => (
                                            <tr key={hg.id} className="bg-muted/50 border-y border-border font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                                                {hg.headers.map((header, idx) => (
                                                    <th
                                                        key={header.id}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        className={`p-4 ${idx === 0 ? "pl-6" : ""} select-none cursor-pointer hover:bg-muted/80 transition-colors`}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                onClick={() => openDetail(row.original)}
                                                className={`hover:bg-muted/10 font-medium transition-colors cursor-pointer ${row.original.status === "unread" ? "bg-blue-500/[0.03]" : ""}`}
                                            >
                                                {row.getVisibleCells().map((cell, idx) => (
                                                    <td
                                                        key={cell.id}
                                                        className={`p-4 ${idx === 0 ? "pl-6" : ""}`}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>Rows per page:</span>
                                    <select
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                                        className="bg-primary/5 hover:bg-primary/10 border border-border rounded-xl px-2.5 py-1.5 cursor-pointer text-foreground focus:outline-none font-semibold text-xs"
                                    >
                                        {[10, 15, 25, 50].map((s) => (
                                            <option key={s} value={s}>{s}</option>
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
                                            className="px-3 py-1.5 border border-border rounded-xl bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 cursor-pointer font-bold text-xs"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className="px-3 py-1.5 border border-border rounded-xl bg-background text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 cursor-pointer font-bold text-xs"
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

            {selected && (
                <FeedbackDrawer
                    feedback={selected}
                    onClose={() => setSelected(null)}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
