"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface RenameModalProps {
    isOpen: boolean;
    renameTitle: string;
    setRenameTitle: (v: string) => void;
    onClose: () => void;
    onSave: () => void;
    savingRename: boolean;
}

export function RenameModal({
    isOpen,
    renameTitle,
    setRenameTitle,
    onClose,
    onSave,
    savingRename
}: RenameModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="border border-border bg-card p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="space-y-1">
                    <h2 className="text-base font-bold tracking-tight text-foreground font-sans">Rename Mock Paper</h2>
                    <p className="text-[10px] text-muted-foreground">Modify public display title mappings.</p>
                </div>
                <input
                    type="text"
                    value={renameTitle}
                    onChange={(e) => setRenameTitle(e.target.value)}
                    className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={savingRename || !renameTitle.trim()}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                        {savingRename && <Loader2 className="h-3 w-3 animate-spin" />}
                        Save Name
                    </button>
                </div>
            </div>
        </div>
    );
}
