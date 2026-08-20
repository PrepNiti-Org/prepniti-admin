"use client";

import React from "react";
import { Question } from "./types";
import { Card } from "../../../components/ui/card";
import { CheckCircle2, ChevronDown, ChevronUp, BookOpen, Edit } from "lucide-react";

interface QuestionCardProps {
    question: Question;
    isChecked: boolean;
    onToggleSelect: (id: string) => void;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onEdit?: (question: Question) => void;
}

export function QuestionCard({
    question,
    isChecked,
    onToggleSelect,
    isExpanded,
    onToggleExpand,
    onEdit
}: QuestionCardProps) {
    const getDifficultyBadge = (diff?: string) => {
        const d = diff?.toLowerCase();
        if (d === "easy") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
        if (d === "medium" || d === "average") return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        if (d === "hard" || d === "difficult") return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        return "bg-muted text-muted-foreground border-border";
    };

    return (
        <Card
            id={`question-card-${question.id}`}
            className={`transition-all duration-200 shadow-sm ${
                isChecked
                    ? "border-primary ring-1 ring-primary/30 bg-primary/[0.02]"
                    : "border-border hover:border-border/80 bg-card"
            }`}
        >
            <div className="p-4 flex items-start gap-3.5">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSelect(question.id)}
                    className="mt-1 h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                />
                <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wide w-full">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-mono">
                                {question.type.toLowerCase() === "multiple_choice" ? "MCQ" : question.type}
                            </span>
                            {question.topic && question.topic.toLowerCase() !== "none" && (
                                <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-md font-semibold">
                                    {question.topic}
                                </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-md border font-semibold ${getDifficultyBadge(question.difficulty)}`}>
                                {(!question.difficulty || question.difficulty.toLowerCase() === "none") ? "Unspecified" : question.difficulty}
                            </span>
                        </div>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(question)}
                                className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-muted px-2 py-0.5 rounded-lg transition-colors cursor-pointer capitalize"
                            >
                                <Edit className="h-3 w-3" /> Edit
                            </button>
                        )}
                    </div>

                    {question.context_passage && (
                        <div className="text-xs italic text-muted-foreground bg-muted/40 border-l-2 border-primary/60 py-2 px-3 rounded-r-lg max-h-24 overflow-y-auto">
                            <div className="flex items-center gap-1 font-bold uppercase text-[9px] text-muted-foreground not-italic mb-0.5 tracking-wider">
                                <BookOpen className="h-3 w-3 text-primary" /> Context Passage
                            </div>
                            &ldquo;{question.context_passage.passage_text}&rdquo;
                        </div>
                    )}

                    <div className="font-semibold text-xs leading-relaxed text-foreground break-words">
                        {question.question_text}
                    </div>

                    {question.options && question.options.length > 0 && (
                        <button
                            onClick={() => onToggleExpand(question.id)}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-semibold cursor-pointer focus:outline-none pt-0.5"
                        >
                            {isExpanded ? (
                                <>Hide Choices <ChevronUp className="h-3 w-3" /></>
                            ) : (
                                <>Show Choices ({question.options.length}) <ChevronDown className="h-3 w-3" /></>
                            )}
                        </button>
                    )}

                    {isExpanded && question.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40 animate-in fade-in duration-150">
                            {question.options.map((opt, optIdx) => (
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
                                    {opt.is_correct && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {isExpanded && question.explanation && question.explanation.toLowerCase() !== "none" && (
                        <div className="text-[11px] leading-relaxed text-muted-foreground bg-muted/30 border border-border/40 p-2.5 rounded-lg">
                            <span className="font-bold text-primary text-[10px] uppercase block mb-0.5">Explanation:</span>
                            {question.explanation}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
