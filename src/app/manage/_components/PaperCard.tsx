"use client";

import React from "react";
import { Edit3, Trash2, Calendar, Sliders } from "lucide-react";
import { Card } from "../../../components/ui/card";
import Link from "next/link";

interface Paper {
    id: string;
    filename: string;
    uploaded_at: string;
    q_count: number;
    exam_type: string;
    duration: number;
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
                <div className="space-y-1.5 min-w-0">
                    <h3 className="text-base font-bold text-foreground font-sans truncate">{paper.filename}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold flex flex-wrap gap-2 items-center font-mono">
                        <span>ID: <span className="text-muted-foreground/80">{paper.id}</span></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-sans">
                            <Calendar className="h-3.5 w-3.5" /> Published: {new Date(paper.uploaded_at).toLocaleDateString()}
                        </span>
                    </p>
                    <div className="flex gap-4 pt-1.5 text-xs text-muted-foreground">
                        <span>Questions count: <strong className="text-foreground">{paper.q_count} questions</strong></span>
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
                        title="Rename Paper"
                    >
                        <Edit3 className="h-4 w-4" /> Rename
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
