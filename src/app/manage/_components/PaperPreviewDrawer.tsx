"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import {
    X,
    Loader2,
    BookOpen,
    CheckCircle2,
    Calendar,
    Clock,
    Tag,
    Layout,
    Sliders,
    HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Option {
    id: string;
    option_text: string;
    is_correct: boolean;
}

interface Question {
    id: string;
    question_text: string;
    type: string;
    topic?: string;
    difficulty?: string;
    explanation?: string;
    options: Option[];
    context_passage?: {
        passage_text: string;
    };
}

interface PaperDetail {
    id: string;
    filename: string;
    exam_name?: string;
    uploaded_at: string;
    exam_type: string;
    duration: number;
    target_exam?: string;
    questions: Question[];
}

interface PaperPreviewDrawerProps {
    paperId: string | null;
    onClose: () => void;
}

export function PaperPreviewDrawer({ paperId, onClose }: PaperPreviewDrawerProps) {
    const [paper, setPaper] = useState<PaperDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!paperId) {
            setPaper(null);
            return;
        }

        setLoading(true);
        api.get<PaperDetail>(`/admin/papers/${paperId}`)
            .then((res) => {
                setPaper(res.data);
            })
            .catch(() => {
                toast.error("Failed to load paper details.");
                onClose();
            })
            .finally(() => {
                setLoading(false);
            });
    }, [paperId, onClose]);

    if (!paperId) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div className="relative ml-auto w-full max-w-3xl h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20 shrink-0">
                    <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Paper Inspection
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                ID: {paperId}
                            </span>
                        </div>
                        <h2 className="text-base font-bold tracking-tight text-foreground truncate">
                            {paper?.exam_name || paper?.filename || "Loading paper..."}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {paper && (
                            <Link
                                href={`/assemble?paperId=${paper.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                                <Sliders className="h-3.5 w-3.5" /> Edit in Builder
                            </Link>
                        )}
                        <button
                            onClick={onClose}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-xs font-medium">Fetching paper questions and configurations...</span>
                    </div>
                ) : !paper ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-xs">
                        No paper data available.
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Meta Tags */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border text-xs">
                            <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                                    <Tag className="h-3 w-3" /> Target Exam
                                </span>
                                <p className="font-bold text-foreground">{paper.target_exam || "Unspecified"}</p>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                                    <Layout className="h-3 w-3" /> Exam Type
                                </span>
                                <p className="font-bold text-foreground">
                                    {paper.exam_type === "full" ? "Full Mock" : "Practice Sheet"}
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Duration
                                </span>
                                <p className="font-bold text-foreground">{paper.duration} Minutes</p>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Published
                                </span>
                                <p className="font-bold text-foreground">
                                    {new Date(paper.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Questions list */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <HelpCircle className="h-3.5 w-3.5" /> Questions ({paper.questions?.length || 0})
                                </h3>
                            </div>

                            {(!paper.questions || paper.questions.length === 0) ? (
                                <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground text-xs">
                                    No questions currently linked to this paper.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paper.questions.map((q, idx) => (
                                        <div
                                            key={q.id || idx}
                                            className="border border-border/80 rounded-xl p-4.5 bg-background/50 hover:border-primary/30 transition-all space-y-3"
                                        >
                                            {/* Top badges */}
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-5 px-2 rounded bg-primary/10 text-primary font-mono flex items-center justify-center font-bold">
                                                        Q{idx + 1}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                                        {q.type?.toLowerCase() === "multiple_choice" ? "MCQ" : q.type}
                                                    </span>
                                                    {q.topic && q.topic.toLowerCase() !== "none" && (
                                                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                                            {q.topic}
                                                        </span>
                                                    )}
                                                    {q.difficulty && q.difficulty.toLowerCase() !== "none" && (
                                                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                                            {q.difficulty}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    ID: {q.id}
                                                </span>
                                            </div>

                                            {/* Passage Context if exists */}
                                            {q.context_passage && (
                                                <div className="text-xs italic text-muted-foreground bg-muted/40 border-l-2 border-primary/60 py-2 px-3 rounded-r-lg">
                                                    <div className="flex items-center gap-1 font-bold uppercase text-[9px] text-muted-foreground not-italic mb-1">
                                                        <BookOpen className="h-3 w-3 text-primary" /> Context Passage:
                                                    </div>
                                                    &ldquo;{q.context_passage.passage_text}&rdquo;
                                                </div>
                                            )}

                                            {/* Question Text */}
                                            <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
                                                {q.question_text}
                                            </p>

                                            {/* Options */}
                                            {q.options && q.options.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40">
                                                    {q.options.map((opt, optIdx) => (
                                                        <div
                                                            key={opt.id || optIdx}
                                                            className={`border rounded-lg p-2.5 text-xs font-medium flex items-center justify-between gap-2 ${
                                                                opt.is_correct
                                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                                                                    : "border-border text-muted-foreground bg-muted/20"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="text-[10px] font-mono font-bold text-muted-foreground shrink-0">
                                                                    {String.fromCharCode(65 + optIdx)}.
                                                                </span>
                                                                <span className="truncate">{opt.option_text}</span>
                                                            </div>
                                                            {opt.is_correct && (
                                                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            {q.explanation && q.explanation.toLowerCase() !== "none" && (
                                                <div className="text-[11px] leading-relaxed text-muted-foreground bg-muted/30 border border-border/40 p-2.5 rounded-lg">
                                                    <span className="font-bold text-primary text-[10px] uppercase block mb-0.5">
                                                        Explanation:
                                                    </span>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
