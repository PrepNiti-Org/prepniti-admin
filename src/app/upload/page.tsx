"use client";

import React, { useState, useEffect } from "react";
import { api, extractionApi } from "../../lib/api";
import { toast } from "sonner";

import { SettingsPanel } from "./_components/SettingsPanel";
import { UploaderZone } from "./_components/UploaderZone";
import { ResultSummary } from "./_components/ResultSummary";
import { CreateQuestionModal } from "../assemble/_components/CreateQuestionModal";
import { Question } from "../assemble/_components/types";
import {
    BrainCircuit,
    FileText,
    Sparkles,
    Trash2,
    Edit,
    BookOpen,
    Loader2,
    FileUp,
    Cpu,
    CheckCircle2
} from "lucide-react";

import { LiveQuestionPreview } from "./_components/ExtractionProgress";

export default function UploadPage() {
    const [strategy, setStrategy] = useState<"text" | "visual">("text");
    const [models, setModels] = useState<string[]>(["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro"]);
    const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
    const [loadingModels, setLoadingModels] = useState(true);

    const [defaultCategory, setDefaultCategory] = useState("UPSC");
    const [defaultTopic, setDefaultTopic] = useState("");
    const [defaultDifficulty, setDefaultDifficulty] = useState("Medium");

    const [activeTab, setActiveTab] = useState<"upload" | "ai">("upload");
    const [aiTopic, setAiTopic] = useState("");
    const [aiCount, setAiCount] = useState(5);
    const [aiDifficulty, setAiDifficulty] = useState("Medium");
    const [generatingAI, setGeneratingAI] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
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
    const [editingInSandbox, setEditingInSandbox] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [extracting, setExtracting] = useState(false);
    
    const [progressPercent, setProgressPercent] = useState(0);
    const [stageMessage, setStageMessage] = useState("");
    const [completedChunks, setCompletedChunks] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
    const [liveQuestions, setLiveQuestions] = useState<LiveQuestionPreview[]>([]);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const [result, setResult] = useState<{
        filename: string;
        saved_count: number;
        linked_count: number;
        total_questions: number;
        questions?: any[];
    } | null>(null);

    useEffect(() => {
        extractionApi.get<{ models: string[] }>("/models")
            .then(res => {
                if (res.data.models && res.data.models.length > 0) {
                    setModels(res.data.models);
                    setSelectedModel(res.data.models[0]);
                }
            })
            .catch(() => {
                toast.warning("Failed to fetch model list, using standard fallback options.");
            })
            .finally(() => {
                setLoadingModels(false);
            });
    }, []);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
            } else {
                toast.error("Only PDF files are supported.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAbort = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setExtracting(false);
            toast.info("Extraction process cancelled.");
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setExtracting(true);
        setResult(null);
        setProgressPercent(2);
        setStageMessage("Uploading PDF and initiating parallel AI extraction workers...");
        setCompletedChunks(0);
        setTotalChunks(0);
        setTotalPages(undefined);
        setLiveQuestions([]);

        const controller = new AbortController();
        setAbortController(controller);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("model_name", selectedModel);
        formData.append("is_visual", String(strategy === "visual"));
        formData.append("category", defaultCategory);
        formData.append("topic", defaultTopic);
        formData.append("difficulty", defaultDifficulty);

        try {
            const extractionBaseUrl = process.env.NEXT_PUBLIC_EXTRACTION_API_URL || "http://localhost:8002/api";
            const endpoint = `${extractionBaseUrl.replace(/\/+$/, '')}/extract-stream`;

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
                signal: controller.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMsg = `Server error (Status ${response.status})`;
                try {
                    const parsed = JSON.parse(errorText);
                    errorMsg = parsed.detail || parsed.message || errorMsg;
                } catch {}
                throw new Error(errorMsg);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Unable to read streaming response from server.");
            }

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop() || "";

                for (const chunk of lines) {
                    const trimmed = chunk.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const jsonStr = trimmed.replace(/^data:\s*/, "");
                    if (!jsonStr) continue;

                    try {
                        const data = JSON.parse(jsonStr);

                        if (data.event === "start") {
                            setTotalChunks(data.total_chunks || 0);
                            setTotalPages(data.total_pages || undefined);
                            setProgressPercent(5);
                            setStageMessage(`Started extraction: ${data.total_chunks} batches planned (${data.total_pages || 0} pages total)...`);
                        } else if (data.event === "progress") {
                            setCompletedChunks(data.completed_chunks || 0);
                            setTotalChunks(data.total_chunks || 0);
                            setProgressPercent(data.percent || 50);
                            setStageMessage(data.message || `Processed chunk ${data.completed_chunks}/${data.total_chunks}`);
                            if (data.new_questions && Array.isArray(data.new_questions) && data.new_questions.length > 0) {
                                setLiveQuestions(prev => [...data.new_questions, ...prev]);
                            }
                        } else if (data.event === "saving") {
                            setProgressPercent(data.percent || 95);
                            setStageMessage(data.message || "Deduplicating and storing questions in database...");
                        } else if (data.event === "complete") {
                            setProgressPercent(100);
                            setStageMessage("Extraction Completed Successfully!");
                            setResult({
                                filename: data.filename,
                                saved_count: data.saved_count,
                                linked_count: data.linked_count,
                                total_questions: data.total_questions,
                                questions: data.questions || []
                            });
                            toast.success(`Extraction Completed! ${data.total_questions} questions indexed.`);

                            api.post("/admin/audit-logs", {
                                action: "PDF_INGEST",
                                details: `Ingested exam paper PDF '${data.filename}' successfully (Questions: ${data.total_questions})`
                            }).catch(err => {
                                console.error("Failed to write PDF ingestion audit log:", err);
                            });
                        } else if (data.event === "error") {
                            throw new Error(data.detail || "Extraction pipeline encountered an error.");
                        }
                    } catch (parseErr: any) {
                        if (parseErr.message && !parseErr.message.includes("JSON")) {
                            throw parseErr;
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name === "AbortError") {
                return;
            }
            console.error(err);
            const msg = err.message || "Pipeline processing failed.";
            toast.error(`Ingestion failure: ${msg}`);
        } finally {
            setExtracting(false);
            setAbortController(null);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiTopic.trim()) {
            toast.error("Please enter a topic for AI question generation.");
            return;
        }

        setGeneratingAI(true);
        setResult(null);
        toast.info("Generating structured mock questions with Gemini...");

        const formData = new FormData();
        formData.append("topic", aiTopic.trim());
        formData.append("format_type", "MCQ");
        formData.append("count", String(aiCount));
        formData.append("difficulty", aiDifficulty);
        formData.append("model_name", selectedModel);

        try {
            const res = await extractionApi.post<{
                status: string;
                filename: string;
                saved_count: number;
                total_questions: number;
                questions: any[];
            }>("/generate", formData);

            if (res.data.status === "success") {
                setResult({
                    filename: res.data.filename,
                    saved_count: res.data.saved_count,
                    linked_count: 0,
                    total_questions: res.data.total_questions,
                    questions: res.data.questions || []
                });
                toast.success(`Successfully generated ${res.data.total_questions} questions!`);

                api.post("/admin/audit-logs", {
                    action: "AI_QUESTION_GEN",
                    details: `Generated questions on topic: '${aiTopic.trim()}' using model ${selectedModel} (Questions: ${res.data.total_questions})`
                }).catch(err => {
                    console.error("Failed to write AI generation audit log:", err);
                });
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || "AI question generation pipeline failed.";
            toast.error(`Generation failure: ${msg}`);
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSandboxDelete = async (id: string) => {
        try {
            await api.delete(`/admin/questions/${id}`);
            toast.success("Question deleted from sandbox successfully!");
            if (result && result.questions) {
                setResult({
                    ...result,
                    questions: result.questions.filter(q => q.id !== id),
                    total_questions: Math.max(0, result.total_questions - 1),
                    saved_count: Math.max(0, result.saved_count - 1)
                });
            }
        } catch (err) {
            toast.error("Failed to delete question.");
        }
    };

    const handleSandboxEditClick = (q: any) => {
        setEditingQuestion(q);
        setManText(q.question_text);
        setManTopic(q.topic || "");
        setManDiff(q.difficulty || "Medium");
        setManExpl(q.explanation || "");
        setManOpts(
            q.options && q.options.length > 0
                ? q.options.map((opt: any) => ({ text: opt.option_text, isCorrect: opt.is_correct }))
                : [
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false }
                ]
        );
        setIsEditModalOpen(true);
    };

    const handleSandboxEditSubmit = async () => {
        if (!editingQuestion) return;
        setEditingInSandbox(true);

        const payload = {
            question_text: manText.trim(),
            topic: manTopic.trim(),
            difficulty: manDiff,
            explanation: manExpl.trim(),
            options: manOpts.map(o => ({
                option_text: o.text.trim(),
                is_correct: o.isCorrect
            }))
        };

        try {
            await api.put(`/admin/questions/${editingQuestion.id}`, payload);
            toast.success("Successfully updated question details!");

            if (result && result.questions) {
                setResult({
                    ...result,
                    questions: result.questions.map(q => {
                        if (q.id === editingQuestion.id) {
                            return {
                                ...q,
                                question_text: manText.trim(),
                                topic: manTopic.trim(),
                                difficulty: manDiff,
                                explanation: manExpl.trim(),
                                options: manOpts.map((o, idx) => ({
                                    id: q.options?.[idx]?.id || idx.toString(),
                                    option_text: o.text.trim(),
                                    is_correct: o.isCorrect
                                }))
                            };
                        }
                        return q;
                    })
                });
            }
            setIsEditModalOpen(false);
            setEditingQuestion(null);
        } catch (err) {
            toast.error("Failed to save updates.");
        } finally {
            setEditingInSandbox(false);
        }
    };

    return (
        <div className="container max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="pb-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Question Ingestion & AI Generation
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Extract structured question papers visually from PDFs or generate custom curriculum questions using Gemini AI.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <SettingsPanel
                        strategy={strategy}
                        setStrategy={setStrategy}
                        models={models}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        loadingModels={loadingModels}
                        defaultCategory={defaultCategory}
                        setDefaultCategory={setDefaultCategory}
                        defaultTopic={defaultTopic}
                        setDefaultTopic={setDefaultTopic}
                        defaultDifficulty={defaultDifficulty}
                        setDefaultDifficulty={setDefaultDifficulty}
                    />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="flex bg-muted/60 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab("upload")}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                activeTab === "upload"
                                    ? "bg-background text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <FileUp className="h-4 w-4" /> PDF Ingestion Pipeline
                        </button>
                        <button
                            onClick={() => setActiveTab("ai")}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                activeTab === "ai"
                                    ? "bg-background text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Cpu className="h-4 w-4" /> AI Question Generator
                        </button>
                    </div>

                    {activeTab === "upload" ? (
                        <UploaderZone
                            file={file}
                            isDragActive={isDragActive}
                            extracting={extracting}
                            handleDrag={handleDrag}
                            handleDrop={handleDrop}
                            handleFileChange={handleFileChange}
                            handleProcess={handleProcess}
                            progressPercent={progressPercent}
                            stageMessage={stageMessage}
                            completedChunks={completedChunks}
                            totalChunks={totalChunks}
                            totalPages={totalPages}
                            strategy={strategy}
                            liveQuestions={liveQuestions}
                            totalQuestionsFound={liveQuestions.length}
                            onAbort={handleAbort}
                        />
                    ) : (
                        <div className="border border-border bg-card rounded-2xl p-6 space-y-5 shadow-sm">
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-foreground">AI Generation Prompt</h3>
                                <p className="text-xs text-muted-foreground">Describe a concept or syllabus node, and specify question counts.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground">Concept Description / Topic Scope:</label>
                                    <textarea
                                        rows={3}
                                        placeholder="e.g. Laws of thermodynamics, focusing on entropy calculations, Carnot engine efficiency, and thermodynamic cycles."
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all p-3 rounded-xl text-xs font-semibold focus:outline-none resize-none leading-relaxed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Target Difficulty:</label>
                                        <select
                                            value={aiDifficulty}
                                            onChange={(e) => setAiDifficulty(e.target.value)}
                                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                                        >
                                            <option value="Easy" className="bg-background">Easy</option>
                                            <option value="Medium" className="bg-background">Medium</option>
                                            <option value="Hard" className="bg-background">Hard</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Number of Questions:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={aiCount}
                                            onChange={(e) => setAiCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
                                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleAIGenerate}
                                    disabled={generatingAI || !aiTopic.trim()}
                                    className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-wider"
                                >
                                    {generatingAI ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Generating questions with Gemini...
                                        </>
                                    ) : (
                                        <>
                                            <BrainCircuit className="h-4 w-4" /> Generate Questions with Gemini
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {result && <ResultSummary result={result} />}

            {result && result.questions && result.questions.length > 0 && (
                <div className="border border-border bg-card rounded-2xl p-6 space-y-6 shadow-sm animate-in slide-in-from-bottom duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                        <div className="space-y-1">
                            <h2 className="text-base font-bold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary border border-primary/20 p-1.5 rounded-lg">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                Ingestion Sandbox Review Board
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Review, refine, edit options, or delete ingested questions before compile assembly.
                            </p>
                        </div>
                        <div className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                            Draft Sandbox ({result.questions.length} Items)
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                        {result.questions.map((q, idx) => (
                            <div key={q.id} className="border border-border rounded-xl p-5 hover:border-primary/20 transition-all bg-background/50 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-primary uppercase tracking-wide">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-muted-foreground font-black text-xs font-mono">Q{idx + 1}.</span>
                                        <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                            {q.type?.toLowerCase() === "multiple_choice" ? "MCQ" : q.type}
                                        </span>
                                        {q.topic && q.topic.toLowerCase() !== "none" && (
                                            <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                                                {q.topic}
                                            </span>
                                        )}
                                        {q.difficulty && q.difficulty.toLowerCase() !== "none" && (
                                            <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full font-bold">
                                                {q.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSandboxEditClick(q)}
                                            className="flex items-center gap-1 text-[10px] font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer capitalize"
                                        >
                                            <Edit className="h-3 w-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleSandboxDelete(q.id)}
                                            className="flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer capitalize"
                                        >
                                            <Trash2 className="h-3 w-3" /> Delete
                                        </button>
                                    </div>
                                </div>

                                {q.context_passage && (
                                    <div className="text-xs italic text-muted-foreground bg-primary/5 border-l-2 border-primary py-2 px-3 rounded-r-lg">
                                        <div className="flex items-center gap-1.5 font-bold uppercase text-[8px] text-muted-foreground/80 not-italic mb-1 tracking-wider">
                                            <BookOpen className="h-3 w-3 text-primary" /> Passage Context:
                                        </div>
                                        "{q.context_passage.passage_text}"
                                    </div>
                                )}

                                <p className="text-xs font-semibold leading-relaxed text-foreground break-words whitespace-pre-wrap">{q.question_text}</p>

                                {q.options && q.options.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40">
                                        {q.options.map((opt: any) => (
                                            <div
                                                key={opt.id}
                                                className={`border rounded-lg p-2.5 text-xs font-semibold flex items-center justify-between ${opt.is_correct
                                                        ? "border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-500"
                                                        : "border-border text-muted-foreground bg-background/30"
                                                    }`}
                                            >
                                                <span>{opt.option_text}</span>
                                                {opt.is_correct && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {q.explanation && q.explanation.toLowerCase() !== "none" && (
                                    <div className="text-[10px] leading-relaxed text-muted-foreground bg-secondary/10 border border-border/20 p-2.5 rounded-lg">
                                        <span className="font-bold text-primary text-[9px] uppercase block mb-1">Explanation:</span>
                                        {q.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CreateQuestionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
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
                onSubmit={handleSandboxEditSubmit}
                addingQuestion={editingInSandbox}
                title="Edit Sandbox Question"
                submitText="Save Sandbox Changes"
                description="Refine details for this sandboxed question before compile mock test compilation."
            />
        </div>
    );
}
