"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PaperCard } from "./_components/PaperCard";
import { RenameModal } from "./_components/RenameModal";
import { DeleteModal } from "./_components/DeleteModal";

interface Paper {
    id: string;
    filename: string;
    uploaded_at: string;
    q_count: number;
    exam_type: string;
    duration: number;
}

export default function ManageMocksPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loadingPapers, setLoadingPapers] = useState(true);

    const [renamingPaperId, setRenamingPaperId] = useState<string | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [savingRename, setSavingRename] = useState(false);

    const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
    const [confirmDeleteText, setConfirmDeleteText] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadPapers = () => {
        setLoadingPapers(true);
        api.get<Paper[]>("/papers")
            .then(res => {
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
        setRenameTitle(p.filename);
    };

    const handleSaveRename = async () => {
        if (!renameTitle.trim() || !renamingPaperId) return;

        setSavingRename(true);
        try {
            await api.put(`/admin/papers/${renamingPaperId}`, { filename: renameTitle.trim() });
            toast.success("Paper renamed successfully.");
            setRenamingPaperId(null);
            loadPapers();
        } catch {
            toast.error("Failed to rename paper.");
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

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="pb-4 border-b border-border">
                <h1 className="text-2xl font-extrabold tracking-tight">Paper Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage active exam files, update paper metadata, and configure published mock repository entries.
                </p>
            </div>

            <div className="space-y-4">
                {loadingPapers ? (
                    <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Fetching paper list...</span>
                    </div>
                ) : papers.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground border border-dashed rounded-2xl bg-card font-sans text-xs">
                        No published test papers found. Upload PDFs or assemble new mock exams.
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

            <RenameModal
                isOpen={!!renamingPaperId}
                renameTitle={renameTitle}
                setRenameTitle={setRenameTitle}
                onClose={() => setRenamingPaperId(null)}
                onSave={handleSaveRename}
                savingRename={savingRename}
            />

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
        </div>
    );
}
