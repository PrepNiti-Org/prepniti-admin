"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";

import { MetricCards } from "./_components/MetricCards";
import { TrendChart } from "./_components/TrendChart";
import { AttemptsTable } from "./_components/AttemptsTable";

interface Attempt {
    id: string;
    user_id: string;
    user?: {
        username: string;
        email: string;
    };
    text_mapping?: string;
    exam_name: string;
    score: number;
    max_score: number;
    attempted_at: string;
}

export default function AnalyticsPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loadingAttempts, setLoadingAttempts] = useState(true);

    const loadAttempts = () => {
        setLoadingAttempts(true);
        api.get<Attempt[]>("/admin/attempts")
            .then(res => {
                setAttempts(res.data || []);
            })
            .catch(() => {
                toast.error("Failed to load student attempts log.");
            })
            .finally(() => {
                setLoadingAttempts(false);
            });
    };

    useEffect(() => {
        loadAttempts();
    }, []);

    const totalAttemptsCount = attempts.length;
    const avgAccuracy = totalAttemptsCount > 0
        ? Math.round(attempts.reduce((acc, curr) => acc + (curr.max_score > 0 ? (curr.score / curr.max_score * 100) : 0), 0) / totalAttemptsCount)
        : 0;
    const uniqueUsersCount = new Set(attempts.map(a => a.user_id)).size;

    const chartData = [...attempts]
        .reverse()
        .slice(-20)
        .map((a, idx) => ({
            name: `A-${idx + 1}`,
            score: a.max_score > 0 ? Math.round((a.score / a.max_score * 100)) : 0
        }));

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold tracking-tight">Attempts Analytics</h1>
                    <p className="text-muted-foreground text-sm">
                        Track mock exam stats, candidate attempt progress curves, and audit historical user scores.
                    </p>
                </div>
            </div>

            <MetricCards
                totalAttemptsCount={totalAttemptsCount}
                avgAccuracy={avgAccuracy}
                uniqueUsersCount={uniqueUsersCount}
            />

            {attempts.length > 0 && <TrendChart chartData={chartData} />}

            <AttemptsTable
                attempts={attempts}
                loadingAttempts={loadingAttempts}
            />
        </div>
    );
}
