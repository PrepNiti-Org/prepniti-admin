"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface EditPaperModalProps {
    isOpen: boolean;
    paperTitle: string;
    setPaperTitle: (v: string) => void;
    examType: string;
    setExamType: (v: string) => void;
    duration: number;
    setDuration: (v: number) => void;
    targetExam: string;
    setTargetExam: (v: string) => void;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
}

export function RenameModal({
    isOpen,
    paperTitle,
    setPaperTitle,
    examType,
    setExamType,
    duration,
    setDuration,
    targetExam,
    setTargetExam,
    onClose,
    onSave,
    saving
}: EditPaperModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="border border-border bg-card p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="space-y-1">
                    <h2 className="text-base font-bold tracking-tight text-foreground font-sans">Edit Mock Paper Details</h2>
                    <p className="text-[10px] text-muted-foreground">Modify mock test configurations and categorization.</p>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Mock Title</label>
                        <input
                            type="text"
                            value={paperTitle}
                            onChange={(e) => setPaperTitle(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Target Exam Category</label>
                        <select
                            value={targetExam}
                            onChange={(e) => setTargetExam(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="Unspecified" className="bg-background">Unspecified</option>
                            <option value="UPSC" className="bg-background">UPSC</option>
                            <option value="JEE" className="bg-background">JEE</option>
                            <option value="NEET" className="bg-background">NEET</option>
                            <option value="GATE" className="bg-background">GATE</option>
                            <option value="CAT" className="bg-background">CAT</option>
                            <option value="SSC" className="bg-background">SSC CGL</option>
                            <option value="Bank" className="bg-background">Bank</option>
                            <option value="Teaching" className="bg-background">Teaching</option>
                            <option value="State PCS" className="bg-background">State PCS</option>
                            <option value="Defence" className="bg-background">Defence</option>
                            <option value="Law" className="bg-background">Law</option>
                            <option value="Nursing" className="bg-background">Nursing</option>
                            <option value="Other" className="bg-background">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Exam Type</label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="practice" className="bg-background">Practice Sheet</option>
                                <option value="full" className="bg-background">Full-Length Mock</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Duration (Mins)</label>
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving || !paperTitle.trim()}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
