"use client";

import React from "react";
import { Edit3, Trash2, Calendar, Sliders, Clock, Tag, Layout, Eye, Globe, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { Card } from "../../../components/ui/card";
import Link from "next/link";

export interface Paper {
    id: string;
    filename: string;
    exam_name?: string;
    uploaded_at: string;
    q_count: number;
    exam_type: string;
    duration: number;
    target_exam?: string;
    is_published?: boolean;
    published_at?: string;
}

interface PaperCardProps {
    paper: Paper;
    isSuperAdmin?: boolean;
    onPreview?: (p: Paper) => void;
    onOpenRename: (p: Paper) => void;
    onOpenDelete: (id: string) => void;
    onTogglePublish?: (p: Paper) => void;
    togglingPublish?: boolean;
}

export function PaperCard({
    paper,
    isSuperAdmin = false,
    onPreview,
    onOpenRename,
    onOpenDelete,
    onTogglePublish,
    togglingPublish = false,
}: PaperCardProps) {
    const isFullMock = paper.exam_type === "full" || paper.exam_type === "full_mock";
    const isPublished = Boolean(paper.is_published);

    return (
        <Card className={`border transition-all duration-200 shadow-sm bg-card rounded-2xl overflow-hidden group ${
            isPublished ? "border-border hover:border-emerald-500/40" : "border-border hover:border-amber-500/40 bg-card/70"
        }`}>
            <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Metadata */}
                <div className="space-y-2.5 min-w-0 flex-1">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-foreground">
                                {paper.exam_name || paper.filename}
                            </h3>

                            <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                                isPublished
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}>
                                {isPublished ? (
                                    <>
                                        <Globe className="h-3 w-3" /> Published · Live on App
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-3 w-3" /> Draft · Unpublished
                                    </>
                                )}
                            </span>

                            {/* Mock Format Type Badge */}
                            <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isFullMock
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            }`}>
                                {isFullMock ? "Full Mock" : "Practice Sheet"}
                            </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground font-mono flex flex-wrap gap-2 items-center">
                            <span>ID: <span className="text-muted-foreground/80">{paper.id}</span></span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-sans">
                                <Calendar className="h-3 w-3" /> Uploaded {new Date(paper.uploaded_at).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                            {paper.published_at && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 font-sans text-emerald-600 dark:text-emerald-400">
                                        <ShieldCheck className="h-3 w-3" /> Published {new Date(paper.published_at).toLocaleDateString()}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                        <span className="bg-muted/50 text-foreground border border-border px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold">
                            <Tag className="h-3.5 w-3.5 text-primary" /> {paper.target_exam || "General"}
                        </span>
                        <span className="bg-muted/50 text-foreground border border-border px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold">
                            <Clock className="h-3.5 w-3.5 text-amber-500" /> {paper.duration || 60} Mins
                        </span>
                        <span className="bg-muted/50 text-foreground border border-border px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold">
                            <Layout className="h-3.5 w-3.5 text-cyan-500" /> <strong>{paper.q_count}</strong> Questions
                        </span>
                    </div>
                </div>

                {/* Right: Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60">
                    {isSuperAdmin && onTogglePublish && (
                        <button
                            onClick={() => onTogglePublish(paper)}
                            disabled={togglingPublish}
                            className={`px-3.5 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                isPublished
                                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            }`}
                            title={isPublished ? "Unpublish and hide from student portal" : "Approve and publish to student portal"}
                        >
                            {isPublished ? (
                                <>
                                    <EyeOff className="h-3.5 w-3.5" /> Unpublish
                                </>
                            ) : (
                                <>
                                    <Globe className="h-3.5 w-3.5" /> Publish to App
                                </>
                            )}
                        </button>
                    )}

                    {onPreview && (
                        <button
                            onClick={() => onPreview(paper)}
                            className="px-3.5 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted text-foreground flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title="Preview Questions and Explanations"
                        >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Preview
                        </button>
                    )}

                    <Link
                        href={`/assemble?paperId=${paper.id}`}
                        className="px-3.5 py-2 border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Edit Paper in Builder"
                    >
                        <Sliders className="h-3.5 w-3.5" /> Edit Questions
                    </Link>

                    <button
                        onClick={() => onOpenRename(paper)}
                        className="px-3.5 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted text-foreground flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Edit Paper Details"
                    >
                        <Edit3 className="h-3.5 w-3.5 text-muted-foreground" /> Details
                    </button>

                    {isSuperAdmin && (
                        <button
                            onClick={() => onOpenDelete(paper.id)}
                            className="px-3.5 py-2 border border-rose-500/20 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title="Delete Paper (Super Admin)"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}
