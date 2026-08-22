"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { MathRenderer } from "../../../components/MathRenderer";

interface InlineChoiceFieldProps {
    letter: string;
    value: string;
    isCorrect: boolean;
    isMSQ: boolean;
    onToggleCorrect: () => void;
    onChange: (val: string) => void;
    onRemove?: () => void;
}

export function InlineChoiceField({
    letter,
    value,
    isCorrect,
    isMSQ,
    onToggleCorrect,
    onChange,
    onRemove,
}: InlineChoiceFieldProps) {
    const hasMath = /(?:[²³ⁿ₀₁₂₃₄₅₆₇₈₉]|√|∛|½|¼|¾|∫|∑|lim|sin|cos|tan|log|ln|vec|π|θ|α|β|Δ|±|×|÷|≠|≤|≥|°|→)/.test(value);

    return (
        <div
            className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
                isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/[0.04] ring-1 ring-emerald-500/20"
                    : "border-border bg-muted/20 focus-within:border-border/80"
            }`}
        >
            <div className="flex items-center gap-2.5">
                {/* Toggle button for Correct Choice (Checkbox for MSQ, Radio for SCQ) */}
                <button
                    type="button"
                    onClick={onToggleCorrect}
                    className={`h-5 w-5 ${isMSQ ? "rounded-md" : "rounded-full"} border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        isCorrect
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-muted-foreground/40 hover:border-primary bg-background"
                    }`}
                    title={`Mark Choice ${letter} as Correct`}
                >
                    {isCorrect && (
                        isMSQ ? (
                            <span className="text-white text-[11px] font-black leading-none">✓</span>
                        ) : (
                            <div className="h-2 w-2 rounded-full bg-white" />
                        )
                    )}
                </button>

                {/* Letter Badge */}
                <span className="font-mono font-bold text-xs text-muted-foreground shrink-0">
                    {letter}.
                </span>

                {/* Clean Choice Text Input */}
                <input
                    type="text"
                    placeholder={`Choice ${letter} text...`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-transparent text-foreground text-xs font-semibold focus:outline-none"
                />

                {/* Remove Option Button */}
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-muted-foreground hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                        title="Remove Choice"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Live Rendered Math in Choice if contains formula */}
            {hasMath && (
                <div className="pl-7 text-xs font-medium text-foreground border-t border-border/40 pt-1">
                    <MathRenderer text={value} inline />
                </div>
            )}
        </div>
    );
}
