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
        if (d === "easy") return "bg-green-500/10 text-green-500 border border-green-500/20";
        if (d === "medium" || d === "average") return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
        if (d === "hard" || d === "difficult") return "bg-red-500/10 text-red-500 border border-red-500/20";
        return "bg-muted text-muted-foreground border border-border";
    };

    const getDifficultyColor = (diff?: string) => {
        const d = diff?.toLowerCase();
        if (d === "easy") return "text-emerald-600 dark:text-emerald-500";
        if (d === "medium" || d === "average") return "text-amber-600 dark:text-amber-500";
        if (d === "hard" || d === "difficult") return "text-rose-600 dark:text-rose-500";
        return "text-muted-foreground/60";
    };

    return (
        <Card
            className={`transition-all duration-200 ${isChecked
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
        >
            <div className="p-5 flex items-start gap-4">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSelect(question.id)}
                    className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                />
                <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-primary uppercase tracking-wide w-full">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                                {question.type.toLowerCase() === "multiple_choice" ? "MCQ" : question.type}
                            </span>
                            {question.topic && question.topic.toLowerCase() !== "none" && (
                                <span className="bg-muted text-muted-foreground border border-border px-2.5 py-0.5 rounded-full font-semibold">
                                    {question.topic}
                                </span>
                            )}
                            <span className={`px-2.5 py-0.5 rounded-full font-semibold ${getDifficultyBadge(question.difficulty)}`}>
                                {(!question.difficulty || question.difficulty.toLowerCase() === "none") ? "Unspecified" : question.difficulty}
                            </span>
                        </div>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(question)}
                                className="flex items-center gap-1 text-[10px] font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/80 px-2.5 py-1 rounded-full transition-colors cursor-pointer capitalize"
                            >
                                <Edit className="h-3 w-3" /> Edit
                            </button>
                        )}
                    </div>

                    {question.context_passage && (
                        <div className="text-xs italic text-muted-foreground bg-primary/5 border-l-2 border-primary py-2.5 px-4 rounded-r-xl max-h-24 overflow-y-auto">
                            <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-muted-foreground/80 not-italic mb-1 tracking-wider">
                                <BookOpen className="h-3.5 w-3.5 text-primary" /> Passage Context
                            </div>
                            "{question.context_passage.passage_text}"
                        </div>
                    )}

                    <div className="font-semibold text-xs leading-relaxed text-foreground break-words font-sans">
                        {question.question_text}
                    </div>

                    {question.explanation && question.explanation.toLowerCase() !== "none" && (
                        <div className="text-[11px] leading-relaxed text-muted-foreground bg-secondary/20 border border-border/40 p-3 rounded-xl max-h-28 overflow-y-auto">
                            <span className="font-bold text-primary text-[10px] uppercase block mb-1">Explanation:</span>
                            {question.explanation}
                        </div>
                    )}

                    {question.options && question.options.length > 0 && (
                        <button
                            onClick={() => onToggleExpand(question.id)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer focus:outline-none"
                        >
                            {isExpanded ? (
                                <>Hide Choices <ChevronUp className="h-3.5 w-3.5" /></>
                            ) : (
                                <>Show Choices ({question.options.length}) <ChevronDown className="h-3.5 w-3.5" /></>
                            )}
                        </button>
                    )}

                    {isExpanded && question.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-border/40 animate-in fade-in duration-150">
                            {question.options.map((opt) => (
                                <div
                                    key={opt.id}
                                    className={`border rounded-xl p-3 text-xs font-semibold flex items-center justify-between ${opt.is_correct
                                            ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-500"
                                            : "border-border text-muted-foreground bg-background/50"
                                        }`}
                                >
                                    <span>{opt.option_text}</span>
                                    {opt.is_correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
