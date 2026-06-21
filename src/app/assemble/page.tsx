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
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold tracking-tight">Assemble Mock Exam</h1>
                    <p className="text-muted-foreground text-sm">
                        Select questions from the bank and compile them into standardized mock papers.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                >
                    <Plus className="h-4 w-4" /> Create New Question
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                <div className="lg:col-span-2 space-y-4">
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
                        filteredQuestions.map((q) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                isChecked={selectedIds.includes(q.id)}
                                onToggleSelect={handleToggleSelect}
                                isExpanded={expandedIds.includes(q.id)}
                                onToggleExpand={toggleExpand}
                                onEdit={handleOpenEditModal}
                            />
                        ))
                    )}
                </div>

                <div className="lg:col-span-1 lg:sticky lg:top-20 space-y-6">
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
