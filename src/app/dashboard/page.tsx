"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import {
    Users,
    BookOpen,
    HelpCircle,
    Activity,
    MessageSquare,
    Loader2,
    RefreshCw,
    ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { KpiCard } from "./_components/KpiCard";
import { AttemptsTrendChart } from "./_components/AttemptsTrendChart";
import { FeedbackDonutChart } from "./_components/FeedbackDonutChart";
import { FeedbackStatusBar } from "./_components/FeedbackStatusBar";
import { RecentFeedback } from "./_components/RecentFeedback";
import { RecentAuditLogs } from "./_components/RecentAuditLogs";

interface DashboardPayload {
    users: {
        total: number;
        new_week: number;
    };
    questions: {
        total: number;
    };
    papers: {
        total: number;
    };
    attempts: {
        total: number;
        avg_accuracy: number;
        week: number;
        trend: { date: string; count: number }[];
    };
    feedback: {
        total: number;
        unread: number;
        category_breakdown: { category: string; count: number }[];
        status_breakdown: { status: string; count: number }[];
    };
    recent_feedback: any[];
    recent_audit_logs: any[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardPayload | null>(null);
    const [loading, setLoading] = useState(true);

    const loadDashboard = () => {
        setLoading(true);
        api.get<DashboardPayload>("/admin/dashboard")
            .then((res) => {
                setData(res.data);
            })
            .catch(() => {
                toast.error("Failed to load dashboard metrics.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">
                    Aggregating platform metrics...
                </span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <ShieldAlert className="h-8 w-8 text-destructive" />
                <span className="text-sm font-semibold text-muted-foreground">
                    Unable to load platform data.
                </span>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="pb-4 border-b border-border flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold tracking-tight">Platform Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                        Overview of platform activity, user interactions, attempts, and feedback queues.
                    </p>
                </div>
                <button
                    onClick={loadDashboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted/50 transition-all cursor-pointer"
                >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard
                    title="Total Users"
                    value={data.users.total}
                    subtitle="Registered aspirants"
                    trend={{ value: data.users.new_week, label: "new this week" }}
                    icon={Users}
                    iconColor="text-blue-400"
                    delay={0.05}
                />
                <KpiCard
                    title="Mock Exams"
                    value={data.papers.total}
                    subtitle="Assembled question papers"
                    icon={BookOpen}
                    iconColor="text-violet-400"
                    delay={0.1}
                />
                <KpiCard
                    title="Total Questions"
                    value={data.questions.total}
                    subtitle="Active bank pool"
                    icon={HelpCircle}
                    iconColor="text-cyan-400"
                    delay={0.15}
                />
                <KpiCard
                    title="Test Attempts"
                    value={data.attempts.total}
                    subtitle={`Avg Accuracy: ${data.attempts.avg_accuracy}%`}
                    trend={{ value: data.attempts.week, label: "last 7 days" }}
                    icon={Activity}
                    iconColor="text-emerald-400"
                    delay={0.2}
                />
                <KpiCard
                    title="User Feedback"
                    value={data.feedback.total}
                    subtitle={`${data.feedback.unread} unread entries`}
                    icon={MessageSquare}
                    iconColor="text-amber-400"
                    delay={0.25}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Attempts Activity Curve</CardTitle>
                        <CardDescription>Daily mock exam submission count over the past 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AttemptsTrendChart data={data.attempts.trend} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Feedback Category Load</CardTitle>
                        <CardDescription>Distribution of feedback by category tags.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <FeedbackDonutChart data={data.feedback.category_breakdown} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Latest Feedback Queue</CardTitle>
                        <CardDescription>Recent feedback submissions needing triage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentFeedback data={data.recent_feedback} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Feedback Status Pipeline</CardTitle>
                        <CardDescription>Aggregated feedback statuses across database.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-full min-h-[220px]">
                        <FeedbackStatusBar data={data.feedback.status_breakdown} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Admin Activity Logs</CardTitle>
                        <CardDescription>Recent secure operations logged by admins.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentAuditLogs data={data.recent_audit_logs} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
