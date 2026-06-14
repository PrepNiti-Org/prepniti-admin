"use client";

import React from "react";
import { CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";

interface ResultSummaryProps {
    result: {
        filename: string;
        saved_count: number;
        linked_count: number;
        total_questions: number;
    };
}

export function ResultSummary({ result }: ResultSummaryProps) {
    return (
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-2.5 flex-1">
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider font-sans">
                    Ingestion Pipeline Complete
                </h3>
                <p className="text-sm text-foreground font-medium">
                    Processed and registered **{result.filename}** in the repository.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs leading-none">
                    <div className="bg-card border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-muted-foreground block font-bold mb-1 text-[10px] uppercase">New Saved</span>
                            <span className="font-mono text-base font-bold text-foreground">{result.saved_count}</span>
                        </div>
                        <div className="h-8 w-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="bg-card border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-muted-foreground block font-bold mb-1 text-[10px] uppercase">Linked Dups</span>
                            <span className="font-mono text-base font-bold text-foreground">{result.linked_count}</span>
                        </div>
                        <div className="h-8 w-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="bg-card border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-muted-foreground block font-bold mb-1 text-[10px] uppercase">Total Checked</span>
                            <span className="font-mono text-base font-bold text-foreground">{result.total_questions}</span>
                        </div>
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <FileSpreadsheet className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
