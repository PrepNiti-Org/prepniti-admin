"use client";

import React from "react";
import { Question } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { FileText, Sparkles, Loader2, X } from "lucide-react";

interface CompilePanelProps {
    paperTitle: string;
    setPaperTitle: (title: string) => void;
    examType: string;
    setExamType: (type: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
    targetExam: string;
    setTargetExam: (targetExam: string) => void;
    selectedQuestions: Question[];
    onRemoveSelected: (id: string) => void;
    onCompile: () => void;
    publishing: boolean;
    isEditing?: boolean;
}

export function CompilePanel({
    paperTitle,
    setPaperTitle,
    examType,
    setExamType,
    duration,
    setDuration,
    targetExam,
    setTargetExam,
    selectedQuestions,
    onRemoveSelected,
    onCompile,
    publishing,
    isEditing = false
}: CompilePanelProps) {
    return (
        <Card className="lg:sticky lg:top-20">
            <CardHeader>
                <CardTitle className="text-base">{isEditing ? "Edit Mock Paper" : "Mock Paper Details"}</CardTitle>
                <CardDescription>
                    {isEditing ? "Update selected questions and title for this mock test." : "Compile selected questions into a mock test."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        Mock Paper Title:
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. UPSC CSE CSAT 2026 Set-B"
                        value={paperTitle}
                        onChange={(e) => setPaperTitle(e.target.value)}
                        className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Exam Type:
                        </label>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="practice" className="bg-background">Practice Sheet</option>
                            <option value="full" className="bg-background">Full-Length Mock</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Duration (Mins):
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={duration || ""}
                            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        Target Exam Category:
                    </label>
                    <select
                        value={targetExam}
                        onChange={(e) => setTargetExam(e.target.value)}
                        className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                    >
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


                <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Questions Selected</span>
                        <div className="text-2xl font-black font-mono leading-none mt-1">{selectedQuestions.length}</div>
                    </div>
                    <FileText className="h-8 w-8 text-primary/80" />
                </div>

                {selectedQuestions.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Selected Questions Preview:</span>
                        <div className="max-h-[160px] overflow-y-auto border border-border rounded-xl divide-y divide-border/40 bg-background/50">
                            {selectedQuestions.map((q, idx) => (
                                <div key={q.id} className="p-3 text-[11px] flex items-start justify-between gap-3 hover:bg-muted/30">
                                    <div className="truncate pr-2 font-medium">
                                        <span className="text-primary font-bold mr-1">Q{idx + 1}.</span>
                                        {q.question_text}
                                    </div>
                                    <button
                                        onClick={() => onRemoveSelected(q.id)}
                                        className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                        title="Remove"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={onCompile}
                    disabled={publishing || selectedQuestions.length === 0 || !paperTitle.trim()}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                    {publishing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> {isEditing ? "Saving Changes..." : "Publishing Exam..."}
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" /> {isEditing ? "Save Paper Changes" : "Compile & Publish"}
                        </>
                    )}
                </button>
            </CardContent>
        </Card>
    );
}
