"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { api } from "../../lib/api";
import {
    Plus,
    Loader2,
    ArrowLeft,
    Trash2,
    Copy,
    CheckCircle2,
    Sparkles,
    Folder,
    FileSpreadsheet,
    Search,
    ChevronUp,
    ChevronDown,
    Layers,
    Save,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Question } from "./_components/types";
import { QuestionBankModal } from "./_components/QuestionBankModal";
import { DraftsDrawer, PaperDraft } from "./_components/DraftsDrawer";
import { BulkUploadModal } from "../manage/_components/BulkUploadModal";
import { PublishConfirmModal } from "./_components/PublishConfirmModal";

const STORAGE_KEY = "prepniti_paper_drafts_v1";

function createEmptyQuestion(index: number): Question {
    return {
        id: "temp_" + Math.random().toString(36).substring(2, 9),
        question_text: "",
        type: "multiple_choice",
        topic: "",
        difficulty: "Medium",
        explanation: "",
        options: [
            { id: "opt_1", option_text: "", is_correct: true },
            { id: "opt_2", option_text: "", is_correct: false },
            { id: "opt_3", option_text: "", is_correct: false },
            { id: "opt_4", option_text: "", is_correct: false },
        ],
    };
}

export default function AssemblePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <AssemblePageContent />
        </Suspense>
    );
}

function AssemblePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paperId = searchParams.get("paperId");

    // Drafts State
    const [drafts, setDrafts] = useState<PaperDraft[]>([]);
    const [activeDraftId, setActiveDraftId] = useState<string>("default");
    const [isDraftsOpen, setIsDraftsOpen] = useState(false);

    // Active Paper State
    const [title, setTitle] = useState("");
    const [targetExam, setTargetExam] = useState("");
    const [examType, setExamType] = useState("");
    const [duration, setDuration] = useState<number | "">("");
    const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion(1)]);
    const [activeQuestionId, setActiveQuestionId] = useState<string>("");

    // Modals
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isConfirmPublishOpen, setIsConfirmPublishOpen] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);

    // Load drafts from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed: PaperDraft[] = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setDrafts(parsed);
                    if (!paperId) {
                        const mostRecent = parsed[0];
                        setActiveDraftId(mostRecent.id);
                        setTitle(mostRecent.title || "");
                        setTargetExam(mostRecent.targetExam || "");
                        setExamType(mostRecent.examType || "");
                        setDuration(mostRecent.duration || "");
                        setQuestions(mostRecent.questions?.length > 0 ? mostRecent.questions : [createEmptyQuestion(1)]);
                        setActiveQuestionId(mostRecent.questions?.[0]?.id || "");
                    }
                }
            }
        } catch {}
    }, [paperId]);

    // If editing existing paper from backend
    useEffect(() => {
        if (paperId) {
            api.get(`/admin/papers/${paperId}`)
                .then((res) => {
                    const data = res.data;
                    setTitle(data.exam_name || data.filename || "");
                    setTargetExam(data.target_exam || "");
                    setExamType(data.exam_type || "");
                    setDuration(data.duration || "");
                    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
                        setQuestions(data.questions);
                        setActiveQuestionId(data.questions[0].id);
                    }
                })
                .catch(() => {
                    toast.error("Failed to load paper for editing.");
                });
        }
    }, [paperId]);

    // Auto-save active state to drafts
    useEffect(() => {
        if (paperId || !activeDraftId) return; // Don't overwrite local drafts if editing live backend paper

        const draftObj: PaperDraft = {
            id: activeDraftId,
            title,
            targetExam,
            examType,
            duration: typeof duration === "number" ? duration : 0,
            updatedAt: Date.now(),
            questions,
        };

        const timer = setTimeout(() => {
            setDrafts((prev) => {
                const index = prev.findIndex((d) => d.id === activeDraftId);
                let next: PaperDraft[];
                if (index !== -1) {
                    next = [...prev];
                    next[index] = draftObj;
                } else if (prev.length === 0) {
                    next = [draftObj];
                } else {
                    next = [draftObj, ...prev];
                }
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch {}
                return next;
            });

            setSavedNotice(true);
            const noticeTimer = setTimeout(() => setSavedNotice(false), 1500);
            return () => clearTimeout(noticeTimer);
        }, 300);

        return () => clearTimeout(timer);
    }, [title, targetExam, examType, duration, questions, activeDraftId, paperId]);

    // Draft Switcher Actions
    const handleSelectDraft = (id: string) => {
        const d = drafts.find((x) => x.id === id);
        if (d) {
            setActiveDraftId(d.id);
            setTitle(d.title || "");
            setTargetExam(d.targetExam || "");
            setExamType(d.examType || "");
            setDuration(d.duration || "");
            setQuestions(d.questions?.length > 0 ? d.questions : [createEmptyQuestion(1)]);
            setActiveQuestionId(d.questions?.[0]?.id || "");
            toast.success(`Resumed draft "${d.title || 'Untitled'}"`);
        }
    };

    const handleNewDraft = () => {
        const newId = "draft_" + Date.now();
        const freshDraft: PaperDraft = {
            id: newId,
            title: "",
            targetExam: "",
            examType: "",
            duration: 0,
            updatedAt: Date.now(),
            questions: [createEmptyQuestion(1)],
        };

        setActiveDraftId(newId);
        setTitle("");
        setTargetExam("");
        setExamType("");
        setDuration("");
        setQuestions(freshDraft.questions);
        setActiveQuestionId(freshDraft.questions[0].id);

        setDrafts((prev) => {
            const next = [freshDraft, ...prev];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
        });
        toast.success("Created fresh test paper draft.");
    };

    const handleDeleteDraft = (idToDelete: string) => {
        const remaining = drafts.filter((d) => d.id !== idToDelete);
        setDrafts(remaining);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
        } catch {}

        if (activeDraftId === idToDelete) {
            if (remaining.length > 0) {
                const nextDraft = remaining[0];
                setActiveDraftId(nextDraft.id);
                setTitle(nextDraft.title || "");
                setTargetExam(nextDraft.targetExam || "");
                setExamType(nextDraft.examType || "");
                setDuration(nextDraft.duration || "");
                setQuestions(nextDraft.questions?.length > 0 ? nextDraft.questions : [createEmptyQuestion(1)]);
                setActiveQuestionId(nextDraft.questions?.[0]?.id || "");
            } else {
                const newId = "draft_" + Date.now();
                const freshQ = [createEmptyQuestion(1)];
                const freshDraft: PaperDraft = {
                    id: newId,
                    title: "",
                    targetExam: "",
                    examType: "",
                    duration: 0,
                    updatedAt: Date.now(),
                    questions: freshQ,
                };
                setActiveDraftId(newId);
                setTitle("");
                setTargetExam("");
                setExamType("");
                setDuration("");
                setQuestions(freshQ);
                setActiveQuestionId(freshQ[0].id);
                setDrafts([freshDraft]);
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify([freshDraft]));
                } catch {}
            }
        }
        toast.success("Draft deleted.");
    };

    // Question Editing Functions
    const handleAddQuestion = () => {
        const newQ = createEmptyQuestion(questions.length + 1);
        setQuestions((prev) => [...prev, newQ]);
        setActiveQuestionId(newQ.id);
    };

    const handleDuplicateQuestion = (idx: number) => {
        const target = questions[idx];
        const duplicated: Question = {
            ...target,
            id: "temp_" + Math.random().toString(36).substring(2, 9),
            options: target.options.map((o) => ({ ...o, id: "opt_" + Math.random().toString(36).substring(2, 7) })),
        };
        const next = [...questions];
        next.splice(idx + 1, 0, duplicated);
        setQuestions(next);
        setActiveQuestionId(duplicated.id);
        toast.success(`Duplicated Question #${idx + 1}`);
    };

    const handleDeleteQuestion = (idx: number) => {
        if (questions.length <= 1) {
            toast.error("A test paper must have at least one question.");
            return;
        }
        const next = questions.filter((_, i) => i !== idx);
        setQuestions(next);
        const nextActive = next[Math.min(idx, next.length - 1)].id;
        setActiveQuestionId(nextActive);
    };

    const handleMoveQuestion = (from: number, to: number) => {
        if (to < 0 || to >= questions.length) return;
        const next = [...questions];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        setQuestions(next);
    };

    const handleUpdateQuestionField = (id: string, field: keyof Question, value: any) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );
    };

    const handleUpdateOption = (qId: string, optIdx: number, text: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                const nextOpts = [...q.options];
                nextOpts[optIdx] = { ...nextOpts[optIdx], option_text: text };
                return { ...q, options: nextOpts };
            })
        );
    };

    const handleSetCorrectOption = (qId: string, optIdx: number) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                const nextOpts = q.options.map((o, idx) => ({
                    ...o,
                    is_correct: idx === optIdx,
                }));
                return { ...q, options: nextOpts };
            })
        );
    };

    const handleAddOptionToQuestion = (qId: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                if (q.options.length >= 6) {
                    toast.error("Maximum 6 options allowed per question.");
                    return q;
                }
                return {
                    ...q,
                    options: [...q.options, { id: "opt_" + Math.random().toString(36).substring(2, 7), option_text: "", is_correct: false }],
                };
            })
        );
    };

    const handleRemoveOptionFromQuestion = (qId: string, optIdx: number) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                if (q.options.length <= 2) {
                    toast.error("At least 2 options are required.");
                    return q;
                }
                const nextOpts = q.options.filter((_, idx) => idx !== optIdx);
                // Ensure at least one is correct
                if (!nextOpts.some((o) => o.is_correct) && nextOpts.length > 0) {
                    nextOpts[0].is_correct = true;
                }
                return { ...q, options: nextOpts };
            })
        );
    };

    // Bank import callback
    const handleAddQuestionsFromBank = (picked: Question[]) => {
        setQuestions((prev) => [...prev, ...picked]);
        toast.success(`Added ${picked.length} questions from question bank!`);
    };

    // Step 1: Validate everything and ask for confirmation
    const handlePublishPaper = () => {
        if (!title.trim()) {
            toast.error("Please enter a Test Paper Title.");
            return;
        }

        if (!targetExam.trim()) {
            toast.error("Please select a Target Exam category.");
            return;
        }

        if (duration === "" || Number(duration) < 5) {
            toast.error("Please enter a test duration of at least 5 minutes.");
            return;
        }

        if (questions.length === 0) {
            toast.error("Test paper must contain at least 1 question.");
            return;
        }

        // Validate each question rigorously
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const qNum = i + 1;

            if (!q.question_text.trim()) {
                toast.error(`Question #${qNum} is missing a question statement.`);
                setActiveQuestionId(q.id);
                document.getElementById(`question-box-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            const filledOptions = q.options.filter((o) => o.option_text.trim().length > 0);
            if (filledOptions.length < 2) {
                toast.error(`Question #${qNum} must have at least 2 option choices filled in.`);
                setActiveQuestionId(q.id);
                document.getElementById(`question-box-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            const correctOption = q.options.find((o) => o.is_correct);
            if (!correctOption) {
                toast.error(`Question #${qNum} has no correct answer marked. Please click a radio choice to mark the answer.`);
                setActiveQuestionId(q.id);
                document.getElementById(`question-box-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            if (!correctOption.option_text.trim()) {
                toast.error(`Question #${qNum}: The marked correct answer has empty text.`);
                setActiveQuestionId(q.id);
                document.getElementById(`question-box-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }
        }

        // All details and questions are valid -> open confirmation modal
        setIsConfirmPublishOpen(true);
    };

    // Step 2: Final Publish execution after confirmation
    const handleConfirmPublish = async () => {
        setPublishing(true);
        try {
            const payload = {
                filename: title.trim(),
                exam_name: title.trim(),
                exam_type: examType,
                duration: Number(duration) || 60,
                target_exam: targetExam,
                questions: questions.map((q) => ({
                    question_text: q.question_text.trim(),
                    type: "multiple_choice",
                    topic: q.topic?.trim() || "General",
                    difficulty: q.difficulty || "Medium",
                    explanation: q.explanation?.trim() || "",
                    options: q.options
                        .filter((o) => o.option_text.trim().length > 0)
                        .map((o) => ({
                            option_text: o.option_text.trim(),
                            is_correct: o.is_correct,
                        })),
                })),
            };

            await api.post("/admin/papers/import-json", payload);
            toast.success(`Test Paper "${title}" published successfully.`);

            // Clear active draft from local storage
            setDrafts((prev) => {
                const next = prev.filter((d) => d.id !== activeDraftId);
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch {}
                return next;
            });

            setIsConfirmPublishOpen(false);
            router.push("/manage");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to publish test paper.");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="container max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 pb-24">
            {/* Top Navigation & Action Header */}
            <div className="pb-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <Link
                        href="/manage"
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Mock Papers
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                            {paperId ? "Edit Test Paper" : "Test Paper Builder"}
                        </h1>
                        {!paperId && (
                            <button
                                onClick={() => setIsDraftsOpen(true)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-bold text-foreground cursor-pointer transition-colors"
                            >
                                <Folder className="h-3.5 w-3.5 text-primary" />
                                Drafts ({drafts.length})
                            </button>
                        )}
                        {savedNotice && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 animate-in fade-in duration-150">
                                <Save className="h-3 w-3 text-emerald-500" /> Auto-saved
                            </span>
                        )}
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsBankModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                        <Search className="h-3.5 w-3.5 text-primary" /> Pick from Bank
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> Upload File
                    </button>
                    <button
                        onClick={handlePublishPaper}
                        disabled={publishing}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                    >
                        {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {paperId ? "Save Changes" : "Publish Test Paper"}
                    </button>
                </div>
            </div>

            {/* Step 1: Test Paper Details Bar */}
            <div className="p-4 bg-card border border-border rounded-2xl shadow-sm space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-6 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Test Paper Name:
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. SBI Clerk Prelims 2026 - Mock Test 1"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-muted/30 text-foreground border border-border focus:bg-background focus:border-primary h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Exam Category:
                        </label>
                        <select
                            value={targetExam}
                            onChange={(e) => setTargetExam(e.target.value)}
                            className="w-full bg-muted/30 text-foreground border border-border focus:bg-background focus:border-primary h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="">Select Exam Category...</option>
                            <option value="Banking">Banking (SBI, IBPS)</option>
                            <option value="UPSC">UPSC Civil Services</option>
                            <option value="SSC">SSC CGL / CHSL</option>
                            <option value="JEE">JEE Main & Advanced</option>
                            <option value="NEET">NEET Medical</option>
                            <option value="State PCS">State PCS</option>
                            <option value="Defence">Defence / NDA / CDS</option>
                            <option value="Teaching">Teaching / CTET</option>
                            <option value="General">General Practice</option>
                        </select>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Duration (Minutes):
                        </label>
                        <input
                            type="number"
                            min={5}
                            max={360}
                            placeholder="e.g. 60"
                            value={duration}
                            onChange={(e) => {
                                const val = e.target.value;
                                setDuration(val === "" ? "" : Number(val));
                            }}
                            className="w-full bg-muted/30 text-foreground border border-border focus:bg-background focus:border-primary h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Step 2: Question-by-Question List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground">
                            Questions in this Test ({questions.length})
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            • Click any choice circle to set the correct answer
                        </span>
                    </div>
                </div>

                {/* Questions Cards */}
                <div className="space-y-4">
                    {questions.map((q, qIdx) => {
                        const isComplete = q.question_text.trim() && q.options.some((o) => o.is_correct && o.option_text.trim());

                        return (
                            <div
                                key={q.id}
                                id={`question-box-${q.id}`}
                                className={`p-5 rounded-2xl border transition-all space-y-4 bg-card shadow-sm ${
                                    activeQuestionId === q.id
                                        ? "border-primary ring-1 ring-primary/20"
                                        : "border-border"
                                }`}
                                onClick={() => setActiveQuestionId(q.id)}
                            >
                                {/* Card Top Row: Index, Topic, Difficulty & Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-6 w-6 rounded-lg bg-primary text-primary-foreground text-xs font-bold font-mono flex items-center justify-center">
                                            {qIdx + 1}
                                        </span>
                                        <span className="text-xs font-bold text-foreground">
                                            Question #{qIdx + 1}
                                        </span>
                                        {isComplete ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="h-3 w-3" /> Ready
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                <AlertCircle className="h-3 w-3" /> Needs Details
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Subject / Topic Tag Input */}
                                        <input
                                            type="text"
                                            placeholder="Topic (e.g. Reasoning)"
                                            value={q.topic || ""}
                                            onChange={(e) => handleUpdateQuestionField(q.id, "topic", e.target.value)}
                                            className="bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary h-7 px-2 rounded-lg text-xs font-semibold focus:outline-none w-32 sm:w-40"
                                        />

                                        {/* Difficulty Selector */}
                                        <select
                                            value={q.difficulty || "Medium"}
                                            onChange={(e) => handleUpdateQuestionField(q.id, "difficulty", e.target.value)}
                                            className="bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary h-7 px-2 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>

                                        {/* Move Up / Down */}
                                        <button
                                            type="button"
                                            disabled={qIdx === 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveQuestion(qIdx, qIdx - 1);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                            title="Move Up"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={qIdx === questions.length - 1}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveQuestion(qIdx, qIdx + 1);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                            title="Move Down"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </button>

                                        {/* Duplicate & Delete */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDuplicateQuestion(qIdx);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                            title="Duplicate Question"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteQuestion(qIdx);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                            title="Delete Question"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Question Statement Textarea */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">
                                        Question Statement:
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Type or paste the question text here..."
                                        value={q.question_text}
                                        onChange={(e) => handleUpdateQuestionField(q.id, "question_text", e.target.value)}
                                        className="w-full bg-muted/20 text-foreground border border-border focus:bg-background focus:border-primary p-3 rounded-xl text-xs font-semibold focus:outline-none resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Options List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                        <span>Answer Choices: (Select the radio circle of the correct answer)</span>
                                        <button
                                            type="button"
                                            onClick={() => handleAddOptionToQuestion(q.id)}
                                            className="text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="h-3 w-3" /> Add Choice
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {q.options.map((opt, optIdx) => {
                                            const letter = String.fromCharCode(65 + optIdx);

                                            return (
                                                <div
                                                    key={opt.id || optIdx}
                                                    className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all ${
                                                        opt.is_correct
                                                            ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                                                            : "border-border bg-muted/20 focus-within:border-border/80"
                                                    }`}
                                                >
                                                    {/* Radio button for Correct Choice */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetCorrectOption(q.id, optIdx)}
                                                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                                            opt.is_correct
                                                                ? "border-emerald-500 bg-emerald-500 text-white"
                                                                : "border-muted-foreground/40 hover:border-primary bg-background"
                                                        }`}
                                                        title={`Mark Choice ${letter} as Correct Answer`}
                                                    >
                                                        {opt.is_correct && <div className="h-2 w-2 rounded-full bg-white" />}
                                                    </button>

                                                    <span className="font-mono font-bold text-xs text-muted-foreground shrink-0">
                                                        {letter}.
                                                    </span>

                                                    <input
                                                        type="text"
                                                        placeholder={`Choice ${letter} text...`}
                                                        value={opt.option_text}
                                                        onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                                                        className="flex-1 bg-transparent text-foreground text-xs font-semibold focus:outline-none"
                                                    />

                                                    {q.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOptionFromQuestion(q.id, optIdx)}
                                                            className="text-muted-foreground hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Explanation / Solution box */}
                                <div className="space-y-1 pt-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground">
                                        Solution Explanation (Optional):
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Explain the step-by-step reasoning or solution for students..."
                                        value={q.explanation || ""}
                                        onChange={(e) => handleUpdateQuestionField(q.id, "explanation", e.target.value)}
                                        className="w-full bg-muted/10 text-foreground border border-border/80 focus:bg-background focus:border-primary p-2.5 rounded-xl text-xs focus:outline-none resize-none leading-relaxed"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Next Question Prominent Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full sm:w-auto px-8 py-3 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/[0.03] text-primary hover:bg-primary/[0.07] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> + Add Next Question
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsBankModalOpen(true)}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                        <Search className="h-3.5 w-3.5 text-primary" /> Pick from Question Bank
                    </button>
                </div>
            </div>

            {/* Question Bank Modal */}
            <QuestionBankModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                onAddQuestions={handleAddQuestionsFromBank}
                alreadyAddedIds={questions.map((q) => q.id)}
            />

            {/* Bulk Upload Modal */}
            <BulkUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={() => {
                    toast.success("File uploaded successfully.");
                    router.push("/manage");
                }}
            />

            {/* Drafts Drawer */}
            <DraftsDrawer
                isOpen={isDraftsOpen}
                onClose={() => setIsDraftsOpen(false)}
                drafts={drafts}
                activeDraftId={activeDraftId}
                onSelectDraft={handleSelectDraft}
                onNewDraft={handleNewDraft}
                onDeleteDraft={handleDeleteDraft}
            />

            {/* Publish Confirmation Modal */}
            <PublishConfirmModal
                isOpen={isConfirmPublishOpen}
                onClose={() => setIsConfirmPublishOpen(false)}
                onConfirmPublish={handleConfirmPublish}
                publishing={publishing}
                paperTitle={title}
                targetExam={targetExam}
                duration={duration}
                examType={examType}
                questions={questions}
                isEditing={!!paperId}
            />
        </div>
    );
}
