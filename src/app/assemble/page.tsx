"use client";

import React, { useState, useEffect, Suspense } from "react";
import { api } from "../../lib/api";
import { Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

import { Question } from "./_components/types";
import { QuestionCard } from "./_components/QuestionCard";
import { CompilePanel } from "./_components/CompilePanel";
import { CreateQuestionModal } from "./_components/CreateQuestionModal";

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
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [publishing, setPublishing] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const paperId = searchParams.get("paperId");
    const [editingPaperId, setEditingPaperId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterDiff, setFilterDiff] = useState("all");

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [paperTitle, setPaperTitle] = useState("");
    const [examType, setExamType] = useState<string>("practice");
    const [duration, setDuration] = useState<number>(120);
    const [targetExam, setTargetExam] = useState<string>("");
    const [visibleCount, setVisibleCount] = useState(15);

    useEffect(() => {
        setVisibleCount(15);
    }, [searchQuery, filterType, filterDiff]);

    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [manText, setManText] = useState("");
    const [manTopic, setManTopic] = useState("");
    const [manDiff, setManDiff] = useState("Medium");
    const [manExpl, setManExpl] = useState("");
    const [manOpts, setManOpts] = useState([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
    ]);
    const [addingQuestion, setAddingQuestion] = useState(false);

    const handleOpenCreateModal = () => {
        setEditingQuestion(null);
        setManText("");
        setManTopic("");
        setManDiff("Medium");
        setManExpl("");
        setManOpts([
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
        ]);
        setIsCreateModalOpen(true);
    };

    const handleOpenEditModal = (q: Question) => {
        setEditingQuestion(q);
        setManText(q.question_text);
        setManTopic(q.topic || "");
        setManDiff(q.difficulty || "Medium");
        setManExpl(q.explanation || "");

        const opts = q.options.map(o => ({ text: o.option_text, isCorrect: o.is_correct }));
        const paddedOpts = [...opts];
        while (paddedOpts.length < 4) {
            paddedOpts.push({ text: "", isCorrect: false });
        }
        setManOpts(paddedOpts);
        setIsCreateModalOpen(true);
    };

    const loadQuestions = () => {
        setLoadingQuestions(true);
        api.get<Question[]>("/admin/questions")
            .then(res => {
                setQuestions(res.data || []);
            })
            .catch(() => {
                toast.error("Failed to load question bank database.");
            })
            .finally(() => {
                setLoadingQuestions(false);
            });
    };

    useEffect(() => {
        loadQuestions();
        if (paperId) {
            setEditingPaperId(paperId);
            api.get(`/admin/papers/${paperId}`)
                .then(res => {
                    setPaperTitle(res.data.exam_name || res.data.filename || "");
                    setExamType(res.data.exam_type || "practice");
                    setDuration(res.data.duration || 120);
                    setTargetExam(res.data.target_exam);
                    if (res.data.questions) {
                        setSelectedIds(res.data.questions.map((q: any) => q.id));
                    }
                })
                .catch(() => {
                    toast.error("Failed to load paper details for editing.");
                });
        }
    }, [paperId]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleRemoveSelected = (id: string) => {
        setSelectedIds(prev => prev.filter(x => x !== id));
    };

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredQuestions.map(q => q.id);
        setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        toast.success(`Selected all ${filteredIds.length} filtered questions.`);
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
        toast.success("Cleared all selections.");
    };

    const handleSelectRandom = (count: number) => {
        if (filteredQuestions.length === 0) {
            toast.error("No filtered questions to select from.");
            return;
        }
        const shuffle = [...filteredQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffle.slice(0, Math.min(count, shuffle.length)).map(q => q.id);
        setSelectedIds(prev => Array.from(new Set([...prev, ...selected])));
        toast.success(`Selected ${selected.length} random questions.`);
    };

    const handleSelectQuestionClick = (id: string) => {
        const idx = filteredQuestions.findIndex(q => q.id === id);
        if (idx === -1) return;

        if (idx >= visibleCount) {
            setVisibleCount(idx + 15);
        }

        if (!expandedIds.includes(id)) {
            setExpandedIds(prev => [...prev, id]);
        }

        setTimeout(() => {
            const el = document.getElementById(`question-card-${id}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-4", "ring-primary/60", "scale-[1.01]");
                setTimeout(() => {
                    el.classList.remove("ring-4", "ring-primary/60", "scale-[1.01]");
                }, 1500);
            }
        }, 100);
    };

    const filteredQuestions = questions.filter(q => {
        const textMatch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.topic && q.topic.toLowerCase() !== "none" && q.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (q.context_passage?.passage_text && q.context_passage.passage_text.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesMCQ = (filterType.toLowerCase() === "mcq" && (q.type.toLowerCase() === "mcq" || q.type.toLowerCase() === "multiple_choice"));
        const typeMatch = filterType === "all" || matchesMCQ || q.type.toLowerCase() === filterType.toLowerCase();

        const isDiffUnspecified = !q.difficulty || q.difficulty.toLowerCase() === "none" || q.difficulty.toLowerCase() === "unspecified";
        const diffMatch = filterDiff === "all" ||
            (q.difficulty && q.difficulty.toLowerCase() !== "none" && q.difficulty.toLowerCase() === filterDiff.toLowerCase()) ||
            (isDiffUnspecified && filterDiff === "unspecified");

        return textMatch && typeMatch && diffMatch;
    });

    const handleAddManualQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manText.trim()) {
            toast.error("Question text is required.");
            return;
        }

        const validOpts = manOpts.filter(o => o.text.trim() !== "");
        if (validOpts.length === 0) {
            toast.error("At least one option is required.");
            return;
        }

        setAddingQuestion(true);
        try {
            const payload = {
                question_text: manText.trim(),
                type: "multiple_choice",
                topic: manTopic.trim(),
                difficulty: manDiff,
                explanation: manExpl.trim(),
                options: validOpts.map(o => ({
                    option_text: o.text.trim(),
                    is_correct: o.isCorrect
                }))
            };

            const res = await api.post<Question>("/admin/questions", payload);
            toast.success("Manual question saved and selected!");

            loadQuestions();
            setSelectedIds(prev => [...prev, res.data.id]);

            setManText("");
            setManTopic("");
            setManDiff("Medium");
            setManExpl("");
            setManOpts([
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ]);
            setIsCreateModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to create manual question.");
        } finally {
            setAddingQuestion(false);
        }
    };

    const handleUpdateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingQuestion) return;

        if (!manText.trim()) {
            toast.error("Question text is required.");
            return;
        }

        const validOpts = manOpts.filter(o => o.text.trim() !== "");
        if (validOpts.length === 0) {
            toast.error("At least one option is required.");
            return;
        }

        setAddingQuestion(true);
        try {
            const payload = {
                question_text: manText.trim(),
                type: "multiple_choice",
                topic: manTopic.trim(),
                difficulty: manDiff,
                explanation: manExpl.trim(),
                options: validOpts.map(o => ({
                    option_text: o.text.trim(),
                    is_correct: o.isCorrect
                }))
            };

            await api.put(`/admin/questions/${editingQuestion.id}`, payload);
            toast.success("Question updated successfully!");

            loadQuestions();

            setEditingQuestion(null);
            setManText("");
            setManTopic("");
            setManDiff("Medium");
            setManExpl("");
            setManOpts([
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ]);
            setIsCreateModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update question.");
        } finally {
            setAddingQuestion(false);
        }
    };

    const handleSubmitQuestion = (e: React.FormEvent) => {
        if (editingQuestion) {
            handleUpdateQuestion(e);
        } else {
            handleAddManualQuestion(e);
        }
    };

    const handleCompilePaper = async () => {
        if (!paperTitle.trim()) {
            toast.error("Please provide a paper title.");
            return;
        }
        if (selectedIds.length === 0) {
            toast.error("Please select at least one question.");
            return;
        }

        setPublishing(true);
        try {
            if (editingPaperId) {
                await api.put(`/admin/papers/${editingPaperId}`, {
                    filename: paperTitle.trim(),
                    exam_name: paperTitle.trim(),
                    question_ids: selectedIds,
                    exam_type: examType,
                    duration: Number(duration),
                    target_exam: targetExam
                });
                toast.success("Successfully updated exam paper!");
                router.push("/manage");
            } else {
                await api.post("/admin/papers", {
                    filename: paperTitle.trim(),
                    exam_name: paperTitle.trim(),
                    question_ids: selectedIds,
                    exam_type: examType,
                    duration: Number(duration),
                    target_exam: targetExam
                });
                toast.success("Successfully published paper to PrepNiti!");
                setPaperTitle("");
                setSelectedIds([]);
                setExamType("practice");
                setDuration(120);
                setTargetExam("Unspecified");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Saving changes failed.");
        } finally {
            setPublishing(false);
        }
    };

    const selectedQuestionsList = selectedIds
        .map(id => questions.find(q => q.id === id))
        .filter((q): q is Question => !!q);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-115px)] flex flex-col space-y-4 animate-in fade-in duration-300 overflow-hidden">
            <div className="flex-none flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-extrabold tracking-tight">Assemble Mock Exam</h1>
                    <p className="text-muted-foreground text-xs">
                        Select questions from the bank and compile them into standardized mock papers.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2 px-3.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                >
                    <Plus className="h-4 w-4" /> Create New Question
                </button>
            </div>

            <div className="flex-none grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-3 rounded-2xl shadow-sm">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <input
                        type="text"
                        placeholder="Search questions topic or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                    <option value="all" className="bg-background">All Formats</option>
                    <option value="MCQ" className="bg-background">Multiple Choice (MCQ)</option>
                    <option value="SUBJECTIVE" className="bg-background">Subjective</option>
                </select>
                <select
                    value={filterDiff}
                    onChange={(e) => setFilterDiff(e.target.value)}
                    className="bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                    <option value="all" className="bg-background">All Difficulties</option>
                    <option value="easy" className="bg-background">Easy</option>
                    <option value="medium" className="bg-background">Medium</option>
                    <option value="hard" className="bg-background">Hard</option>
                    <option value="unspecified" className="bg-background">Unspecified</option>
                </select>
            </div>

            <div className="flex-none flex flex-wrap items-center gap-2 text-xs bg-muted/40 p-3 border border-border rounded-xl">
                <span className="font-semibold text-muted-foreground mr-2">Bulk Actions:</span>
                <button
                    onClick={handleSelectAllFiltered}
                    className="px-2.5 py-1.5 bg-primary/10 border border-primary/20 text-primary font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                >
                    Select All Filtered ({filteredQuestions.length})
                </button>
                <button
                    onClick={() => handleSelectRandom(5)}
                    className="px-2.5 py-1.5 border border-border text-foreground font-semibold rounded-lg hover:border-primary/40 transition-all cursor-pointer bg-background"
                >
                    Select Random 5
                </button>
                <button
                    onClick={() => handleSelectRandom(10)}
                    className="px-2.5 py-1.5 border border-border text-foreground font-semibold rounded-lg hover:border-primary/40 transition-all cursor-pointer bg-background"
                >
                    Select Random 10
                </button>
                <button
                    onClick={() => handleSelectRandom(25)}
                    className="px-2.5 py-1.5 border border-border text-foreground font-semibold rounded-lg hover:border-primary/40 transition-all cursor-pointer bg-background"
                >
                    Select Random 25
                </button>
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleClearSelection}
                        className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded-lg hover:bg-rose-500 hover:text-white transition-all cursor-pointer ml-auto"
                    >
                        Clear Selection ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                <div className="lg:col-span-2 h-full overflow-y-auto pr-1 pb-6 space-y-4">
                    {loadingQuestions ? (
                        <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-xs font-semibold">Retrieving questions...</span>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50 text-xs">
                            No questions found matching active filters.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {filteredQuestions.slice(0, visibleCount).map((q) => (
                                    <QuestionCard
                                        key={q.id}
                                        question={q}
                                        isChecked={selectedIds.includes(q.id)}
                                        onToggleSelect={handleToggleSelect}
                                        isExpanded={expandedIds.includes(q.id)}
                                        onToggleExpand={toggleExpand}
                                        onEdit={handleOpenEditModal}
                                    />
                                ))}
                            </div>
                            {filteredQuestions.length > visibleCount && (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 15)}
                                    className="w-full py-2.5 border border-dashed border-border rounded-2xl hover:border-primary/50 text-muted-foreground hover:text-primary transition-all font-semibold text-xs text-center cursor-pointer bg-card/40"
                                >
                                    Load More Questions (+15)
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className="lg:col-span-1 h-full overflow-y-auto pr-1 pb-6">
                    <CompilePanel
                        paperTitle={paperTitle}
                        setPaperTitle={setPaperTitle}
                        examType={examType}
                        setExamType={setExamType}
                        duration={duration}
                        setDuration={setDuration}
                        targetExam={targetExam}
                        setTargetExam={setTargetExam}
                        selectedQuestions={selectedQuestionsList}
                        onRemoveSelected={handleRemoveSelected}
                        onReorder={setSelectedIds}
                        onClickQuestion={handleSelectQuestionClick}
                        onCompile={handleCompilePaper}
                        publishing={publishing}
                        isEditing={!!editingPaperId}
                    />
                </div>
            </div>

            <CreateQuestionModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingQuestion(null);
                }}
                manText={manText}
                setManText={setManText}
                manTopic={manTopic}
                setManTopic={setManTopic}
                manDiff={manDiff}
                setManDiff={setManDiff}
                manExpl={manExpl}
                setManExpl={setManExpl}
                manOpts={manOpts}
                setManOpts={setManOpts}
                onSubmit={handleSubmitQuestion}
                addingQuestion={addingQuestion}
                title={editingQuestion ? "Edit Question" : "Create New Question"}
                submitText={editingQuestion ? "Save Changes" : "Create Question"}
                description={editingQuestion ? "Update details for this question." : "Add a new manual question directly into the repository bank."}
            />
        </div>
    );
}
