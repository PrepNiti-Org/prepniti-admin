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
    ChevronLeft,
    ChevronRight,
    Save,
    AlertCircle,
    BookOpen,
    HelpCircle,
    Clock,
    Layers,
    Image as ImageIcon,
    UploadCloud,
    Sun,
    Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Question } from "./_components/types";
import { QuestionBankModal } from "./_components/QuestionBankModal";
import { DraftsDrawer, PaperDraft } from "./_components/DraftsDrawer";
import { BulkUploadModal } from "../manage/_components/BulkUploadModal";
import { PublishConfirmModal } from "./_components/PublishConfirmModal";
import { InlineMathTextarea } from "./_components/InlineMathTextarea";
import { InlineChoiceField } from "./_components/InlineChoiceField";
import { latexToVisualText } from "../../lib/mathConverter";

const STORAGE_KEY = "prepniti_paper_drafts_v1";

function sanitizeQuestionForVisualEditing(q: Question): Question {
    return {
        ...q,
        question_text: latexToVisualText(q.question_text || ""),
        passage_text: latexToVisualText(q.passage_text || q.context_passage?.passage_text || ""),
        explanation: latexToVisualText(q.explanation || ""),
        image_url: q.image_url || "",
        image_dark_url: q.image_dark_url || "",
        image_dark_invert: Boolean(q.image_dark_invert),
        options: (q.options || []).map((opt) => ({
            ...opt,
            option_text: latexToVisualText(opt.option_text || ""),
        })),
    };
}

function createEmptyQuestion(index: number): Question {
    return {
        id: "temp_" + Math.random().toString(36).substring(2, 9),
        question_text: "",
        type: "single_choice",
        topic: "",
        difficulty: "Medium",
        explanation: "",
        passage_text: "",
        image_url: "",
        image_dark_url: "",
        image_dark_invert: false,
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
    const [examType, setExamType] = useState("Mock");
    const [duration, setDuration] = useState<number | "">(60);
    const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion(1)]);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

    // Modals
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isConfirmPublishOpen, setIsConfirmPublishOpen] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);

    // Diagram Upload States
    const [uploadingDiagram, setUploadingDiagram] = useState(false);
    const [uploadingDarkDiagram, setUploadingDarkDiagram] = useState(false);
    const [showDarkUploader, setShowDarkUploader] = useState(false);
    const lightInputRef = React.useRef<HTMLInputElement>(null);
    const darkInputRef = React.useRef<HTMLInputElement>(null);

    // Load drafts from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed: PaperDraft[] = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const cleanedDrafts = parsed.map((d) => ({
                        ...d,
                        questions: (d.questions || []).map(sanitizeQuestionForVisualEditing),
                    }));
                    setDrafts(cleanedDrafts);

                    if (!paperId) {
                        const first = cleanedDrafts[0];
                        setActiveDraftId(first.id);
                        setTitle(first.title || "");
                        setTargetExam(first.targetExam || "");
                        setExamType(first.examType || "Mock");
                        setDuration(first.duration || 60);
                        if (first.questions && first.questions.length > 0) {
                            setQuestions(first.questions);
                        }
                    }
                }
            }
        } catch {}
    }, [paperId]);

    // Load existing paper if editing
    useEffect(() => {
        if (paperId) {
            api.get(`/admin/papers/${paperId}`)
                .then((res) => {
                    const data = res.data;
                    setTitle(data.filename || data.exam_name || "");
                    setTargetExam(data.target_exam || "");
                    setExamType(data.exam_type || "Mock");
                    setDuration(data.duration || 60);

                    const loadedQuestions: Question[] = [];
                    if (Array.isArray(data.blueprint)) {
                        data.blueprint.forEach((elem: any) => {
                            if (elem.questions) {
                                elem.questions.forEach((q: any) => {
                                    loadedQuestions.push(sanitizeQuestionForVisualEditing({
                                        ...q,
                                        passage_text: elem.is_passage ? elem.passage_text : (q.passage_text || q.context_passage?.passage_text || ""),
                                    }));
                                });
                            }
                        });
                    } else if (Array.isArray(data.questions)) {
                        data.questions.forEach((q: any) => {
                            loadedQuestions.push(sanitizeQuestionForVisualEditing(q));
                        });
                    }

                    if (loadedQuestions.length > 0) {
                        setQuestions(loadedQuestions);
                        setActiveQuestionIndex(0);
                    }
                })
                .catch(() => {
                    toast.error("Failed to load paper for editing.");
                });
        }
    }, [paperId]);

    // Auto-save active state to drafts
    useEffect(() => {
        if (paperId || !activeDraftId) return;

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
            setExamType(d.examType || "Mock");
            setDuration(d.duration || 60);
            const cleaned = (d.questions || []).map(sanitizeQuestionForVisualEditing);
            setQuestions(cleaned.length > 0 ? cleaned : [createEmptyQuestion(1)]);
            setActiveQuestionIndex(0);
            toast.success(`Resumed draft "${d.title || 'Untitled'}"`);
        }
    };

    const handleNewDraft = () => {
        const newId = "draft_" + Date.now();
        const freshDraft: PaperDraft = {
            id: newId,
            title: "",
            targetExam: "",
            examType: "Mock",
            duration: 60,
            updatedAt: Date.now(),
            questions: [createEmptyQuestion(1)],
        };

        setActiveDraftId(newId);
        setTitle("");
        setTargetExam("");
        setExamType("Mock");
        setDuration(60);
        setQuestions(freshDraft.questions);
        setActiveQuestionIndex(0);

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
                setExamType(nextDraft.examType || "Mock");
                setDuration(nextDraft.duration || 60);
                const cleaned = (nextDraft.questions || []).map(sanitizeQuestionForVisualEditing);
                setQuestions(cleaned.length > 0 ? cleaned : [createEmptyQuestion(1)]);
                setActiveQuestionIndex(0);
            } else {
                handleNewDraft();
            }
        }
    };

    // Question Management Actions
    const handleAddQuestion = () => {
        const newQ = createEmptyQuestion(questions.length + 1);
        setQuestions((prev) => [...prev, newQ]);
        setActiveQuestionIndex(questions.length);
    };

    const handleDeleteQuestion = (qIdx: number) => {
        if (questions.length === 1) {
            toast.error("Test paper must contain at least 1 question.");
            return;
        }
        setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
        if (activeQuestionIndex >= questions.length - 1) {
            setActiveQuestionIndex(Math.max(0, questions.length - 2));
        }
    };

    const handleDuplicateQuestion = (qIdx: number) => {
        const target = questions[qIdx];
        const duplicated: Question = {
            ...JSON.parse(JSON.stringify(target)),
            id: "temp_" + Math.random().toString(36).substring(2, 9),
            options: target.options.map((opt) => ({
                ...opt,
                id: "opt_" + Math.random().toString(36).substring(2, 9),
            })),
        };
        setQuestions((prev) => {
            const next = [...prev];
            next.splice(qIdx + 1, 0, duplicated);
            return next;
        });
        setActiveQuestionIndex(qIdx + 1);
        toast.success(`Duplicated Question #${qIdx + 1}`);
    };

    const handleMoveQuestion = (fromIdx: number, toIdx: number) => {
        if (toIdx < 0 || toIdx >= questions.length) return;
        setQuestions((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
        });
        setActiveQuestionIndex(toIdx);
    };

    const handleUpdateQuestionField = (qId: string, field: keyof Question, value: any) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === qId ? { ...q, [field]: value } : q))
        );
    };

    const handleToggleQuestionType = (qId: string, typeVal: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                return {
                    ...q,
                    type: typeVal,
                };
            })
        );
    };

    const handleOptionTextChange = (qId: string, optIdx: number, text: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                const nextOptions = [...q.options];
                if (nextOptions[optIdx]) {
                    nextOptions[optIdx] = { ...nextOptions[optIdx], option_text: text };
                }
                return { ...q, options: nextOptions };
            })
        );
    };

    const handleOptionCorrectToggle = (qId: string, optIdx: number, isMSQ: boolean) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                let nextOptions = [...q.options];
                if (isMSQ) {
                    nextOptions[optIdx] = {
                        ...nextOptions[optIdx],
                        is_correct: !nextOptions[optIdx].is_correct,
                    };
                } else {
                    nextOptions = nextOptions.map((opt, idx) => ({
                        ...opt,
                        is_correct: idx === optIdx,
                    }));
                }
                return { ...q, options: nextOptions };
            })
        );
    };

    const handleAddOptionToQuestion = (qId: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                return {
                    ...q,
                    options: [
                        ...q.options,
                        {
                            id: "opt_" + Math.random().toString(36).substring(2, 9),
                            option_text: "",
                            is_correct: false,
                        },
                    ],
                };
            })
        );
    };

    const handleRemoveOption = (qId: string, optIdx: number) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                if (q.options.length <= 2) {
                    toast.error("Question must have at least 2 choices.");
                    return q;
                }
                const nextOptions = q.options.filter((_, idx) => idx !== optIdx);
                if (!nextOptions.some((o) => o.is_correct) && nextOptions.length > 0) {
                    nextOptions[0].is_correct = true;
                }
                return { ...q, options: nextOptions };
            })
        );
    };

    const handleUploadDiagramForQuestion = async (file: File, variant: "light" | "dark", qId: string) => {
        if (file.size > 300 * 1024) {
            toast.error(`Diagram size (${Math.round(file.size / 1024)} KB) exceeds 300 KB limit. Please compress or optimize the image.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("variant", variant);

        if (variant === "light") setUploadingDiagram(true);
        else setUploadingDarkDiagram(true);

        try {
            const res = await api.post("/admin/upload/diagram", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data?.url) {
                if (variant === "light") {
                    handleUpdateQuestionField(qId, "image_url", res.data.url);
                    toast.success("Primary diagram uploaded successfully!");
                } else {
                    handleUpdateQuestionField(qId, "image_dark_url", res.data.url);
                    toast.success("Dark theme diagram uploaded successfully!");
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to upload diagram");
        } finally {
            if (variant === "light") setUploadingDiagram(false);
            else setUploadingDarkDiagram(false);
        }
    };

    const handleAddQuestionsFromBank = (picked: Question[]) => {
        const cleaned = picked.map(sanitizeQuestionForVisualEditing);
        setQuestions((prev) => [...prev, ...cleaned]);
        toast.success(`Added ${picked.length} questions from question bank!`);
    };

    // Publish Validation
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

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const qNum = i + 1;

            if (!q.question_text.trim()) {
                toast.error(`Question #${qNum} is missing a question statement.`);
                setActiveQuestionIndex(i);
                return;
            }

            const filledOptions = q.options.filter((o) => o.option_text.trim().length > 0);
            if (filledOptions.length < 2) {
                toast.error(`Question #${qNum} must have at least 2 option choices.`);
                setActiveQuestionIndex(i);
                return;
            }

            const correctOptions = q.options.filter((o) => o.is_correct);
            if (correctOptions.length === 0) {
                toast.error(`Question #${qNum} has no correct answer marked.`);
                setActiveQuestionIndex(i);
                return;
            }

            for (const cOpt of correctOptions) {
                if (!cOpt.option_text.trim()) {
                    toast.error(`Question #${qNum} marked an empty choice as the correct answer.`);
                    setActiveQuestionIndex(i);
                    return;
                }
            }
        }

        setIsConfirmPublishOpen(true);
    };

    // Final Publish Execution
    const handleConfirmPublish = async () => {
        setPublishing(true);
        try {
            const payload = {
                id: paperId || undefined,
                paper_id: paperId || undefined,
                filename: title.trim(),
                exam_name: title.trim(),
                exam_type: examType,
                duration: Number(duration) || 60,
                target_exam: targetExam,
                questions: questions.map((q) => ({
                    id: q.id,
                    question_text: q.question_text.trim(),
                    type: q.type || "multiple_choice",
                    topic: q.topic?.trim() || "General",
                    difficulty: q.difficulty || "Medium",
                    explanation: q.explanation?.trim() || "",
                    passage_text: q.passage_text?.trim() || q.context_passage?.passage_text?.trim() || "",
                    image_url: q.image_url?.trim() || undefined,
                    image_dark_url: q.image_dark_url?.trim() || undefined,
                    image_dark_invert: Boolean(q.image_dark_invert),
                    options: q.options
                        .filter((o) => o.option_text.trim().length > 0)
                        .map((o) => ({
                            id: o.id,
                            option_text: o.option_text.trim(),
                            is_correct: o.is_correct,
                        })),
                })),
            };

            await api.post("/admin/papers/import-json", payload);
            toast.success(
                paperId
                    ? `Test Paper "${title}" updated successfully.`
                    : `Test Paper "${title}" published successfully.`
            );

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

    const activeQuestion = questions[activeQuestionIndex] || questions[0];
    const isMSQ = activeQuestion?.type === "multiple_choice";

    return (
        <div className="container max-w-7xl mx-auto space-y-4 animate-in fade-in duration-200 pb-20">
            {/* Top Navigation & Primary Action Header */}
            <div className="pb-3 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link
                        href="/manage"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Back to Papers"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-foreground">
                                {paperId ? "Edit Test Paper" : "Test Paper Builder"}
                            </h1>
                            {savedNotice && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Save className="h-3 w-3 text-emerald-500" /> Auto-saved
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {questions.length} questions • {duration || 60} minutes • {targetExam || "Category not set"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {!paperId && (
                        <button
                            onClick={() => setIsDraftsOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer transition-colors"
                        >
                            <Folder className="h-3.5 w-3.5 text-primary" /> Drafts ({drafts.length})
                        </button>
                    )}
                    <button
                        onClick={() => setIsBankModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer transition-colors"
                    >
                        <Search className="h-3.5 w-3.5 text-primary" /> Question Bank
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer transition-colors"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> Upload CSV/JSON
                    </button>
                    <button
                        onClick={handlePublishPaper}
                        disabled={publishing}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                        {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {paperId ? "Save Changes" : "Publish Paper"}
                    </button>
                </div>
            </div>

            {/* Compact Test Paper Settings Strip */}
            <div className="p-3.5 bg-card border border-border rounded-xl shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                    <div className="lg:col-span-6 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Test Paper Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. SBI Clerk Prelims 2026 - Mock Test 1"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-muted/20 text-foreground border border-border focus:bg-background focus:border-primary h-8 px-3 rounded-lg text-xs font-medium focus:outline-none"
                        />
                    </div>

                    <div className="lg:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Exam Category
                        </label>
                        <select
                            value={targetExam}
                            onChange={(e) => setTargetExam(e.target.value)}
                            className="w-full bg-muted/20 text-foreground border border-border focus:bg-background focus:border-primary h-8 px-2.5 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                        >
                            <option value="">Select Category...</option>
                            <option value="Banking">Banking (SBI, IBPS)</option>
                            <option value="UPSC">UPSC Civil Services</option>
                            <option value="SSC">SSC CGL / CHSL</option>
                            <option value="JEE">JEE Main & Advanced</option>
                            <option value="NEET">NEET Medical</option>
                            <option value="State PCS">State PCS</option>
                            <option value="Defence">Defence / NDA</option>
                            <option value="Teaching">Teaching / CTET</option>
                            <option value="General">General Practice</option>
                        </select>
                    </div>

                    <div className="lg:col-span-3 space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Duration (Minutes)
                        </label>
                        <input
                            type="number"
                            min={5}
                            max={360}
                            placeholder="60"
                            value={duration}
                            onChange={(e) => {
                                const val = e.target.value;
                                setDuration(val === "" ? "" : Number(val));
                            }}
                            className="w-full bg-muted/20 text-foreground border border-border focus:bg-background focus:border-primary h-8 px-3 rounded-lg text-xs font-medium focus:outline-none font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* 2-Column Focused Workspace: Left Question Navigator + Right Active Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Column: Question Navigator */}
                <div className="lg:col-span-4 bg-card border border-border rounded-xl p-3.5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                                Questions ({questions.length})
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer"
                        >
                            <Plus className="h-3 w-3" /> Add Question
                        </button>
                    </div>

                    {/* Question List Strip */}
                    <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                        {questions.map((q, idx) => {
                            const isActive = idx === activeQuestionIndex;
                            const isReady = q.question_text.trim() && q.options.some((o) => o.is_correct && o.option_text.trim());

                            return (
                                <div
                                    key={q.id || idx}
                                    onClick={() => setActiveQuestionIndex(idx)}
                                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer text-left text-xs ${
                                        isActive
                                            ? "bg-primary/10 border-primary text-foreground font-semibold shadow-2xs"
                                            : "bg-muted/10 hover:bg-muted/30 border-border/70 text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                                        <span className={`h-5 w-5 rounded font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        <span className="truncate text-xs font-medium">
                                            {q.question_text.trim() || `Question #${idx + 1}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {isReady ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteQuestion(idx);
                                            }}
                                            className="p-1 hover:text-rose-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Active Question Canvas */}
                {activeQuestion && (
                    <div className="lg:col-span-8 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-5">
                        {/* Question Canvas Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <span className="h-7 w-7 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold flex items-center justify-center">
                                    Q{activeQuestionIndex + 1}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <select
                                        value={activeQuestion.type || "single_choice"}
                                        onChange={(e) => handleToggleQuestionType(activeQuestion.id, e.target.value)}
                                        className="h-7 px-2 rounded-lg text-xs font-semibold bg-muted/30 border border-border text-foreground focus:outline-none cursor-pointer"
                                    >
                                        <option value="single_choice">Single Correct (SCQ)</option>
                                        <option value="multiple_choice">Multiple Correct (MSQ)</option>
                                    </select>
                                    <select
                                        value={activeQuestion.difficulty || "Medium"}
                                        onChange={(e) => handleUpdateQuestionField(activeQuestion.id, "difficulty", e.target.value)}
                                        className="h-7 px-2 rounded-lg text-xs font-semibold bg-muted/30 border border-border text-foreground focus:outline-none cursor-pointer"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    placeholder="Topic (e.g. Reasoning)"
                                    value={activeQuestion.topic || ""}
                                    onChange={(e) => handleUpdateQuestionField(activeQuestion.id, "topic", e.target.value)}
                                    className="bg-muted/30 text-foreground border border-border focus:bg-background focus:border-primary h-7 px-2.5 rounded-lg text-xs font-medium focus:outline-none w-36"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDuplicateQuestion(activeQuestionIndex)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                    title="Duplicate Question"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(activeQuestionIndex)}
                                    className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Question"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Context Passage Section (Collapsible) */}
                        {typeof activeQuestion.passage_text === "string" && activeQuestion.passage_text.length > 0 ? (
                            <div className="bg-muted/20 border border-primary/20 rounded-xl p-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                    <span className="flex items-center gap-1.5 text-primary">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Context Passage / Case Study
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {activeQuestionIndex > 0 && questions[activeQuestionIndex - 1]?.passage_text && (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateQuestionField(activeQuestion.id, "passage_text", questions[activeQuestionIndex - 1].passage_text)}
                                                className="text-[11px] text-muted-foreground hover:text-primary font-semibold inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <Copy className="h-3 w-3" /> Same as Q{activeQuestionIndex}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateQuestionField(activeQuestion.id, "passage_text", "")}
                                            className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                                        >
                                            Remove Passage
                                        </button>
                                    </div>
                                </div>
                                <InlineMathTextarea
                                    placeholder="Type comprehension passage or case study description..."
                                    value={activeQuestion.passage_text}
                                    onChange={(val) => handleUpdateQuestionField(activeQuestion.id, "passage_text", val)}
                                    rows={3}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleUpdateQuestionField(activeQuestion.id, "passage_text", " ")}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                >
                                    <BookOpen className="h-3.5 w-3.5" /> + Add Passage / Case Study
                                </button>
                            </div>
                        )}

                        {/* Question Statement */}
                        <InlineMathTextarea
                            label="Question Statement"
                            placeholder="Type question statement here..."
                            value={activeQuestion.question_text}
                            onChange={(val) => handleUpdateQuestionField(activeQuestion.id, "question_text", val)}
                            rows={3}
                        />

                        {/* Diagram Attachment Section */}
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-muted/20 border border-border">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                    Diagram / Figure Attachment (Optional):
                                </label>
                                {activeQuestion.image_url && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleUpdateQuestionField(activeQuestion.id, "image_url", "");
                                            handleUpdateQuestionField(activeQuestion.id, "image_dark_url", "");
                                            handleUpdateQuestionField(activeQuestion.id, "image_dark_invert", false);
                                        }}
                                        className="text-[10px] text-destructive hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                    >
                                        <Trash2 className="h-3 w-3" /> Remove Diagram
                                    </button>
                                )}
                            </div>

                            {!activeQuestion.image_url ? (
                                <div>
                                    <input
                                        type="file"
                                        ref={lightInputRef}
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleUploadDiagramForQuestion(f, "light", activeQuestion.id);
                                        }}
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => lightInputRef.current?.click()}
                                        disabled={uploadingDiagram}
                                        className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/40 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                    >
                                        {uploadingDiagram ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span>Uploading diagram...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="h-4 w-4 text-primary" />
                                                <span>Click to upload diagram (PNG, JPG, SVG, WebP • Max 300 KB)</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-1">
                                    <div className="flex flex-wrap items-start gap-3">
                                        {/* Light Preview */}
                                        <div className="border border-border/80 rounded-lg p-1.5 bg-background max-w-[200px] shrink-0">
                                            <div className="text-[9px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                                <Sun className="h-2.5 w-2.5 text-amber-500" /> Light Mode
                                            </div>
                                            <img
                                                src={activeQuestion.image_url}
                                                alt="Uploaded diagram"
                                                className="max-h-24 max-w-full object-contain rounded"
                                            />
                                        </div>

                                        {/* Dark Preview */}
                                        <div className="border border-border/80 rounded-lg p-1.5 bg-zinc-950 text-white max-w-[200px] shrink-0">
                                            <div className="text-[9px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                                                <Moon className="h-2.5 w-2.5 text-indigo-400" /> Dark Mode
                                            </div>
                                            {activeQuestion.image_dark_url ? (
                                                <img
                                                    src={activeQuestion.image_dark_url}
                                                    alt="Dark diagram variant"
                                                    className="max-h-24 max-w-full object-contain rounded"
                                                />
                                            ) : (
                                                <img
                                                    src={activeQuestion.image_url}
                                                    alt="Diagram in dark mode"
                                                    className={`max-h-24 max-w-full object-contain rounded ${
                                                        activeQuestion.image_dark_invert ? "invert hue-rotate-180 brightness-95" : ""
                                                    }`}
                                                />
                                            )}
                                        </div>

                                        <div className="text-xs space-y-2 flex-1 min-w-[200px] pt-1">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activeQuestion.image_dark_invert)}
                                                    onChange={(e) => handleUpdateQuestionField(activeQuestion.id, "image_dark_invert", e.target.checked)}
                                                    disabled={Boolean(activeQuestion.image_dark_url)}
                                                    className="h-3.5 w-3.5 rounded text-primary focus:ring-primary cursor-pointer"
                                                />
                                                <span className="font-medium text-foreground text-[11px]">
                                                    Auto-invert in Dark Mode
                                                </span>
                                            </label>
                                            <p className="text-[10px] text-muted-foreground leading-snug">
                                                Ideal for formulas, circuits, and geometry line drawings.
                                            </p>

                                            {!activeQuestion.image_dark_url && !showDarkUploader && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDarkUploader(true)}
                                                    className="text-[10px] text-primary hover:underline block font-semibold cursor-pointer"
                                                >
                                                    + Upload separate Dark Theme image
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {showDarkUploader && !activeQuestion.image_dark_url && (
                                        <div className="pt-1 border-t border-border/50">
                                            <input
                                                type="file"
                                                ref={darkInputRef}
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleUploadDiagramForQuestion(f, "dark", activeQuestion.id);
                                                }}
                                                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => darkInputRef.current?.click()}
                                                disabled={uploadingDarkDiagram}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 cursor-pointer font-medium"
                                            >
                                                {uploadingDarkDiagram ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                ) : (
                                                    <Moon className="h-3 w-3 text-indigo-400" />
                                                )}
                                                Upload Dark Theme Variant (Optional)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Answer Choices */}
                        <div className="space-y-2.5 pt-1">
                            <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                <span>
                                    {isMSQ
                                        ? "Answer Choices (Select all correct options):"
                                        : "Answer Choices (Select the single correct answer):"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleAddOptionToQuestion(activeQuestion.id)}
                                    className="text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer text-xs"
                                >
                                    <Plus className="h-3 w-3" /> Add Choice
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {activeQuestion.options.map((opt, optIdx) => {
                                    const letter = String.fromCharCode(65 + optIdx);
                                    return (
                                        <InlineChoiceField
                                            key={opt.id || optIdx}
                                            letter={letter}
                                            value={opt.option_text}
                                            isCorrect={opt.is_correct}
                                            isMSQ={isMSQ}
                                            onChange={(text) => handleOptionTextChange(activeQuestion.id, optIdx, text)}
                                            onToggleCorrect={() => handleOptionCorrectToggle(activeQuestion.id, optIdx, isMSQ)}
                                            onRemove={activeQuestion.options.length > 2 ? () => handleRemoveOption(activeQuestion.id, optIdx) : undefined}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Solution & Explanation (Collapsible) */}
                        {typeof activeQuestion.explanation === "string" && activeQuestion.explanation.length > 0 ? (
                            <div className="space-y-2 pt-2 border-t border-border">
                                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                    <span className="flex items-center gap-1 text-primary">
                                        <HelpCircle className="h-3.5 w-3.5" />
                                        Explanation & Solution:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateQuestionField(activeQuestion.id, "explanation", "")}
                                        className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <InlineMathTextarea
                                    placeholder="Explain the step-by-step solution..."
                                    value={activeQuestion.explanation}
                                    onChange={(val) => handleUpdateQuestionField(activeQuestion.id, "explanation", val)}
                                    rows={2}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleUpdateQuestionField(activeQuestion.id, "explanation", " ")}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                >
                                    <HelpCircle className="h-3.5 w-3.5" /> + Add Solution Explanation
                                </button>
                            </div>
                        )}

                        {/* Canvas Footer Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <button
                                type="button"
                                disabled={activeQuestionIndex === 0}
                                onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" /> Previous
                            </button>

                            <div className="text-xs font-medium text-muted-foreground">
                                Question {activeQuestionIndex + 1} of {questions.length}
                            </div>

                            {activeQuestionIndex < questions.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add Next Question
                                </button>
                            )}
                        </div>
                    </div>
                )}
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
