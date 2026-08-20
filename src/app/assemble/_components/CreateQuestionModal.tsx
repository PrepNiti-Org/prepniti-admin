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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="border border-border bg-card p-6 rounded-2xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col my-auto max-h-[90vh]">
                <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Question Content:
                        </label>
                        <textarea
                            placeholder="Type question prompt or problem statement..."
                            value={manText}
                            onChange={(e) => setManText(e.target.value)}
                            required
                            rows={3}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all p-3 rounded-xl text-xs font-semibold focus:outline-none leading-relaxed resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Syllabus Topic Tag:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Modern Indian History"
                                value={manTopic}
                                onChange={(e) => setManTopic(e.target.value)}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Difficulty Level:
                            </label>
                            <select
                                value={manDiff}
                                onChange={(e) => setManDiff(e.target.value)}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="Easy" className="bg-background">Easy</option>
                                <option value="Medium" className="bg-background">Medium</option>
                                <option value="Hard" className="bg-background">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Option Choices:
                            </label>
                            <span className="text-[10px] text-muted-foreground italic font-medium">
                                Mark the radio button for the correct option.
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {manOpts.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-2 border p-2.5 rounded-xl transition-all ${
                                        opt.isCorrect
                                            ? "border-emerald-500/40 bg-emerald-500/5"
                                            : "border-border bg-muted/20 hover:border-border/80"
                                    }`}
                                >
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
                                        className="flex-1 bg-transparent border-0 text-xs font-semibold focus:outline-none text-foreground"
                                    />
                                    <input
                                        type="radio"
                                        name="correct-option-group"
                                        checked={opt.isCorrect}
                                        onChange={() => {
                                            const copy = manOpts.map((o, oIdx) => ({
                                                ...o,
                                                isCorrect: oIdx === idx
                                            }));
                                            setManOpts(copy);
                                        }}
                                        className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0"
                                        title="Mark Correct Answer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Explanation / Solution Hint:
                        </label>
                        <textarea
                            placeholder="Explain why the marked answer is correct..."
                            value={manExpl}
                            onChange={(e) => setManExpl(e.target.value)}
                            rows={2}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all p-3 rounded-xl text-xs font-semibold focus:outline-none leading-relaxed resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-border shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addingQuestion}
                            className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary hover:opacity-90 text-primary-foreground flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
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
