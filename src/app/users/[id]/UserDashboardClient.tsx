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
    MapPin,
    Target,
    Users,
    Radio,
    FileText,
    Sparkles,
    Share2,
    ExternalLink,
    ShieldCheck,
    ThumbsUp,
    Globe,
    Lock,
    Flame,
    Tag,
    Award,
    Check,
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
    target_exam?: string;
    target_exam_name?: string;
    target_exam_date?: string;
    is_public?: boolean;
    pincode?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
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

interface Experience {
    id: string;
    exam_name: string;
    year: number;
    verdict: string;
    difficulty: string;
    is_anonymous: boolean;
    description: string;
    like_count?: number;
    created_at: string;
}

interface Post {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    upvotes: number;
    media_url?: string;
    media_type?: string;
    created_at: string;
}

interface BuddyInfo {
    id: string;
    buddy_id: string;
    buddy_username: string;
    buddy_email: string;
    buddy_target_exam?: string;
    status: string;
    created_at: string;
}

interface ActiveSessionInfo {
    has_active: boolean;
    task_title: string;
    started_at: string;
    accumulated_seconds: number;
    is_paused: boolean;
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
    experiences?: Experience[];
    posts?: Post[];
    buddies?: BuddyInfo[];
    live_session?: ActiveSessionInfo;
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
    const [activeTab, setActiveTab] = useState<"tracker" | "attempts" | "experiences" | "posts" | "buddies" | "feedback" | "audit">("tracker");

    const handleRoleChange = async (newRole: string) => {
        if (!data) return;
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            toast.success("User role updated successfully");
            setData(prev => prev ? { ...prev, user: { ...prev.user, role: newRole } } : null);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            toast.error("Failed to update role", {
                description: error.response?.data?.error || "Could not update user role.",
            });
        }
    };

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
                    Aggregating aspirant metrics & profile...
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

    const { user, study_tracker, attempts, experiences = [], posts = [], buddies = [], live_session, feedbacks = [], audit_logs = [] } = data;

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

    // Compute exam countdown if available
    let daysToExam: number | null = null;
    if (user.target_exam_date) {
        const diffMs = new Date(user.target_exam_date).getTime() - new Date().getTime();
        daysToExam = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    const totalUpvotes = posts.reduce((acc, p) => acc + (p.upvotes || 0), 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Top Navigation */}
            <div className="flex items-center justify-between gap-4">
                <Link
                    href="/users"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Users Directory
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">ID: {user.id}</span>
                </div>
            </div>

            {/* Live Study Session Banner */}
            {live_session?.has_active && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 text-foreground animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Focus Session In Progress
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Current Task: <strong className="text-foreground">{live_session.task_title}</strong>
                                {live_session.is_paused && <span className="text-amber-500 ml-1.5">(Paused)</span>}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-mono text-muted-foreground">Started at</span>
                        <p className="text-xs font-bold font-mono text-foreground">
                            {new Date(live_session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            )}

            {/* Aspirant Hero Header Card */}
            <Card className="relative overflow-hidden bg-card/70 backdrop-blur-md border border-border">
                <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-inner font-extrabold text-xl text-primary">
                                {user.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl md:text-2xl font-black tracking-tight">
                                        @{user.username}
                                    </h1>
                                    <select
                                        value={user.role || "aspirant"}
                                        onChange={(e) => handleRoleChange(e.target.value)}
                                        className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border transition-colors outline-none cursor-pointer ${
                                            user.role === "super_admin"
                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-mono"
                                                : user.role === "admin"
                                                ? "bg-primary/10 text-primary border-primary/30 font-mono"
                                                : "bg-muted/40 text-muted-foreground border-border font-mono"
                                        }`}
                                    >
                                        <option value="aspirant">Aspirant</option>
                                        <option value="candidate">Candidate</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>

                                    {user.is_public !== undefined && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                            user.is_public 
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                : "bg-muted text-muted-foreground border-border"
                                        }`}>
                                            {user.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {user.is_public ? "Public Profile" : "Private Profile"}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
                                        {user.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                                        Joined {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Location and Target Exam Pill Badges */}
                        <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                            {(user.target_exam_name || user.target_exam) && (
                                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
                                    <Target className="h-4 w-4 text-primary shrink-0" />
                                    <div className="text-left md:text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary block leading-none">
                                            Target Exam
                                        </span>
                                        <span className="text-xs font-extrabold text-foreground">
                                            {user.target_exam_name || user.target_exam}
                                        </span>
                                        {daysToExam !== null && (
                                            <span className={`text-[10px] font-bold ml-1.5 px-1.5 py-0.5 rounded font-mono ${
                                                daysToExam <= 15 ? "bg-rose-500/20 text-rose-400" : "bg-primary/20 text-primary"
                                            }`}>
                                                {daysToExam > 0 ? `${daysToExam}d left` : "Exam Passed"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(user.district || user.state || user.pincode) && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border border-border px-3 py-1 rounded-xl">
                                    <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                    <span>
                                        {[user.district, user.state].filter(Boolean).join(", ")}
                                        {user.pincode ? ` (${user.pincode})` : ""}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {user.bio && (
                        <p className="text-xs text-muted-foreground/90 max-w-3xl italic bg-muted/15 p-3 rounded-xl border border-border/50">
                            "{user.bio}"
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Quick Metrics KPI Bar (6 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="hover:border-primary/20 transition-all shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Study Time</span>
                            <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{studyHours}h</p>
                            <p className="text-[9px] text-muted-foreground">Total study timer</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Task Targets</span>
                            <CheckCircle2 className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{taskCompletionRate}%</p>
                            <p className="text-[9px] text-muted-foreground">{study_tracker.completed_tasks}/{study_tracker.total_tasks} completed</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Mock Accuracy</span>
                            <Trophy className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{attempts.avg_accuracy}%</p>
                            <p className="text-[9px] text-muted-foreground">Peak: {attempts.max_accuracy}% ({attempts.total} tests)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Study Buddies</span>
                            <Users className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{buddies.length}</p>
                            <p className="text-[9px] text-muted-foreground">Partner network</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Experiences</span>
                            <Award className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{experiences.length}</p>
                            <p className="text-[9px] text-muted-foreground">Shared debriefs</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/20 transition-all shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Forum Posts</span>
                            <MessageSquare className="h-4 w-4 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tight">{posts.length}</p>
                            <p className="text-[9px] text-muted-foreground">{totalUpvotes} total upvotes</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabbed Navigation Bar */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("tracker")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "tracker"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    <Activity className="h-3.5 w-3.5" /> Study Tracker & Analytics
                </button>
                <button
                    onClick={() => setActiveTab("attempts")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "attempts"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    <Trophy className="h-3.5 w-3.5" /> Mock Tests ({attempts.total})
                </button>
                <button
                    onClick={() => setActiveTab("experiences")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "experiences"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    <Award className="h-3.5 w-3.5" /> Experiences ({experiences.length})
                </button>
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "posts"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    <MessageSquare className="h-3.5 w-3.5" /> Forum Posts ({posts.length})
                </button>
                <button
                    onClick={() => setActiveTab("buddies")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "buddies"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    <Users className="h-3.5 w-3.5" /> Study Buddies ({buddies.length})
                </button>
                <button
                    onClick={() => setActiveTab("feedback")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "feedback"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    <FileText className="h-3.5 w-3.5" /> Feedback ({feedbacks.length})
                </button>
                <button
                    onClick={() => setActiveTab("audit")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === "audit"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    <HardDrive className="h-3.5 w-3.5" /> Security & Audit ({audit_logs.length})
                </button>
            </div>

            {/* TAB 1: STUDY TRACKER & ANALYTICS */}
            {activeTab === "tracker" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">Subject Allocation</CardTitle>
                                <CardDescription>Total hours dedicated per subject topic.</CardDescription>
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
                                <CardDescription>Preparation style allocation (Reading, Practice, Revision, Mock).</CardDescription>
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
                                <CardDescription>Target task milestones completion rate.</CardDescription>
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
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" /> Recent Study Timer Sessions
                                </CardTitle>
                                <CardDescription>Last 10 study logs recorded by @{user.username}.</CardDescription>
                            </CardHeader>
                            <CardContent className="max-h-[300px] overflow-y-auto space-y-3">
                                {(study_tracker.recent_logs || []).length === 0 ? (
                                    <div className="py-12 text-center text-xs text-muted-foreground">
                                        No study logs recorded yet.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {(study_tracker.recent_logs || []).map((log) => (
                                            <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-foreground truncate max-w-sm">
                                                        {log.task_title || "General Study"}
                                                    </span>
                                                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 font-bold shrink-0 font-mono">
                                                        {log.duration_minutes}m
                                                    </span>
                                                </div>
                                                {log.note && (
                                                    <p className="text-xs text-muted-foreground italic">
                                                        "{log.note}"
                                                    </p>
                                                )}
                                                <span className="text-[9px] text-muted-foreground font-mono block">
                                                    {new Date(log.logged_at).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB 2: MOCK TESTS & ATTEMPTS */}
            {activeTab === "attempts" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Mock Exam History & Accuracy</CardTitle>
                            <CardDescription>Comprehensive list of test papers attempted by @{user.username}.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {(attempts.list || []).length === 0 ? (
                                <div className="py-16 text-center text-xs text-muted-foreground">
                                    No mock test attempts recorded for this user.
                                </div>
                            ) : (
                                <table className="w-full border-collapse text-left text-xs">
                                    <thead className="bg-card border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
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
                                                    <td className="p-3 pr-5 text-muted-foreground">{new Date(attempt.attempted_at).toLocaleString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB 3: EXPERIENCES SHARED */}
            {activeTab === "experiences" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Award className="h-4 w-4 text-primary" /> Exam & Interview Experiences
                            </CardTitle>
                            <CardDescription>Debriefs and guidance shared with the community by @{user.username}.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {experiences.length === 0 ? (
                                <div className="py-12 text-center text-xs text-muted-foreground">
                                    No exam experiences posted yet by this user.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {experiences.map((exp) => (
                                        <div key={exp.id} className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-xs font-bold text-foreground block">{exp.exam_name} ({exp.year})</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                        {new Date(exp.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                    exp.verdict?.toLowerCase() === "selected"
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : "bg-muted text-muted-foreground border border-border"
                                                }`}>
                                                    {exp.verdict || "Shared"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-bold">
                                                    Difficulty: {exp.difficulty || "Standard"}
                                                </span>
                                                {exp.is_anonymous && (
                                                    <span className="bg-muted px-2 py-0.5 rounded border border-border">
                                                        Posted Anonymously
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-foreground/85 leading-relaxed line-clamp-4">
                                                {exp.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB 4: FORUM POSTS */}
            {activeTab === "posts" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" /> Community Forum Discussions
                            </CardTitle>
                            <CardDescription>Questions and discussion posts authored by @{user.username}.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {posts.length === 0 ? (
                                <div className="py-12 text-center text-xs text-muted-foreground">
                                    No community discussions posted yet by this user.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {posts.map((post) => (
                                        <div key={post.id} className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                                                    {post.title}
                                                </h3>
                                                <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg shrink-0">
                                                    <ThumbsUp className="h-3 w-3" /> {post.upvotes || 0}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {post.content}
                                            </p>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                    {post.tags.map((tag) => (
                                                        <span key={tag} className="text-[9px] font-bold text-muted-foreground bg-muted/40 border border-border px-1.5 py-0.5 rounded">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-[9px] text-muted-foreground font-mono block pt-1">
                                                Posted on {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB 5: STUDY BUDDIES */}
            {activeTab === "buddies" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" /> Study Buddies Network
                            </CardTitle>
                            <CardDescription>Connected study partners and buddy requests for @{user.username}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {buddies.length === 0 ? (
                                <div className="py-12 text-center text-xs text-muted-foreground">
                                    No study buddy connections found for this user.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {buddies.map((buddy) => (
                                        <div key={buddy.id} className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                                        {buddy.buddy_username ? buddy.buddy_username.substring(0, 2).toUpperCase() : "U"}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-foreground block">
                                                            @{buddy.buddy_username}
                                                        </span>
                                                        <span className="text-[9px] text-muted-foreground font-mono">
                                                            {buddy.buddy_email}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                    buddy.status === "accepted"
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {buddy.status}
                                                </span>
                                            </div>

                                            {buddy.buddy_target_exam && (
                                                <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 pt-1">
                                                    <Target className="h-3 w-3 text-primary/70" />
                                                    <span>Target: {buddy.buddy_target_exam}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB 6: FEEDBACK & SUPPORT */}
            {activeTab === "feedback" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" /> Submitted Feedback Tickets
                            </CardTitle>
                            <CardDescription>Inquiries and issue reports filed by @{user.username}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {feedbacks.length === 0 ? (
                                <div className="py-12 text-center text-xs text-muted-foreground">
                                    No feedback tickets filed by this user.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {feedbacks.map((f) => (
                                        <div key={f.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/5">
                                                    {f.category}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-mono">
                                                    {new Date(f.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-foreground/90 leading-relaxed font-sans">{f.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB 7: SECURITY & AUDIT TRAIL */}
            {activeTab === "audit" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <HardDrive className="h-4 w-4 text-primary" /> Account Security & Audit Trail
                            </CardTitle>
                            <CardDescription>Security events, logins, and operational changes for this account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {audit_logs.length === 0 ? (
                                <div className="py-12 text-center text-xs text-muted-foreground">
                                    No audit log events recorded for this account.
                                </div>
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {audit_logs.map((log) => (
                                        <div key={log.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="inline-flex px-1.5 py-0.5 rounded border border-border text-[9px] font-bold tracking-wider font-mono uppercase bg-muted/20 text-muted-foreground">
                                                    {log.action}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-mono">
                                                    {new Date(log.created_at).toLocaleString()}
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
            )}
        </div>
    );
}
