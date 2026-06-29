"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../lib/api";
import {
    Search,
    Loader2,
    User,
    Mail,
    Calendar,
    ArrowRight,
    RefreshCw,
    ChevronsUpDown,
    ChevronUp,
    ChevronDown,
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
import Link from "next/link";

interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
}

export default function UsersListPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [pageCount, setPageCount] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 15,
    });

    const [sorting, setSorting] = useState<SortingState>([
        { id: "created_at", desc: true }
    ]);

    const loadUsers = useCallback((q?: string, pageIdx = 0, size = 15, currentSorting?: SortingState, roleFilter?: string) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", (pageIdx + 1).toString());
        params.set("limit", size.toString());
        if (q) params.set("q", q);
        if (roleFilter && roleFilter !== "all") params.set("role", roleFilter);

        const activeSort = currentSorting && currentSorting.length > 0 ? currentSorting[0] : null;
        if (activeSort) {
            params.set("sort_by", activeSort.id);
            params.set("sort_order", activeSort.desc ? "desc" : "asc");
        }

        api.get<{ users: UserProfile[]; total: number; page: number; limit: number }>(`/admin/users?${params.toString()}`)
            .then((res) => {
                setUsers(res.data.users || []);
                setTotalUsers(res.data.total || 0);
                setPageCount(Math.ceil((res.data.total || 0) / size));
            })
            .catch(() => {
                toast.error("Failed to load user list.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadUsers(searchQuery, pagination.pageIndex, pagination.pageSize, sorting, filterRole);
    }, [pagination.pageIndex, pagination.pageSize, sorting, filterRole, loadUsers]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            loadUsers(searchQuery, 0, pagination.pageSize, sorting, filterRole);
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, loadUsers, pagination.pageSize]);

    const columns = useMemo<ColumnDef<UserProfile>[]>(() => [
        {
            id: "username",
            accessorKey: "username",
            header: "User / Aspirant",
            cell: ({ row }) => (
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">@{row.original.username}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">ID: {row.original.id}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email Address",
            cell: ({ row }) => (
                <span className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    {row.original.email}
                </span>
            ),
        },
        {
            accessorKey: "role",
            header: "Role / Permission",
            cell: ({ row }) => (
                <span className="text-[9px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    {row.original.role || "user"}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Joined Date",
            cell: ({ row }) => (
                <span className="text-muted-foreground font-mono whitespace-nowrap flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    {new Date(row.original.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Link
                    href={`/users/${row.original.id}`}
                    className="h-7 px-3 flex items-center gap-1 text-[10px] font-bold rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all cursor-pointer bg-muted/20"
                >
                    Dashboard <ArrowRight className="h-3 w-3" />
                </Link>
            ),
        },
    ], []);

    const table = useReactTable({
        data: users,
        columns,
        pageCount,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="pb-4 border-b border-border flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">User Dashboards</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Review, search, and drill into individual aspirant profiles and preparation metrics.
                    </p>
                </div>
                <button
                    onClick={() => loadUsers(searchQuery, pagination.pageIndex, pagination.pageSize, sorting, filterRole)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted/50 transition-all cursor-pointer"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm items-center">
                <div className="relative flex items-center col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => {
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                        setFilterRole(e.target.value);
                    }}
                    className="bg-primary/10 text-foreground border border-primary/50 h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Registered Users Directory</CardTitle>
                    <CardDescription>Click "Dashboard" next to a user to open their personal stats panel.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs">Fetching users...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground text-xs">
                            No user profiles match your search criteria.
                        </div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs font-sans">
                                    <thead>
                                        {table.getHeaderGroups().map((hg) => (
                                            <tr key={hg.id} className="bg-muted/50 border-y border-border font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                                                {hg.headers.map((header, idx) => {
                                                    const isSorted = header.column.getIsSorted();
                                                    return (
                                                        <th
                                                            key={header.id}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            className={`p-4 ${idx === 0 ? "pl-6" : ""} select-none cursor-pointer hover:bg-muted/80 transition-colors`}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                {header.column.getCanSort() && (
                                                                    <span>
                                                                        {isSorted === "asc" ? (
                                                                            <ChevronUp className="h-3.5 w-3.5 text-primary" />
                                                                        ) : isSorted === "desc" ? (
                                                                            <ChevronDown className="h-3.5 w-3.5 text-primary" />
                                                                        ) : (
                                                                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
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
                                        {table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-muted/10 font-medium transition-colors"
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
                                        value={pagination.pageSize}
                                        onChange={(e) => {
                                            const size = Number(e.target.value);
                                            setPagination((prev) => ({ pageIndex: 0, pageSize: size }));
                                        }}
                                        className="bg-primary/5 hover:bg-primary/10 border border-border rounded-xl px-2.5 py-1.5 cursor-pointer text-foreground focus:outline-none font-semibold text-xs"
                                    >
                                        {[10, 15, 25, 50].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span>
                                        Page <strong className="text-foreground">{pagination.pageIndex + 1}</strong> of{" "}
                                        <strong className="text-foreground">{pageCount || 1}</strong>
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
        </div>
    );
}
