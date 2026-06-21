"use client";

import React from "react";
import { Edit3, Trash2, Calendar, Sliders, Clock, Tag, Layout } from "lucide-react";
import { Card } from "../../../components/ui/card";
import Link from "next/link";

interface Paper {
    id: string;
    filename: string;
    exam_name?: string;
    uploaded_at: string;
    q_count: number;
    exam_type: string;
    duration: number;
    target_exam?: string;
}

interface PaperCardProps {
    paper: Paper;
    onOpenRename: (p: Paper) => void;
    onOpenDelete: (id: string) => void;
}

export function PaperCard({
    paper,
    onOpenRename,
    onOpenDelete
}: PaperCardProps) {
    return (
        <Card>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2.5 min-w-0">
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground font-sans truncate">
                            {paper.exam_name || paper.filename}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-semibold flex flex-wrap gap-2 items-center font-mono">
                            <span>ID: <span className="text-muted-foreground/80">{paper.id}</span></span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-sans">
                                <Calendar className="h-3.5 w-3.5" /> Published: {new Date(paper.uploaded_at).toLocaleDateString()}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 text-xs text-muted-foreground font-sans font-medium">
                        <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] font-bold">
                            <Tag className="h-3 w-3" /> {paper.target_exam || "Unspecified"}
                        </span>
                        <span className="bg-amber-500/5 text-amber-600 dark:text-amber-500 border border-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] font-bold">
                            <Clock className="h-3 w-3" /> {paper.duration} Mins
                        </span>
                        <span className={`px-2 py-0.5 border rounded-md flex items-center gap-1 text-[11px] font-bold ${
                            paper.exam_type === "full"
                                ? "bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/15"
                                : "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/15"
                        }`}>
                            <Layout className="h-3 w-3" /> {paper.exam_type === "full" ? "Full-Length Mock" : "Practice Sheet"}
                        </span>
                        <span className="text-muted-foreground/80">
                            <strong>{paper.q_count}</strong> standard questions
                        </span>
                    </div>
                </div>

                <div className="flex gap-2.5 shrink-0 self-start sm:self-center">
                    <Link
                        href={`/assemble?paperId=${paper.id}`}
                        className="px-3.5 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted flex items-center gap-1.5 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Paper Questions"
                    >
                        <Sliders className="h-4 w-4" /> Edit Questions
                    </Link>
                    <button
                        onClick={() => onOpenRename(paper)}
                        className="px-3.5 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted flex items-center gap-1.5 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Mock Details"
                    >
                        <Edit3 className="h-4 w-4" /> Edit Details
                    </button>
                    <button
                        onClick={() => onOpenDelete(paper.id)}
                        className="px-3.5 py-1.5 border border-red-500/20 rounded-xl text-xs font-semibold bg-red-500/5 hover:bg-red-500/10 flex items-center gap-1.5 transition-all text-red-500 cursor-pointer"
                        title="Delete Paper"
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </div>
            </div>
        </Card>
    );
}
