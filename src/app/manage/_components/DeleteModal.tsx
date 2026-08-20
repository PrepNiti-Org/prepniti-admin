"use client";

import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    confirmDeleteText?: boolean;
    setConfirmDeleteText?: (v: boolean) => void;
    onClose: () => void;
    onDelete: () => void;
    deleting: boolean;
}

export function DeleteModal({
    isOpen,
    onClose,
    onDelete,
    deleting
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="border border-border bg-card p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-bold text-foreground tracking-tight">
                        Delete Mock Test Paper?
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Are you sure you want to delete this test paper? This will remove the mock test from student test listings.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground cursor-pointer transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500 text-white hover:bg-rose-600 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                    >
                        {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {deleting ? "Deleting..." : "Delete Paper"}
                    </button>
                </div>
            </div>
        </div>
    );
}
