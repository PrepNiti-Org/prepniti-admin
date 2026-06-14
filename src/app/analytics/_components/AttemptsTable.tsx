"use client";

import React, { useState, useMemo } from "react";
import { Loader2, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    SortingState
} from "@tanstack/react-table";

interface Attempt {
    id: string;
    user_id: string;
    user?: {
        username: string;
        email: string;
    };
    exam_name: string;
    score: number;
    max_score: number;
    attempted_at: string;
}

interface AttemptsTableProps {
    attempts: Attempt[];
    loadingAttempts: boolean;
}

export function AttemptsTable({ attempts, loadingAttempts }: AttemptsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([
        { id: "attempted_at", desc: true } // Sort by newest attempts by default
    ]);

    const columns = useMemo<ColumnDef<Attempt>[]>(() => [
        {
            accessorKey: "attempted_at",
            header: "Date & Time",
            cell: ({ row }) => (
                <span className="text-muted-foreground font-mono">
                    {new Date(row.original.attempted_at).toLocaleString()}
                </span>
            )
        },
        {
            accessorKey: "exam_name",
            header: "Paper Filename",
            cell: ({ row }) => (
                <span className="text-foreground font-bold">{row.original.exam_name}</span>
            )
        },
        {
            id: "score",
            accessorFn: (row) => row.score,
            header: "Score",
            cell: ({ row }) => (
                <span className="font-mono">
                    {row.original.score} / {row.original.max_score}
                </span>
            )
        },
        {
            id: "percentage",
            accessorFn: (row) => row.max_score > 0 ? (row.score / row.max_score * 100) : 0,
            header: "Percentage",
            cell: ({ row }) => {
                const pct = row.original.max_score > 0 ? Math.round((row.original.score / row.original.max_score * 100)) : 0;
                return (
                    <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] border ${
                        pct >= 50 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                        {pct}%
                    </span>
                );
            }
        },
        {
            id: "username",
            accessorFn: (row) => row.user?.username || "Guest Candidate",
            header: "Aspirant Username",
            cell: ({ row }) => (
                <span className="text-foreground font-semibold">
                    {row.original.user?.username || "Guest Candidate"}
                </span>
            )
        },
        {
            id: "email",
            accessorFn: (row) => row.user?.email || row.user_id,
            header: "Aspirant Email",
            cell: ({ row }) => {
                const email = row.original.user?.email || row.original.user_id;
                return (
                    <span className="text-muted-foreground font-mono text-[10px] truncate max-w-[150px]" title={email}>
                        {email}
                    </span>
                );
            }
        }
    ], []);

    const table = useReactTable({
        data: attempts,
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
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Recent Test Attempts Log</CardTitle>
                <CardDescription>Auditing test records and statistics database.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {loadingAttempts ? (
                    <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Loading logs data...</span>
                    </div>
                ) : attempts.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground font-sans text-xs">
                        No test attempts recorded yet.
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
    );
}
