"use client";

import React, { useState, useRef } from "react";
import {
    X,
    Upload,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    Loader2,
    AlertCircle,
    FileText,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../lib/api";

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ParsedQuestion {
    question_text: string;
    type: string;
    topic: string;
    difficulty: string;
    explanation: string;
    options: {
        option_text: string;
        is_correct: boolean;
    }[];
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
    const [parsingError, setParsingError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Paper Metadata fields
    const [testTitle, setTestTitle] = useState("");
    const [targetExam, setTargetExam] = useState("");
    const [duration, setDuration] = useState<number | "">("");
    const [examType, setExamType] = useState("");
    const [showQuestionsPreview, setShowQuestionsPreview] = useState(false);

    if (!isOpen) return null;

    // Download CSV Sample Template
    const handleDownloadTemplate = () => {
        const sampleCSV = `Question,Option A,Option B,Option C,Option D,Correct Option,Topic,Difficulty,Explanation
"What is the capital of India?","Mumbai","New Delhi","Kolkata","Chennai","B","General Knowledge","Easy","New Delhi is the official capital of India."
"Who is known as the father of Indian Constitution?","Mahatma Gandhi","Dr. B. R. Ambedkar","Jawaharlal Nehru","Sardar Patel","B","Polity","Medium","Dr. B. R. Ambedkar chaired the drafting committee."
"Which planet is known as the Red Planet?","Venus","Mars","Jupiter","Saturn","B","Science","Easy","Iron oxide on Mars surface gives it a reddish appearance."`;

        const blob = new Blob([sampleCSV], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "prepniti_test_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Downloaded Excel / CSV Sample Template!");
    };

    // Helper: Parse CSV Text to Questions
    const parseCSV = (text: string): ParsedQuestion[] => {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) {
            throw new Error("The file is empty or missing question rows.");
        }

        // Parse CSV with quotes handling
        const parseRow = (line: string): string[] => {
            const result: string[] = [];
            let cur = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"' || char === "'") {
                    if (inQuotes && line[i + 1] === char) {
                        cur += char;
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(cur.trim());
                    cur = "";
                } else {
                    cur += char;
                }
            }
            result.push(cur.trim());
            return result;
        };

        const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
        const qIdx = headers.findIndex(h => h.includes("question"));
        const optAIdx = headers.findIndex(h => h.includes("optiona") || h === "a");
        const optBIdx = headers.findIndex(h => h.includes("optionb") || h === "b");
        const optCIdx = headers.findIndex(h => h.includes("optionc") || h === "c");
        const optDIdx = headers.findIndex(h => h.includes("optiond") || h === "d");
        const correctIdx = headers.findIndex(h => h.includes("correct") || h.includes("answer"));
        const topicIdx = headers.findIndex(h => h.includes("topic") || h.includes("subject"));
        const diffIdx = headers.findIndex(h => h.includes("diff"));
        const expIdx = headers.findIndex(h => h.includes("expl"));

        if (qIdx === -1) {
            throw new Error("Could not find a 'Question' column in the uploaded file header.");
        }

        const questions: ParsedQuestion[] = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = parseRow(lines[i]);
            if (!cols[qIdx] || cols[qIdx].trim() === "") continue;

            const qText = cols[qIdx];
            const optA = (optAIdx !== -1 && cols[optAIdx]) ? cols[optAIdx] : "";
            const optB = (optBIdx !== -1 && cols[optBIdx]) ? cols[optBIdx] : "";
            const optC = (optCIdx !== -1 && cols[optCIdx]) ? cols[optCIdx] : "";
            const optD = (optDIdx !== -1 && cols[optDIdx]) ? cols[optDIdx] : "";

            const rawAns = (correctIdx !== -1 && cols[correctIdx]) ? cols[correctIdx].toUpperCase().trim() : "A";
            const topic = (topicIdx !== -1 && cols[topicIdx]) ? cols[topicIdx] : "General";
            const diff = (diffIdx !== -1 && cols[diffIdx]) ? cols[diffIdx] : "Medium";
            const expl = (expIdx !== -1 && cols[expIdx]) ? cols[expIdx] : "";

            const rawOptions = [optA, optB, optC, optD].filter(o => o.trim() !== "");
            if (rawOptions.length === 0) continue;

            const options = [
                { option_text: optA, is_correct: rawAns.includes("A") || rawAns === "1" },
                { option_text: optB, is_correct: rawAns.includes("B") || rawAns === "2" },
                { option_text: optC, is_correct: rawAns.includes("C") || rawAns === "3" },
                { option_text: optD, is_correct: rawAns.includes("D") || rawAns === "4" }
            ].filter(o => o.option_text.trim() !== "");

            // If no option marked correct, default to first option
            if (!options.some(o => o.is_correct) && options.length > 0) {
                options[0].is_correct = true;
            }

            questions.push({
                question_text: qText,
                type: "multiple_choice",
                topic,
                difficulty: diff,
                explanation: expl,
                options
            });
        }

        return questions;
    };

    // Helper: Parse JSON Text to Questions
    const parseJSON = (text: string): { filename?: string; exam_name?: string; duration?: number; target_exam?: string; questions: ParsedQuestion[] } => {
        const data = JSON.parse(text);
        let qList: any[] = [];
        let name = "";
        let dur = 60;
        let target = "General";

        if (Array.isArray(data)) {
            qList = data;
        } else if (data.questions && Array.isArray(data.questions)) {
            qList = data.questions;
            name = data.exam_name || data.filename || "";
            dur = data.duration || 60;
            target = data.target_exam || "General";
        } else {
            throw new Error("Invalid JSON format. Expected a list of questions or an object with a 'questions' array.");
        }

        const questions: ParsedQuestion[] = qList.map((q: any) => {
            let options: { option_text: string; is_correct: boolean }[] = [];
            if (Array.isArray(q.options)) {
                options = q.options.map((opt: any) => {
                    if (typeof opt === "string") {
                        return { option_text: opt, is_correct: false };
                    }
                    return {
                        option_text: opt.option_text || opt.text || "",
                        is_correct: Boolean(opt.is_correct || opt.correct)
                    };
                });
            }

            if (!options.some(o => o.is_correct) && options.length > 0) {
                options[0].is_correct = true;
            }

            return {
                question_text: q.question_text || q.text || q.question || "",
                type: q.type || "multiple_choice",
                topic: q.topic || "General",
                difficulty: q.difficulty || "Medium",
                explanation: q.explanation || "",
                options
            };
        }).filter((q: ParsedQuestion) => q.question_text.trim().length > 0);

        return { filename: name, exam_name: name, duration: dur, target_exam: target, questions };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setIsParsing(true);
        setParsingError(null);

        // Auto-generate initial test title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setTestTitle(cleanName);

        try {
            const content = await file.text();
            let parsed: ParsedQuestion[] = [];

            if (file.name.endsWith(".json")) {
                const jsonRes = parseJSON(content);
                parsed = jsonRes.questions;
                if (jsonRes.exam_name) setTestTitle(jsonRes.exam_name);
                if (jsonRes.duration) setDuration(jsonRes.duration);
                if (jsonRes.target_exam) setTargetExam(jsonRes.target_exam);
            } else {
                // Parse as CSV / Spreadsheet
                parsed = parseCSV(content);
            }

            if (parsed.length === 0) {
                throw new Error("No valid questions could be read from this file.");
            }

            setParsedQuestions(parsed);
            toast.success(`Successfully read ${parsed.length} questions from ${file.name}!`);
        } catch (err: any) {
            setParsingError(err.message || "Failed to parse file. Please check format.");
            setParsedQuestions([]);
        } finally {
            setIsParsing(false);
        }
    };

    const handleSavePaper = async () => {
        if (!testTitle.trim()) {
            toast.error("Please enter a name for this test paper.");
            return;
        }
        if (!targetExam.trim()) {
            toast.error("Please select a target exam category.");
            return;
        }
        if (!examType.trim()) {
            toast.error("Please select a test format.");
            return;
        }
        if (!duration || Number(duration) < 5) {
            toast.error("Please enter a test duration of at least 5 minutes.");
            return;
        }
        if (parsedQuestions.length === 0) {
            toast.error("Please upload a file containing valid questions.");
            return;
        }

        setIsUploading(true);
        try {
            const payload = {
                filename: testTitle.trim(),
                exam_name: testTitle.trim(),
                exam_type: examType,
                duration: Number(duration),
                target_exam: targetExam,
                questions: parsedQuestions
            };

            await api.post("/admin/papers/import-json", payload);
            toast.success(`Test paper "${testTitle}" uploaded with ${parsedQuestions.length} questions.`);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to create test paper.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            <h2 className="text-base font-bold text-foreground">Upload Test Paper</h2>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Upload your question paper from Excel, CSV, or formatted files.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Step 1: File Dropzone or Download Template */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            1. Select Question Paper File
                        </span>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                            <Download className="h-3.5 w-3.5" /> Download Excel/CSV Template
                        </button>
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                            selectedFile
                                ? "border-primary/50 bg-primary/[0.02]"
                                : "border-border hover:border-primary/40 bg-muted/20"
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.json,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {isParsing ? (
                            <div className="flex flex-col items-center gap-2 text-primary py-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-xs font-semibold">Reading question file...</span>
                            </div>
                        ) : selectedFile && parsedQuestions.length > 0 ? (
                            <div className="flex flex-col items-center gap-1.5 text-foreground py-1">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                <span className="text-xs font-bold text-foreground">{selectedFile.name}</span>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                                    {parsedQuestions.length} Questions Ready to Import
                                </span>
                                <span className="text-[10px] text-muted-foreground pt-1">Click to select a different file</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
                                <Upload className="h-8 w-8 text-muted-foreground/50" />
                                <span className="text-xs font-semibold text-foreground">
                                    Drop your Excel (.csv) or JSON test paper file here
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    Supports CSV, Excel sheets, and JSON question sets
                                </span>
                            </div>
                        )}
                    </div>

                    {parsingError && (
                        <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{parsingError}</span>
                        </div>
                    )}
                </div>

                {/* Step 2: Test Paper Details (Displayed once file is loaded) */}
                {parsedQuestions.length > 0 && (
                    <div className="space-y-4 pt-2 border-t border-border animate-in fade-in duration-200">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            2. Test Paper Details
                        </span>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Test Paper Name:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. SBI Clerk Prelims - Full Mock 1"
                                    value={testTitle}
                                    onChange={(e) => setTestTitle(e.target.value)}
                                    className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Target Exam Category:</label>
                                    <select
                                        value={targetExam}
                                        onChange={(e) => setTargetExam(e.target.value)}
                                        className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                                    >
                                        <option value="">Select Exam Category...</option>
                                        <option value="Banking">Banking (SBI, IBPS)</option>
                                        <option value="UPSC">UPSC Civil Services</option>
                                        <option value="SSC">SSC CGL / CHSL</option>
                                        <option value="JEE">JEE Main & Advanced</option>
                                        <option value="NEET">NEET Medical</option>
                                        <option value="State PCS">State PCS</option>
                                        <option value="Defence">Defence / NDA / CDS</option>
                                        <option value="Teaching">Teaching / CTET</option>
                                        <option value="General">General Practice</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Test Format:</label>
                                    <select
                                        value={examType}
                                        onChange={(e) => setExamType(e.target.value)}
                                        className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                                    >
                                        <option value="">Select Test Format...</option>
                                        <option value="full_mock">Full Length Mock Test</option>
                                        <option value="practice">Topic Practice Sheet</option>
                                        <option value="sectional">Sectional Test</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Duration (Minutes):</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={360}
                                        placeholder="e.g. 60"
                                        value={duration}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDuration(val === "" ? "" : Number(val));
                                        }}
                                        className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            {/* Preview questions toggle */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowQuestionsPreview(!showQuestionsPreview)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    {showQuestionsPreview ? "Hide Preview" : `Preview Questions (${parsedQuestions.length})`}
                                    {showQuestionsPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>

                                {showQuestionsPreview && (
                                    <div className="mt-2.5 max-h-48 overflow-y-auto space-y-2 border border-border rounded-xl p-3 bg-muted/20 text-xs">
                                        {parsedQuestions.map((q, idx) => (
                                            <div key={idx} className="p-2 bg-card border border-border/80 rounded-lg space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-primary text-[10px]">Q{idx + 1}.</span>
                                                    <span className="font-semibold truncate">{q.question_text}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                    {q.options.map((opt, oIdx) => (
                                                        <span
                                                            key={oIdx}
                                                            className={`text-[10px] px-2 py-0.5 rounded ${
                                                                opt.is_correct
                                                                    ? "bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20"
                                                                    : "bg-muted text-muted-foreground"
                                                            }`}
                                                        >
                                                            {String.fromCharCode(65 + oIdx)}: {opt.option_text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isUploading}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSavePaper}
                        disabled={!selectedFile || parsedQuestions.length === 0 || !testTitle.trim() || isUploading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                    >
                        {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {isUploading ? "Uploading Test..." : "Upload & Create Test Paper"}
                    </button>
                </div>
            </div>
        </div>
    );
}
