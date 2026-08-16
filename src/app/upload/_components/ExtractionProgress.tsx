"use client";

import React from "react";
import { Loader2, Sparkles, FileText, CheckCircle2, Layers, Cpu, Eye, XCircle } from "lucide-react";

export interface LiveQuestionPreview {
    question_text: string;
    type: string;
    topic?: string;
    difficulty?: string;
    options_count?: number;
}

interface ExtractionProgressProps {
    progressPercent: number;
    stageMessage: string;
    completedChunks: number;
    totalChunks: number;
    totalPages?: number;
    mode: "visual" | "text";
    liveQuestions: LiveQuestionPreview[];
    totalQuestionsFound: number;
    filename?: string;
    onAbort?: () => void;
}

export function ExtractionProgress({
    progressPercent,
    stageMessage,
    completedChunks,
    totalChunks,
    totalPages,
    mode,
    liveQuestions,
    totalQuestionsFound,
    filename,
    onAbort
}: ExtractionProgressProps) {
    return (
        <div className="border border-primary/25 bg-card/95 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-6 shadow-lg shadow-primary/5 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            AI Extraction Pipeline Running
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                Realtime Stream
                            </span>
                        </h3>
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                            {filename ? `Extracting from ${filename}` : "Processing document layout & content"}
                        </p>
                    </div>
                </div>

                {onAbort && (
                    <button
                        onClick={onAbort}
                        type="button"
                        className="self-start sm:self-center flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                        <XCircle className="h-4 w-4" /> Cancel Process
                    </button>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground font-semibold flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                        {stageMessage || "Analyzing layout structures with Gemini..."}
                    </span>
                    <span className="font-mono font-bold text-primary text-sm">
                        {progressPercent}%
                    </span>
                </div>

                <div className="w-full bg-muted/60 h-3 rounded-full overflow-hidden p-0.5 border border-border">
                    <div
                        className="bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                        style={{ width: `${Math.max(5, Math.min(100, progressPercent))}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-background/80 border border-border/70 rounded-xl p-3.5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Layers className="h-3 w-3 text-primary" /> Chunks / Batches
                    </span>
                    <span className="font-mono text-base font-bold text-foreground mt-1">
                        {completedChunks} <span className="text-xs text-muted-foreground font-normal">/ {totalChunks || "..."}</span>
                    </span>
                </div>

                <div className="bg-background/80 border border-border/70 rounded-xl p-3.5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <FileText className="h-3 w-3 text-indigo-500" /> Total Pages
                    </span>
                    <span className="font-mono text-base font-bold text-foreground mt-1">
                        {totalPages || "..."} <span className="text-xs text-muted-foreground font-normal">pages</span>
                    </span>
                </div>

                <div className="bg-background/80 border border-border/70 rounded-xl p-3.5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-emerald-500" /> Parsed Questions
                    </span>
                    <span className="font-mono text-base font-bold text-emerald-500 mt-1">
                        {totalQuestionsFound} <span className="text-xs text-emerald-600/70 font-normal">found</span>
                    </span>
                </div>

                <div className="bg-background/80 border border-border/70 rounded-xl p-3.5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        {mode === "visual" ? <Eye className="h-3 w-3 text-amber-500" /> : <Cpu className="h-3 w-3 text-sky-500" />} Mode
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground mt-1 capitalize">
                        {mode === "visual" ? "Visual (Multimodal)" : "Text (High Speed)"}
                    </span>
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Live Extracted Questions Stream ({liveQuestions.length})
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground">
                        Updating in real time
                    </span>
                </div>

                {liveQuestions.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-6 text-center text-xs text-muted-foreground bg-background/30">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-primary" />
                        Awaiting first batch results from Gemini extraction workers...
                    </div>
                ) : (
                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1.5 scrollbar-thin">
                        {liveQuestions.map((q, idx) => (
                            <div
                                key={idx}
                                className="border border-border/80 bg-background/60 rounded-xl p-3 text-xs space-y-1.5 hover:border-primary/30 transition-all animate-in slide-in-from-top-2 duration-300"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-[10px] text-muted-foreground">#{idx + 1}</span>
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                                            {q.type}
                                        </span>
                                        {q.topic && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground">
                                                {q.topic}
                                            </span>
                                        )}
                                        {q.difficulty && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-500 bg-amber-500/10">
                                                {q.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        {q.options_count || 4} options
                                    </span>
                                </div>
                                <p className="text-foreground/90 font-medium line-clamp-2 leading-relaxed">
                                    {q.question_text}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
