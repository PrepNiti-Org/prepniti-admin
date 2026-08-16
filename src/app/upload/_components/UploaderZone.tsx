"use client";

import React from "react";
import { UploadCloud, FileText, Loader2, Sparkles } from "lucide-react";

import { ExtractionProgress, LiveQuestionPreview } from "./ExtractionProgress";

interface UploaderZoneProps {
    file: File | null;
    isDragActive: boolean;
    extracting: boolean;
    handleDrag: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleProcess: () => void;
    progressPercent?: number;
    stageMessage?: string;
    completedChunks?: number;
    totalChunks?: number;
    totalPages?: number;
    strategy?: "visual" | "text";
    liveQuestions?: LiveQuestionPreview[];
    totalQuestionsFound?: number;
    onAbort?: () => void;
}

export function UploaderZone({
    file,
    isDragActive,
    extracting,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleProcess,
    progressPercent = 0,
    stageMessage = "",
    completedChunks = 0,
    totalChunks = 0,
    totalPages,
    strategy = "text",
    liveQuestions = [],
    totalQuestionsFound = 0,
    onAbort
}: UploaderZoneProps) {
    if (extracting) {
        return (
            <div className="space-y-6">
                <ExtractionProgress
                    progressPercent={progressPercent}
                    stageMessage={stageMessage}
                    completedChunks={completedChunks}
                    totalChunks={totalChunks}
                    totalPages={totalPages}
                    mode={strategy}
                    liveQuestions={liveQuestions}
                    totalQuestionsFound={totalQuestionsFound}
                    filename={file?.name}
                    onAbort={onAbort}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 bg-card flex flex-col items-center justify-center min-h-[300px] ${
                    isDragActive
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border hover:border-primary/50"
                }`}
            >
                <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
                
                {file ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-md">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground max-w-md truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF Document</p>
                        </div>
                        <label
                            htmlFor="pdf-upload"
                            className="mt-2 px-4 py-2 border border-border rounded-full text-xs font-semibold hover:bg-muted cursor-pointer transition-all text-muted-foreground hover:text-foreground"
                        >
                            Select Different File
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">Drag and drop your PDF here</p>
                            <p className="text-xs text-muted-foreground">or click below to browse your files (Supports large 50+ page PDFs)</p>
                        </div>
                        <label
                            htmlFor="pdf-upload"
                            className="mt-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-full shadow-sm cursor-pointer transition-all"
                        >
                            Select Document
                        </label>
                    </div>
                )}
            </div>

            <button
                onClick={handleProcess}
                disabled={!file || extracting}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <Sparkles className="h-5 w-5" />
                Process & Ingest Questions
            </button>
        </div>
    );
}
