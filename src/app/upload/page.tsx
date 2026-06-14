"use client";

import React, { useState, useEffect } from "react";
import { api, extractionApi } from "../../lib/api";
import { toast } from "sonner";

import { SettingsPanel } from "./_components/SettingsPanel";
import { UploaderZone } from "./_components/UploaderZone";
import { ResultSummary } from "./_components/ResultSummary";

export default function UploadPage() {
    const [strategy, setStrategy] = useState<"text" | "visual">("text");
    const [models, setModels] = useState<string[]>(["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro"]);
    const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
    const [loadingModels, setLoadingModels] = useState(true);

    const [file, setFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [result, setResult] = useState<{
        filename: string;
        saved_count: number;
        linked_count: number;
        total_questions: number;
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

    const handleProcess = async () => {
        if (!file) return;

        setExtracting(true);
        setResult(null);
        toast.info("Initializing PDF sliding-window extraction pipeline...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("model_name", selectedModel);
        formData.append("is_visual", String(strategy === "visual"));

        try {
            const res = await extractionApi.post<{
                status: string;
                filename: string;
                saved_count: number;
                linked_count: number;
                total_questions: number;
            }>("/extract", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.status === "success") {
                setResult({
                    filename: res.data.filename,
                    saved_count: res.data.saved_count,
                    linked_count: res.data.linked_count,
                    total_questions: res.data.total_questions
                });
                toast.success("Extraction Completed Successfully!");

                api.post("/admin/audit-logs", {
                    action: "PDF_INGEST",
                    details: `Ingested exam paper PDF '${res.data.filename}' successfully (Questions: ${res.data.total_questions})`
                }).catch(err => {
                    console.error("Failed to write PDF ingestion audit log:", err);
                });
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || "Pipeline processing failed.";
            toast.error(`Ingestion failure: ${msg}`);
        } finally {
            setExtracting(false);
        }
    };

    return (
        <div className="container max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12 text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent -z-10" />

                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Ingest Exam Paper
                </h1>
                <p className="text-muted-foreground text-md max-w-2xl mx-auto">
                    Upload digital or scanned PDF exam papers to automatically segment layout frames, map context flows, and structure questions using Gemini AI models.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <SettingsPanel
                        strategy={strategy}
                        setStrategy={setStrategy}
                        models={models}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        loadingModels={loadingModels}
                    />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <UploaderZone
                        file={file}
                        isDragActive={isDragActive}
                        extracting={extracting}
                        handleDrag={handleDrag}
                        handleDrop={handleDrop}
                        handleFileChange={handleFileChange}
                        handleProcess={handleProcess}
                    />
                </div>
            </div>

            {result && <ResultSummary result={result} />}
        </div>
    );
}
