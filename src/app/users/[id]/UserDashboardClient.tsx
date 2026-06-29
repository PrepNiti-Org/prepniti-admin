"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import {
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Calendar,
    Clock,
    CheckCircle2,
    Activity,
    MessageSquare,
    Trophy,
    TrendingUp,
    ShieldAlert,
    BookOpen,
    HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import Link from "next/link";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    bio?: string;
    created_at: string;
}

interface SubjectTime {
    subject: string;
    minutes: number;
}

interface Attempt {
    id: string;
    exam_name: string;
    score: number;
    max_score: number;
    attempted_at: string;
}

interface Feedback {
    id: string;
    category: string;
    message: string;
    status: string;
    created_at: string;
}

interface AuditLog {
    id: string;
    action: string;
    details: string;
    ip_address: string;
    created_at: string;
}

interface StatusBreakdown {
    status: string;
    count: number;
}

interface TypeBreakdown {
    type: string;
    minutes: number;
}

interface RecentLog {
    id: string;
    task_title: string;
    duration_minutes: number;
    note: string;
    logged_at: string;
}

interface UserDashboardPayload {
    user: UserProfile;
    study_tracker: {
        total_minutes: number;
        total_tasks: number;
        completed_tasks: number;
        subject_times: SubjectTime[];
        status_breakdown: StatusBreakdown[];
        type_breakdown: TypeBreakdown[];
        recent_logs: RecentLog[];
    };
    attempts: {
        total: number;
        avg_accuracy: number;
        max_accuracy: number;
        list: Attempt[];
    };
    feedbacks: Feedback[];
    audit_logs: AuditLog[];
}

const COLORS = [
    "hsl(15 100% 57%)",  // Primary orange
    "hsl(122 39% 50%)",  // Secondary green
    "hsl(262 83% 58%)",  // Purple
    "hsl(190 90% 45%)",  // Cyan
    "hsl(340 75% 55%)",  // Pink/Rose
    "hsl(43 96% 56%)",   // Yellow/Amber
];

export default function UserDashboardClient({ id }: { id: string }) {
    const [data, setData] = useState<UserDashboardPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get<UserDashboardPayload>(`/admin/users/${id}/dashboard`)
            .then((res) => {
                setData(res.data);
            })
            .catch(() => {
                toast.error("Failed to load aspirant dashboard.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">
                    Aggregating aspirant metrics...
                </span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <ShieldAlert className="h-8 w-8 text-destructive" />
                <span className="text-sm font-semibold text-muted-foreground">
                    Aspirant dashboard profile not found.
                </span>
                <Link href="/users" className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 mt-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to users list
                </Link>
            </div>
        );
    }

    const { user, study_tracker, attempts, feedbacks, audit_logs } = data;

    const studyHours = (study_tracker.total_minutes / 60).toFixed(1);
    const taskCompletionRate = study_tracker.total_tasks > 0
        ? Math.round((study_tracker.completed_tasks / study_tracker.total_tasks) * 100)
        : 0;

    const subjectChartData = (study_tracker.subject_times || []).map((s) => ({
        subject: s.subject || "Unassigned",
        hours: parseFloat((s.minutes / 60).toFixed(1)),
    }));

    const typeChartData = (study_tracker.type_breakdown || []).map((t) => ({
        type: t.type ? t.type.replace("_", " ").toLowerCase() : "general",
        hours: parseFloat((t.minutes / 60).toFixed(1)),
    }));

    const statusCounts = {
        todo: 0,
        in_progress: 0,
        done: 0,
    };
    (study_tracker.status_breakdown || []).forEach((s) => {
        const key = s.status.toLowerCase();
        if (key in statusCounts) {
            statusCounts[key as keyof typeof statusCounts] = s.count;
        }
    });

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
                <Link href="/users" className="text-xs text-muted-foreground hover:text-foreground font-bold flex items-center gap-1.5 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Users Directory
                </Link>
            </div>

            <Card className="relative overflow-hidden bg-card/70 backdrop-blur-md border border-border">
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                            <User className="h-7 w-7 text-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-black tracking-tight">
                                    @{user.username}
                                </h1>
                                <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                    {user.role || "User"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                                    {user.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {user.bio && (
                                <p className="text-xs text-muted-foreground/80 max-w-xl italic mt-1.5">
                                    "{user.bio}"
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:border-primary/20 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Study Time</p>
                            <p className="text-2xl font-black tracking-tight">{studyHours}h</p>
                            <p className="text-[10px] text-muted-foreground">Logged study timer hours</p>
                        </div>
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tracker Targets</p>
                            <p className="text-2xl font-black tracking-tight">{taskCompletionRate}%</p>
                            <p className="text-[10px] text-muted-foreground">{study_tracker.completed_tasks} completed of {study_tracker.total_tasks} total</p>
                        </div>
                        <div className="h-10 w-10 bg-violet-50/10 rounded-xl flex items-center justify-center border border-violet-500/10">
                            <CheckCircle2 className="h-5 w-5 text-violet-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Attempts Count</p>
                            <p className="text-2xl font-black tracking-tight">{attempts.total}</p>
                            <p className="text-[10px] text-muted-foreground">Completed mock exam attempts</p>
                        </div>
                        <div className="h-10 w-10 bg-cyan-50/10 rounded-xl flex items-center justify-center border border-cyan-500/10">
                            <Activity className="h-5 w-5 text-cyan-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Accuracy</p>
                            <p className="text-2xl font-black tracking-tight">{attempts.avg_accuracy}%</p>
                            <p className="text-[10px] text-muted-foreground">Peak accuracy score: {attempts.max_accuracy}%</p>
                        </div>
                        <div className="h-10 w-10 bg-emerald-50/10 rounded-xl flex items-center justify-center border border-emerald-500/10">
                            <Trophy className="h-5 w-5 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Subject Distribution</CardTitle>
                        <CardDescription>Total hours allocated per topic/subject.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subjectChartData.length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                No study logs registered for this user yet.
                            </div>
                        ) : (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectChartData} layout="vertical" margin={{ left: -15, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                        <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="subject" type="category" fontSize={10} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={75} />
                                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", fontSize: "12px" }} />
                                        <Bar dataKey="hours" name="Study Hours" radius={[0, 8, 8, 0]} barSize={14}>
                                            {subjectChartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Study Method Breakdown</CardTitle>
                        <CardDescription>Preparation style allocation (Reading, Practice, Revision, Test).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {typeChartData.length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                No study log types registered for this user yet.
                            </div>
                        ) : (
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={typeChartData} layout="vertical" margin={{ left: -15, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                        <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="type" type="category" fontSize={10} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" width={75} className="capitalize" />
                                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", fontSize: "12px" }} />
                                        <Bar dataKey="hours" name="Hours Spent" radius={[0, 8, 8, 0]} barSize={14}>
                                            {typeChartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Task Status Pipeline</CardTitle>
                        <CardDescription>Breakdown of targets coverages.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-3">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">To Do</span>
                                <span>{statusCounts.todo} tasks</span>
                            </div>
                            <div className="w-full bg-primary/10 rounded-full h-2">
                                <div
                                    className="bg-primary/40 h-2 rounded-full"
                                    style={{ width: `${study_tracker.total_tasks > 0 ? (statusCounts.todo / study_tracker.total_tasks) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-blue-400">In Progress</span>
                                <span>{statusCounts.in_progress} tasks</span>
                            </div>
                            <div className="w-full bg-blue-500/10 rounded-full h-2">
                                <div
                                    className="bg-blue-400 h-2 rounded-full"
                                    style={{ width: `${study_tracker.total_tasks > 0 ? (statusCounts.in_progress / study_tracker.total_tasks) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-emerald-400">Completed</span>
                                <span>{statusCounts.done} tasks</span>
                            </div>
                            <div className="w-full bg-emerald-500/10 rounded-full h-2">
                                <div
                                    className="bg-emerald-400 h-2 rounded-full"
                                    style={{ width: `${study_tracker.total_tasks > 0 ? (statusCounts.done / study_tracker.total_tasks) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Mock Exam History</CardTitle>
                        <CardDescription>Historical review of this student's exam performance metrics.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[220px] overflow-y-auto">
                        {(attempts.list || []).length === 0 ? (
                            <div className="py-16 text-center text-xs text-muted-foreground font-sans">
                                No exam attempts recorded.
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left text-xs font-sans">
                                <thead className="sticky top-0 bg-card border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                                    <tr>
                                        <th className="p-3 pl-5">Exam Paper</th>
                                        <th className="p-3">Accuracy</th>
                                        <th className="p-3">Raw Score</th>
                                        <th className="p-3 pr-5">Attempted Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {(attempts.list || []).map((attempt) => {
                                        const accuracy = attempt.max_score > 0
                                            ? Math.round((attempt.score / attempt.max_score) * 100)
                                            : 0;
                                        return (
                                            <tr key={attempt.id} className="hover:bg-muted/10 font-medium text-foreground/80">
                                                <td className="p-3 pl-5 font-semibold text-foreground">{attempt.exam_name}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${accuracy >= 70 ? "bg-emerald-500/10 text-emerald-400" : accuracy >= 45 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                                                        {accuracy}%
                                                    </span>
                                                </td>
                                                <td className="p-3 font-mono">{attempt.score} / {attempt.max_score}</td>
                                                <td className="p-3 pr-5 text-muted-foreground">{new Date(attempt.attempted_at).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <MessageSquare className="h-4.5 w-4.5 text-primary" /> Submitted Feedback
                        </CardTitle>
                        <CardDescription>Support requests submitted by @{user.username}.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto space-y-4">
                        {(feedbacks || []).length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                No feedback entries filed by this user.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {(feedbacks || []).map((f) => (
                                    <div key={f.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/5">
                                                {f.category}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground font-mono">
                                                {new Date(f.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-foreground/80 leading-relaxed font-sans">{f.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Clock className="h-4.5 w-4.5 text-primary" /> Study Logs & Notes
                        </CardTitle>
                        <CardDescription>Learning logs submitted by @{user.username}.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto space-y-4">
                        {(study_tracker.recent_logs || []).length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                No study tracker entries logged yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {(study_tracker.recent_logs || []).map((log) => (
                                    <div key={log.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                                                {log.task_title}
                                            </span>
                                            <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 font-bold shrink-0 font-mono">
                                                {log.duration_minutes}m
                                            </span>
                                        </div>
                                        {log.note && (
                                            <p className="text-xs text-muted-foreground/90 font-medium italic">
                                                "{log.note}"
                                            </p>
                                        )}
                                        <span className="text-[9px] text-muted-foreground font-mono block pt-0.5">
                                            Logged: {new Date(log.logged_at).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <HardDrive className="h-4.5 w-4.5 text-primary" /> Audit Activity
                        </CardTitle>
                        <CardDescription>Historical operational log trace for this account.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-y-auto">
                        {(audit_logs || []).length === 0 ? (
                            <div className="py-12 text-center text-xs text-muted-foreground">
                                No audit log events recorded for this account.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {(audit_logs || []).map((log: AuditLog) => (
                                    <div key={log.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="inline-flex px-1.5 py-0.5 rounded border border-border text-[9px] font-bold tracking-wider font-mono uppercase bg-muted/20 text-muted-foreground">
                                                {log.action}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground font-mono">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-foreground/90 font-medium font-sans leading-relaxed">{log.details}</p>
                                        <p className="text-[9px] text-muted-foreground font-mono">IP: {log.ip_address}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
