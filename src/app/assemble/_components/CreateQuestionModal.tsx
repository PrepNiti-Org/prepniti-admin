"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    manText: string;
    setManText: (v: string) => void;
    manTopic: string;
    setManTopic: (v: string) => void;
    manDiff: string;
    setManDiff: (v: string) => void;
    manExpl: string;
    setManExpl: (v: string) => void;
    manOpts: { text: string; isCorrect: boolean }[];
    setManOpts: React.Dispatch<React.SetStateAction<{ text: string; isCorrect: boolean }[]>>;
    onSubmit: (e: React.FormEvent) => void;
    addingQuestion: boolean;
    title?: string;
    submitText?: string;
    description?: string;
}

export function CreateQuestionModal({
    isOpen,
    onClose,
    manText,
    setManText,
    manTopic,
    setManTopic,
    manDiff,
    setManDiff,
    manExpl,
    setManExpl,
    manOpts,
    setManOpts,
    onSubmit,
    addingQuestion,
    title = "Create New Question",
    submitText = "Create Question",
    description = "Add a new manual question directly into the repository bank."
}: CreateQuestionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="border border-border bg-card p-6 rounded-2xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col my-auto max-h-[90vh]">
                <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-foreground font-sans">{title}</h2>
                        <p className="text-[10px] text-muted-foreground">{description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Question Content:
                        </label>
                        <textarea
                            placeholder="Type the question details..."
                            value={manText}
                            onChange={(e) => setManText(e.target.value)}
                            required
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all p-3 rounded-xl text-xs font-semibold focus:outline-none min-h-[70px] leading-relaxed"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Syllabus Topic Tag:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Modern Indian History"
                                value={manTopic}
                                onChange={(e) => setManTopic(e.target.value)}
                                className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Difficulty Level:
                            </label>
                            <select
                                value={manDiff}
                                onChange={(e) => setManDiff(e.target.value)}
                                className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-2 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option className="bg-background">Easy</option>
                                <option className="bg-background">Medium</option>
                                <option className="bg-background">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                MCQ Option Choices:
                            </label>
                            <span className="text-[10px] text-muted-foreground italic font-medium">
                                Tick checkbox next to correct option.
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {manOpts.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-background/50 border border-border p-2.5 rounded-xl">
                                    <span className="text-xs font-mono font-bold text-muted-foreground w-4 text-center">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                        value={opt.text}
                                        onChange={(e) => {
                                            const copy = [...manOpts];
                                            copy[idx].text = e.target.value;
                                            setManOpts(copy);
                                        }}
                                        required={idx < 2}
                                        className="flex-1 bg-transparent border-0 text-xs font-semibold focus:outline-none"
                                    />
                                    <input
                                        type="checkbox"
                                        checked={opt.isCorrect}
                                        onChange={(e) => {
                                            const copy = manOpts.map((o, oIdx) => ({
                                                ...o,
                                                isCorrect: oIdx === idx ? e.target.checked : false
                                            }));
                                            setManOpts(copy);
                                        }}
                                        className="h-4.5 w-4.5 rounded-full border-border text-primary cursor-pointer shrink-0"
                                        title="Mark Correct"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Explanation / Solution Hint:
                        </label>
                        <textarea
                            placeholder="Explain why the option selected is correct..."
                            value={manExpl}
                            onChange={(e) => setManExpl(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all p-3 rounded-xl text-xs font-semibold focus:outline-none min-h-[60px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-border shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addingQuestion}
                            className="px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            {addingQuestion && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
