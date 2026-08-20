"use client";

import React from "react";
import {
    X,
    FileText,
    Plus,
    Trash2,
    Calendar,
    ArrowRight,
    Layers,
} from "lucide-react";
import { Question } from "./types";

export interface PaperDraft {
    id: string;
    title: string;
    targetExam: string;
    examType: string;
    duration: number;
    updatedAt: number;
    questions: Question[];
}

interface DraftsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    drafts: PaperDraft[];
    activeDraftId: string;
    onSelectDraft: (id: string) => void;
    onNewDraft: () => void;
    onDeleteDraft: (id: string) => void;
}

export function DraftsDrawer({
    isOpen,
    onClose,
    drafts,
    activeDraftId,
    onSelectDraft,
    onNewDraft,
    onDeleteDraft,
}: DraftsDrawerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" /> My Paper Drafts ({drafts.length})
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Switch between working drafts without losing progress.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Drafts List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <button
                        onClick={() => {
                            onNewDraft();
                            onClose();
                        }}
                        className="w-full p-3.5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.03] text-primary hover:bg-primary/[0.06] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> Start Fresh Test Paper
                    </button>

                    {drafts.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground text-xs space-y-2">
                            <FileText className="h-8 w-8 mx-auto text-muted-foreground/40" />
                            <p>No saved drafts.</p>
                        </div>
                    ) : (
                        drafts.map((draft) => {
                            const isActive = draft.id === activeDraftId;
                            const qCount = draft.questions?.length || 0;
                            const formattedDate = new Date(draft.updatedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            return (
                                <div
                                    key={draft.id}
                                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                                        isActive
                                            ? "border-primary ring-1 ring-primary/30 bg-primary/[0.02]"
                                            : "border-border hover:border-border/80 bg-card"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-xs font-bold text-foreground truncate">
                                                {draft.title.trim() || "Untitled Test Paper"}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                                <span className="bg-muted px-1.5 py-0.5 rounded font-semibold text-foreground">
                                                    {draft.targetExam || "General"}
                                                </span>
                                                <span>• {qCount} questions</span>
                                                <span>• {draft.duration || 60} mins</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Delete draft "${draft.title || 'Untitled Paper'}"?`)) {
                                                    onDeleteDraft(draft.id);
                                                }
                                            }}
                                            className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                                            title="Delete draft"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {formattedDate}
                                        </span>
                                        {isActive ? (
                                            <span className="font-bold text-primary">Currently Editing</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSelectDraft(draft.id);
                                                    onClose();
                                                }}
                                                className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                Resume Editing <ArrowRight className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
