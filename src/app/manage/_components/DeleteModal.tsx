"use client";

import React from "react";
import { Loader2, HelpCircle } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    confirmDeleteText: boolean;
    setConfirmDeleteText: (v: boolean) => void;
    onClose: () => void;
    onDelete: () => void;
    deleting: boolean;
}

export function DeleteModal({
    isOpen,
    confirmDeleteText,
    setConfirmDeleteText,
    onClose,
    onDelete,
    deleting
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="border border-red-500/20 bg-card p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="space-y-1.5">
                    <h2 className="text-base font-bold text-red-500 tracking-tight flex items-center gap-1.5">
                        <HelpCircle className="h-5 w-5" /> Confirm Deletion
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Are you absolutely sure you want to permanently delete this paper? Deleting this paper will delete its mappings and any orphaned questions from the bank.
                    </p>
                </div>
                
                <div className="flex items-start gap-2.5 pt-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                    <input
                        type="checkbox"
                        id="chk-delete"
                        checked={confirmDeleteText}
                        onChange={(e) => setConfirmDeleteText(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border text-red-500 focus:ring-red-500 cursor-pointer"
                    />
                    <label htmlFor="chk-delete" className="text-xs font-semibold text-foreground select-none cursor-pointer leading-normal">
                        Confirm permanent paper deletion from student active listings.
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={deleting || !confirmDeleteText}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                        {deleting && <Loader2 className="h-3 w-3 animate-spin" />}
                        Permanently Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
