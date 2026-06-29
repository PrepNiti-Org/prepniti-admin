"use client";

import { AlertCircle, Eye, CheckCircle2, Archive, Calendar, Mail, Tag } from "lucide-react";
import Link from "next/link";

interface FeedbackUser {
    username: string;
    email: string;
}

interface Feedback {
    id: string;
    email: string;
    category: string;
    message: string;
    status: string;
    created_at: string;
    user?: FeedbackUser;
}

interface RecentFeedbackProps {
    data: Feedback[];
}

const STATUS_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
    unread:   { icon: AlertCircle,  color: "text-blue-400" },
    read:     { icon: Eye,          color: "text-muted-foreground" },
    resolved: { icon: CheckCircle2, color: "text-emerald-400" },
    archived: { icon: Archive,      color: "text-zinc-400" },
};

export function RecentFeedback({ data }: RecentFeedbackProps) {
    if (!data || data.length === 0) {
        return (
            <div className="py-8 text-center text-xs text-muted-foreground">
                No recent feedback found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="divide-y divide-border/60">
                {data.map((item) => {
                    const StatusInfo = STATUS_ICONS[item.status.toLowerCase()] || STATUS_ICONS.unread;
                    const StatusIcon = StatusInfo.icon;

                    return (
                        <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                            <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${StatusInfo.color}`} />
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        {item.email || item.user?.email || "Anonymous"}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono flex items-center gap-1">
                                        <Calendar className="h-2.5 w-2.5" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {item.message}
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/5">
                                        <Tag className="h-2 w-2" />
                                        {item.category}
                                    </span>
                                    {item.user?.username && (
                                        <span className="text-[9px] text-muted-foreground">
                                            @{item.user.username}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Link
                href="/feedback"
                className="block text-center text-xs font-bold text-primary hover:underline pt-2 border-t border-border/40"
            >
                View All Feedback
            </Link>
        </div>
    );
}
