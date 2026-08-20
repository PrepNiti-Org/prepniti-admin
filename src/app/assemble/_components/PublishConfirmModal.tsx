"use client";

import React from "react";
import {
    Loader2,
    Sparkles,
    CheckCircle2,
    Clock,
    Tag,
    Layers,
    X,
} from "lucide-react";
import { Question } from "./types";

interface PublishConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmPublish: () => void;
    publishing: boolean;
    paperTitle: string;
    targetExam: string;
    duration: number | "";
    examType: string;
    questions: Question[];
    isEditing?: boolean;
}

export function PublishConfirmModal({
    isOpen,
    onClose,
    onConfirmPublish,
    publishing,
    paperTitle,
    targetExam,
    duration,
    examType,
    questions,
    isEditing = false,
}: PublishConfirmModalProps) {
    if (!isOpen) return null;

    const totalQuestions = questions.length;
    const easyCount = questions.filter(q => q.difficulty?.toLowerCase() === "easy").length;
    const medCount = questions.filter(q => q.difficulty?.toLowerCase() === "medium" || q.difficulty?.toLowerCase() === "average").length;
    const hardCount = questions.filter(q => q.difficulty?.toLowerCase() === "hard" || q.difficulty?.toLowerCase() === "difficult").length;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <h2 className="text-base font-bold text-foreground">
                            {isEditing ? "Confirm Paper Update" : "Confirm Paper Publication"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={publishing}
                        className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEditing
                        ? "Review your changes below before updating this live test paper."
                        : "Ready to publish? Once published, this test paper will be live for students on PrepNiti."}
                </p>

                {/* Summary Card */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3 text-xs">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Test Paper Name
                        </span>
                        <p className="font-bold text-foreground text-sm mt-0.5">{paperTitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            <span>{targetExam}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>{duration} Minutes</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <Layers className="h-3.5 w-3.5 text-cyan-500" />
                            <span><strong>{totalQuestions}</strong> Questions</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>All validated</span>
                        </div>
                    </div>

                    {/* Difficulty breakdown */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                        <span>Difficulty:</span>
                        <div className="flex gap-2">
                            <span className="text-emerald-500 font-bold">{easyCount} Easy</span>
                            <span>•</span>
                            <span className="text-amber-500 font-bold">{medCount} Med</span>
                            <span>•</span>
                            <span className="text-rose-500 font-bold">{hardCount} Hard</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={publishing}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        Back to Editing
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmPublish}
                        disabled={publishing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                    >
                        {publishing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {publishing ? "Publishing..." : isEditing ? "Save & Update Paper" : "Yes, Publish Test"}
                    </button>
                </div>
            </div>
        </div>
    );
}
