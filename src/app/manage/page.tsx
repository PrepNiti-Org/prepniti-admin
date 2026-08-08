"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "../../lib/api";
import { Loader2, Upload, FileJson, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PaperCard } from "./_components/PaperCard";
import { RenameModal } from "./_components/RenameModal";
import { DeleteModal } from "./_components/DeleteModal";

interface Paper {
    id: string;
    filename: string;
    exam_name?: string;
    uploaded_at: string;
    q_count: number;
    exam_type: string;
    duration: number;
    target_exam?: string;
}

export default function ManageMocksPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loadingPapers, setLoadingPapers] = useState(true);

    // Rename state
    const [renamingPaperId, setRenamingPaperId] = useState<string | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [examType, setExamType] = useState("practice");
    const [duration, setDuration] = useState(120);
    const [targetExam, setTargetExam] = useState("");
    const [savingRename, setSavingRename] = useState(false);

    // Delete state
    const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
    const [confirmDeleteText, setConfirmDeleteText] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Import JSON state
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPapers = () => {
        setLoadingPapers(true);
        api.get<Paper[]>("/papers")
            .then((res) => {
                setPapers(res.data || []);
            })
            .catch(() => {
                toast.error("Failed to load active papers repository.");
            })
            .finally(() => {
                setLoadingPapers(false);
            });
    };

    useEffect(() => {
        loadPapers();
    }, []);

    const handleOpenRename = (p: Paper) => {
        setRenamingPaperId(p.id);
        setRenameTitle(p.exam_name || p.filename);
        setExamType(p.exam_type);
        setDuration(p.duration);
        setTargetExam(p.target_exam || "Unspecified");
    };

    const handleSaveRename = async () => {
        if (!renameTitle.trim() || !renamingPaperId) return;

        setSavingRename(true);
        try {
            await api.put(`/admin/papers/${renamingPaperId}`, {
                filename: renameTitle.trim(),
                exam_name: renameTitle.trim(),
                exam_type: examType,
                duration: Number(duration),
                target_exam: targetExam,
            });
            toast.success("Paper details updated successfully.");
            setRenamingPaperId(null);
            loadPapers();
        } catch {
            toast.error("Failed to update paper details.");
        } finally {
            setSavingRename(false);
        }
    };

    const handleDeletePaper = async () => {
        if (!deletingPaperId || !confirmDeleteText) return;

        setDeleting(true);
        try {
            await api.delete(`/admin/papers/${deletingPaperId}`);
            toast.success("Paper deleted successfully.");
            setDeletingPaperId(null);
            setConfirmDeleteText(false);
            loadPapers();
        } catch {
            toast.error("Failed to delete paper.");
        } finally {
            setDeleting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith(".json")) {
                toast.error("Please upload a valid .json file.");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleImportJson = async () => {
        if (!selectedFile) return;

        setImporting(true);
        try {
            const fileContent = await selectedFile.text();
            const parsedData = JSON.parse(fileContent);

            if (!parsedData.filename || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
                toast.error("Invalid paper structure. 'filename' and a non-empty 'questions' array are required.");
                setImporting(false);
                return;
            }

            const response = await api.post("/admin/papers/import-json", parsedData);
            toast.success(`Successfully imported '${parsedData.filename}' (${response.data.question_count || parsedData.questions.length} questions).`);

            setIsImportOpen(false);
            setSelectedFile(null);
            loadPapers();
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                toast.error("Failed to parse file: Invalid JSON syntax.");
            } else {
                toast.error(err.response?.data?.error || "Failed to import paper JSON.");
            }
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="pb-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Paper Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage active exam files, update paper metadata, and configure published mock repository entries.
                    </p>
                </div>
                <button
                    onClick={() => setIsImportOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Upload className="h-4 w-4" />
                    Import Paper JSON
                </button>
            </div>

            {/* Papers List */}
            <div className="space-y-4">
                {loadingPapers ? (
                    <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Fetching paper list...</span>
                    </div>
                ) : papers.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground border border-dashed rounded-2xl bg-card font-sans text-xs">
                        No published test papers found. Import JSON or assemble new mock exams.
                    </div>
                ) : (
                    papers.map((p) => (
                        <PaperCard
                            key={p.id}
                            paper={p}
                            onOpenRename={handleOpenRename}
                            onOpenDelete={(id) => setDeletingPaperId(id)}
                        />
                    ))
                )}
            </div>

            {/* Rename Modal */}
            <RenameModal
                isOpen={!!renamingPaperId}
                paperTitle={renameTitle}
                setPaperTitle={setRenameTitle}
                examType={examType}
                setExamType={setExamType}
                duration={duration}
                setDuration={setDuration}
                targetExam={targetExam}
                setTargetExam={setTargetExam}
                onClose={() => setRenamingPaperId(null)}
                onSave={handleSaveRename}
                saving={savingRename}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={!!deletingPaperId}
                confirmDeleteText={confirmDeleteText}
                setConfirmDeleteText={setConfirmDeleteText}
                onClose={() => {
                    setDeletingPaperId(null);
                    setConfirmDeleteText(false);
                }}
                onDelete={handleDeletePaper}
                deleting={deleting}
            />

            {/* JSON Import Modal */}
            {isImportOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <div className="flex items-center gap-2">
                                <FileJson className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-bold">Import Exam JSON</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setIsImportOpen(false);
                                    setSelectedFile(null);
                                }}
                                className="p-1 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Upload a formatted JSON file containing paper specifications, questions, options, and explanations.
                        </p>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${selectedFile
                                ? "border-primary/50 bg-primary/5"
                                : "border-border hover:border-primary/40 bg-accent/20"
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2 text-primary">
                                    <CheckCircle2 className="h-8 w-8" />
                                    <span className="text-sm font-semibold truncate max-w-[240px]">
                                        {selectedFile.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="h-8 w-8 text-muted-foreground/60" />
                                    <span className="text-xs font-medium">Click to upload or drag .json file</span>
                                    <span className="text-[10px] text-muted-foreground/60">JSON up to 10MB</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsImportOpen(false);
                                    setSelectedFile(null);
                                }}
                                disabled={importing}
                                className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleImportJson}
                                disabled={!selectedFile || importing}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {importing ? "Importing..." : "Import Paper"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
