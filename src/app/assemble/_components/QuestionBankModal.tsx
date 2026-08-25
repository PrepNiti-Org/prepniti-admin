"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import {
    X,
    Search,
    Loader2,
    CheckSquare,
    BookOpen,
    CheckCircle2,
    Plus,
    Image as ImageIcon,
} from "lucide-react";
import { Question } from "./types";
import { toast } from "sonner";

interface QuestionBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddQuestions: (questions: Question[]) => void;
    alreadyAddedIds: string[];
}

export function QuestionBankModal({
    isOpen,
    onClose,
    onAddQuestions,
    alreadyAddedIds,
}: QuestionBankModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [topic, setTopic] = useState("all");
    const [diff, setDiff] = useState("all");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [topicsList, setTopicsList] = useState<{ name: string; count: number }[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        api.get("/admin/questions/facets")
            .then((res: any) => {
                setTopicsList(res.data?.topics || []);
            })
            .catch(() => {});
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            setLoading(true);
            const params = new URLSearchParams();
            params.set("page", "1");
            params.set("limit", "50");
            if (searchQuery.trim()) params.set("q", searchQuery.trim());
            if (topic !== "all") params.set("topic", topic);
            if (diff !== "all") params.set("difficulty", diff);

            api.get<{ questions: Question[] }>(`/admin/questions?${params.toString()}`)
                .then((res) => {
                    setQuestions(res.data.questions || []);
                })
                .catch(() => {
                    toast.error("Failed to load question bank.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen, searchQuery, topic, diff]);

    if (!isOpen) return null;

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(x => x !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handleConfirm = () => {
        const chosen = questions.filter(q => selectedIds.includes(q.id));
        if (chosen.length === 0) {
            toast.error("Please select at least one question.");
            return;
        }
        onAddQuestions(chosen);
        setSelectedIds([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                        <h2 className="text-base font-bold text-foreground">Pick from Question Bank</h2>
                        <p className="text-xs text-muted-foreground">
                            Search and select existing questions to add to your test paper.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6 relative flex items-center">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                        <input
                            type="text"
                            placeholder="Search questions by keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary transition-all h-9 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                    </div>
                    <div className="sm:col-span-4">
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary transition-all h-9 px-2.5 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Topics</option>
                            {topicsList.map((t) => (
                                <option key={t.name} value={t.name}>
                                    {t.name} ({t.count})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <select
                            value={diff}
                            onChange={(e) => setDiff(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary transition-all h-9 px-2 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="all">Any Diff</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                {/* Questions List */}
                <div className="max-h-96 overflow-y-auto space-y-2 border border-border rounded-xl p-2 bg-muted/10">
                    {loading ? (
                        <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs">Searching repository...</span>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-xs">
                            No questions found matching your filter.
                        </div>
                    ) : (
                        questions.map((q) => {
                            const isAlreadyInPaper = alreadyAddedIds.includes(q.id);
                            const isSelected = selectedIds.includes(q.id);

                            return (
                                <div
                                    key={q.id}
                                    onClick={() => !isAlreadyInPaper && handleToggle(q.id)}
                                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 select-none ${
                                        isAlreadyInPaper
                                            ? "opacity-50 border-border bg-muted/20 cursor-not-allowed"
                                            : isSelected
                                            ? "border-primary bg-primary/[0.04] cursor-pointer"
                                            : "border-border/80 hover:border-border bg-card cursor-pointer"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        disabled={isAlreadyInPaper}
                                        checked={isAlreadyInPaper || isSelected}
                                        onChange={() => !isAlreadyInPaper && handleToggle(q.id)}
                                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                                    />
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            {q.topic && (
                                                <span className="text-[10px] font-bold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                                    {q.topic}
                                                </span>
                                            )}
                                            {q.difficulty && (
                                                <span className="text-[10px] font-semibold text-muted-foreground">
                                                    • {q.difficulty}
                                                </span>
                                            )}
                                            {q.image_url && (
                                                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <ImageIcon className="h-2.5 w-2.5" /> Diagram
                                                </span>
                                            )}
                                            {isAlreadyInPaper && (
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                                                    Already in Paper
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-foreground line-clamp-2">
                                            {q.question_text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                    <span className="text-muted-foreground font-semibold">
                        Selected: <strong className="text-primary">{selectedIds.length}</strong> questions
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Selected to Paper
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
