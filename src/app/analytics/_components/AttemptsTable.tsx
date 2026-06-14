"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";

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
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs font-sans">
                            <thead>
                                <tr className="bg-muted/50 border-y border-border font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                                    <th className="p-4 pl-6">Date & Time</th>
                                    <th className="p-4">Paper Filename</th>
                                    <th className="p-4">Score</th>
                                    <th className="p-4">Percentage</th>
                                    <th className="p-4">Aspirant Username</th>
                                    <th className="p-4 pr-6">Aspirant Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {attempts.map((a) => {
                                    const pct = a.max_score > 0 ? Math.round((a.score / a.max_score * 100)) : 0;
                                    return (
                                        <tr key={a.id} className="hover:bg-muted/10 font-medium transition-colors">
                                            <td className="p-4 pl-6 text-muted-foreground font-mono">{new Date(a.attempted_at).toLocaleString()}</td>
                                            <td className="p-4 text-foreground font-bold">{a.exam_name}</td>
                                            <td className="p-4 font-mono">{a.score} / {a.max_score}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] border ${
                                                    pct >= 50 
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                }`}>
                                                    {pct}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-foreground font-semibold">{a.user?.username || "Guest Candidate"}</td>
                                            <td className="p-4 pr-6 text-muted-foreground font-mono text-[10px] truncate max-w-[150px]" title={a.user?.email || a.user_id}>
                                                {a.user?.email || a.user_id}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
