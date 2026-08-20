"use client";

import React from "react";
import { Loader2, X } from "lucide-react";

interface RenameModalProps {
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
}: RenameModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="border border-border bg-card p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-foreground">Edit Mock Paper Details</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Modify test metadata and syllabus category.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">Paper Title</label>
                        <input
                            type="text"
                            value={paperTitle}
                            onChange={(e) => setPaperTitle(e.target.value)}
                            placeholder="e.g. UPSC Prelims 2026 GS Paper 1"
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">Target Exam Category</label>
                        <select
                            value={targetExam}
                            onChange={(e) => setTargetExam(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
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
                            <label className="text-xs font-semibold text-muted-foreground block">Exam Type</label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="practice" className="bg-background">Practice Sheet</option>
                                <option value="full" className="bg-background">Full-Length Mock</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">Duration (Mins)</label>
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving || !paperTitle.trim()}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
