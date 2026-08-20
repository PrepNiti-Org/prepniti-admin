"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../lib/api";
import {
    Loader2,
    Upload,
    FileJson,
    X,
    CheckCircle2,
    Search,
    Plus,
    Layers,
    Clock,
    BookOpen,
    SlidersHorizontal,
    RefreshCw,
    FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PaperCard, Paper } from "./_components/PaperCard";
import { RenameModal } from "./_components/RenameModal";
import { DeleteModal } from "./_components/DeleteModal";
import { PaperPreviewDrawer } from "./_components/PaperPreviewDrawer";
import { BulkUploadModal } from "./_components/BulkUploadModal";
import { Card, CardContent } from "../../components/ui/card";

export default function ManageMocksPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loadingPapers, setLoadingPapers] = useState(true);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [targetExamFilter, setTargetExamFilter] = useState("all");
    const [examTypeFilter, setExamTypeFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "questions">("newest");

    // Preview state
    const [previewPaperId, setPreviewPaperId] = useState<string | null>(null);

    // Rename state
    const [renamingPaperId, setRenamingPaperId] = useState<string | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [examType, setExamType] = useState("practice");
    const [duration, setDuration] = useState(120);
    const [targetExam, setTargetExam] = useState("");
    const [savingRename, setSavingRename] = useState(false);

    // Delete state
    const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Bulk upload modal state
    const [isImportOpen, setIsImportOpen] = useState(false);

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
        if (!deletingPaperId) return;

        setDeleting(true);
        try {
            await api.delete(`/admin/papers/${deletingPaperId}`);
            toast.success("Paper deleted successfully.");
            setDeletingPaperId(null);
            loadPapers();
        } catch {
            toast.error("Failed to delete paper.");
        } finally {
            setDeleting(false);
        }
    };

    // Calculate Summary Stats
    const totalPapersCount = papers.length;
    const totalQuestionsCount = papers.reduce((sum, p) => sum + (p.q_count || 0), 0);
    const fullMocksCount = papers.filter(p => p.exam_type === "full").length;
    const practiceCount = papers.filter(p => p.exam_type !== "full").length;

    // Filter & Sort Papers
    const filteredPapers = useMemo(() => {
        return papers
            .filter((p) => {
                const name = (p.exam_name || p.filename || "").toLowerCase();
                const matchesSearch = name.includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesExam = targetExamFilter === "all" || (p.target_exam || "").toLowerCase() === targetExamFilter.toLowerCase();
                const matchesType = examTypeFilter === "all" || p.exam_type === examTypeFilter;
                return matchesSearch && matchesExam && matchesType;
            })
            .sort((a, b) => {
                if (sortBy === "newest") {
                    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
                } else if (sortBy === "oldest") {
                    return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
                } else if (sortBy === "questions") {
                    return (b.q_count || 0) - (a.q_count || 0);
                }
                return 0;
            });
    }, [papers, searchQuery, targetExamFilter, examTypeFilter, sortBy]);

    const uniqueTargetExams = useMemo(() => {
        const exams = new Set<string>();
        papers.forEach(p => {
            if (p.target_exam && p.target_exam.toLowerCase() !== "unspecified") {
                exams.add(p.target_exam);
            }
        });
        return Array.from(exams);
    }, [papers]);

    return (
        <div className="container max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="pb-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Mock Exam Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Oversee published test papers, inspect questions, configure mock metadata, and import structured papers.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={loadPapers}
                        className="px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5"
                        title="Refresh List"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors shadow-sm cursor-pointer"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-primary" />
                        Upload Test File (.csv, .json)
                    </button>
                    <Link
                        href="/assemble"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        + Create Mock Test
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Mock Papers</p>
                            <p className="text-2xl font-black text-foreground mt-1">{totalPapersCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Layers className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Questions Ingested</p>
                            <p className="text-2xl font-black text-foreground mt-1">{totalQuestionsCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full-Length Mocks</p>
                            <p className="text-2xl font-black text-foreground mt-1">{fullMocksCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Clock className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Practice Sets</p>
                            <p className="text-2xl font-black text-foreground mt-1">{practiceCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <BookOpen className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <input
                        type="text"
                        placeholder="Search by test name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                        value={targetExamFilter}
                        onChange={(e) => setTargetExamFilter(e.target.value)}
                        className="bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer flex-1 sm:flex-none"
                    >
                        <option value="all">All Exam Categories</option>
                        {uniqueTargetExams.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <select
                        value={examTypeFilter}
                        onChange={(e) => setExamTypeFilter(e.target.value)}
                        className="bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer flex-1 sm:flex-none"
                    >
                        <option value="all">All Formats</option>
                        <option value="full_mock">Full Mock Test</option>
                        <option value="practice">Practice Sheet</option>
                        <option value="sectional">Sectional Test</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer flex-1 sm:flex-none"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="questions">Most Questions</option>
                    </select>
                </div>
            </div>

            {/* Paper Cards List */}
            {loadingPapers ? (
                <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-semibold">Loading mock papers...</span>
                </div>
            ) : filteredPapers.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/40 text-xs space-y-3">
                    <Layers className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="font-semibold text-foreground text-sm">No published test papers match your criteria.</p>
                    <p className="text-muted-foreground max-w-sm mx-auto">Create a test paper using our visual builder or upload a question file (.csv, .xlsx, .json).</p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                        <button onClick={() => setIsImportOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer">
                            <FileSpreadsheet className="h-4 w-4 text-primary" /> Upload File
                        </button>
                        <Link href="/assemble" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer">
                            <Plus className="h-4 w-4" /> Create Test Paper
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {filteredPapers.map((p) => (
                        <PaperCard
                            key={p.id}
                            paper={p}
                            onPreview={(paper) => setPreviewPaperId(paper.id)}
                            onOpenRename={handleOpenRename}
                            onOpenDelete={(id) => setDeletingPaperId(id)}
                        />
                    ))}
                </div>
            )}

            {/* Paper Preview Drawer */}
            <PaperPreviewDrawer paperId={previewPaperId} onClose={() => setPreviewPaperId(null)} />

            {/* Rename / Details Modal */}
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
                onClose={() => setDeletingPaperId(null)}
                onDelete={handleDeletePaper}
                deleting={deleting}
            />

            {/* Bulk Upload Modal */}
            <BulkUploadModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={loadPapers}
            />
        </div>
    );
}
