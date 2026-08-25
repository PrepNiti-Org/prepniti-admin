"use client";

import React, { useState, useRef } from "react";
import { X, Loader2, UploadCloud, Image as ImageIcon, Trash2, Moon, Sun } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    manText: string;
    setManText: (v: string) => void;
    manTopic: string;
    setManTopic: (v: string) => void;
    manDiff: string;
    setManDiff: (v: string) => void;
    manExpl: string;
    setManExpl: (v: string) => void;
    manOpts: { text: string; isCorrect: boolean }[];
    setManOpts: React.Dispatch<React.SetStateAction<{ text: string; isCorrect: boolean }[]>>;
    onSubmit: (e: React.FormEvent) => void;
    addingQuestion: boolean;
    title?: string;
    submitText?: string;
    description?: string;
    manImageUrl?: string;
    setManImageUrl?: (v: string) => void;
    manImageDarkUrl?: string;
    setManImageDarkUrl?: (v: string) => void;
    manImageDarkInvert?: boolean;
    setManImageDarkInvert?: (v: boolean) => void;
}

export function CreateQuestionModal({
    isOpen,
    onClose,
    manText,
    setManText,
    manTopic,
    setManTopic,
    manDiff,
    setManDiff,
    manExpl,
    setManExpl,
    manOpts,
    setManOpts,
    onSubmit,
    addingQuestion,
    title = "Create New Question",
    submitText = "Create Question",
    description = "Add a new manual question directly into the repository bank.",
    manImageUrl = "",
    setManImageUrl,
    manImageDarkUrl = "",
    setManImageDarkUrl,
    manImageDarkInvert = false,
    setManImageDarkInvert,
}: CreateQuestionModalProps) {
    const [uploadingLight, setUploadingLight] = useState(false);
    const [uploadingDark, setUploadingDark] = useState(false);
    const [showDarkUploader, setShowDarkUploader] = useState(Boolean(manImageDarkUrl));
    const lightInputRef = useRef<HTMLInputElement>(null);
    const darkInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = async (file: File, variant: "light" | "dark") => {
        if (file.size > 300 * 1024) {
            toast.error(`Diagram size (${Math.round(file.size / 1024)} KB) exceeds 300 KB limit. Please compress or optimize the image.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("variant", variant);

        if (variant === "light") setUploadingLight(true);
        else setUploadingDark(true);

        try {
            const res = await api.post("/admin/upload/diagram", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data && res.data.url) {
                if (variant === "light") {
                    setManImageUrl?.(res.data.url);
                    toast.success("Primary diagram uploaded successfully!");
                } else {
                    setManImageDarkUrl?.(res.data.url);
                    toast.success("Dark theme diagram uploaded successfully!");
                }
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || "Failed to upload diagram";
            toast.error(msg);
        } finally {
            if (variant === "light") setUploadingLight(false);
            else setUploadingDark(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="border border-border bg-card p-6 rounded-2xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col my-auto max-h-[90vh]">
                <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Question Content:
                        </label>
                        <textarea
                            placeholder="Type question prompt or problem statement..."
                            value={manText}
                            onChange={(e) => setManText(e.target.value)}
                            required
                            rows={3}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all p-3 rounded-xl text-xs font-semibold focus:outline-none leading-relaxed resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Syllabus Topic Tag:
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Modern Indian History"
                                value={manTopic}
                                onChange={(e) => setManTopic(e.target.value)}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Difficulty Level:
                            </label>
                            <select
                                value={manDiff}
                                onChange={(e) => setManDiff(e.target.value)}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="Easy" className="bg-background">Easy</option>
                                <option value="Medium" className="bg-background">Medium</option>
                                <option value="Hard" className="bg-background">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Option Choices:
                            </label>
                            <span className="text-[10px] text-muted-foreground italic font-medium">
                                Mark the radio button for the correct option.
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {manOpts.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-2 border p-2.5 rounded-xl transition-all ${
                                        opt.isCorrect
                                            ? "border-emerald-500/40 bg-emerald-500/5"
                                            : "border-border bg-muted/20 hover:border-border/80"
                                    }`}
                                >
                                    <span className="text-xs font-mono font-bold text-muted-foreground w-4 text-center">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                        value={opt.text}
                                        onChange={(e) => {
                                            const copy = [...manOpts];
                                            copy[idx].text = e.target.value;
                                            setManOpts(copy);
                                        }}
                                        required={idx < 2}
                                        className="flex-1 bg-transparent border-0 text-xs font-semibold focus:outline-none text-foreground"
                                    />
                                    <input
                                        type="radio"
                                        name="correct-option-group"
                                        checked={opt.isCorrect}
                                        onChange={() => {
                                            const copy = manOpts.map((o, oIdx) => ({
                                                ...o,
                                                isCorrect: oIdx === idx
                                            }));
                                            setManOpts(copy);
                                        }}
                                        className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0"
                                        title="Mark Correct Answer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Diagram Attachment Section */}
                    <div className="space-y-2.5 p-3 rounded-xl bg-muted/20 border border-border">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                Attach Diagram / Figure (Optional):
                            </label>
                            {manImageUrl && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setManImageUrl?.("");
                                        setManImageDarkUrl?.("");
                                        setManImageDarkInvert?.(false);
                                    }}
                                    className="text-[10px] text-destructive hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                >
                                    <Trash2 className="h-3 w-3" /> Remove Diagram
                                </button>
                            )}
                        </div>

                        {!manImageUrl ? (
                            <div>
                                <input
                                    type="file"
                                    ref={lightInputRef}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileUpload(f, "light");
                                    }}
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => lightInputRef.current?.click()}
                                    disabled={uploadingLight}
                                    className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/40 rounded-xl p-3.5 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                >
                                    {uploadingLight ? (
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
                                <div className="flex items-start gap-3">
                                    {/* Light Preview */}
                                    <div className="border border-border/80 rounded-lg p-1.5 bg-background max-w-[200px] shrink-0">
                                        <div className="text-[9px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                            <Sun className="h-2.5 w-2.5 text-amber-500" /> Light Mode
                                        </div>
                                        <img
                                            src={manImageUrl}
                                            alt="Uploaded diagram"
                                            className="max-h-24 max-w-full object-contain rounded"
                                        />
                                    </div>

                                    {/* Dark Preview or Dark Upload */}
                                    <div className="border border-border/80 rounded-lg p-1.5 bg-zinc-950 text-white max-w-[200px] shrink-0">
                                        <div className="text-[9px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                                            <Moon className="h-2.5 w-2.5 text-indigo-400" /> Dark Mode
                                        </div>
                                        {manImageDarkUrl ? (
                                            <img
                                                src={manImageDarkUrl}
                                                alt="Dark diagram variant"
                                                className="max-h-24 max-w-full object-contain rounded"
                                            />
                                        ) : (
                                            <img
                                                src={manImageUrl}
                                                alt="Diagram in dark mode"
                                                className={`max-h-24 max-w-full object-contain rounded ${
                                                    manImageDarkInvert ? "invert hue-rotate-180 brightness-95" : ""
                                                }`}
                                            />
                                        )}
                                    </div>

                                    <div className="text-xs space-y-2 flex-1 pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={manImageDarkInvert}
                                                onChange={(e) => setManImageDarkInvert?.(e.target.checked)}
                                                disabled={Boolean(manImageDarkUrl)}
                                                className="h-3.5 w-3.5 rounded text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <span className="font-medium text-foreground text-[11px]">
                                                Auto-invert in Dark Mode
                                            </span>
                                        </label>
                                        <p className="text-[10px] text-muted-foreground leading-snug">
                                            Recommended for black-and-white formulas, geometry, circuits, and line plots so they seamlessly blend with dark background.
                                        </p>

                                        {!manImageDarkUrl && !showDarkUploader && (
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

                                {showDarkUploader && !manImageDarkUrl && (
                                    <div className="pt-1 border-t border-border/50">
                                        <input
                                            type="file"
                                            ref={darkInputRef}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleFileUpload(f, "dark");
                                            }}
                                            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => darkInputRef.current?.click()}
                                            disabled={uploadingDark}
                                            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 cursor-pointer font-medium"
                                        >
                                            {uploadingDark ? (
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

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Explanation / Solution Hint:
                        </label>
                        <textarea
                            placeholder="Explain why the marked answer is correct..."
                            value={manExpl}
                            onChange={(e) => setManExpl(e.target.value)}
                            rows={2}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all p-3 rounded-xl text-xs font-semibold focus:outline-none leading-relaxed resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-border shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addingQuestion}
                            className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary hover:opacity-90 text-primary-foreground flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                        >
                            {addingQuestion && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {submitText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
