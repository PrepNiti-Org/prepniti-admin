"use client";

import React, { useRef, useState } from "react";
import { FormulaPalette } from "./FormulaPalette";
import { MathRenderer } from "../../../components/MathRenderer";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface InlineMathTextareaProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
    label?: string;
}

const COMMON_QUICK_SYMBOLS = [
    { label: "x²", insert: "²", title: "Superscript 2" },
    { label: "x³", insert: "³", title: "Superscript 3" },
    { label: "xⁿ", insert: "ⁿ", title: "Superscript n" },
    { label: "x₁", insert: "₁", title: "Subscript 1" },
    { label: "x₂", insert: "₂", title: "Subscript 2" },
    { label: "√", insert: "√", title: "Square Root" },
    { label: "½", insert: "½", title: "Fraction 1/2" },
    { label: "±", insert: "±", title: "Plus-Minus" },
    { label: "×", insert: "×", title: "Multiply" },
    { label: "÷", insert: "÷", title: "Divide" },
    { label: "≠", insert: "≠", title: "Not Equal" },
    { label: "≤", insert: "≤", title: "Less or Equal" },
    { label: "≥", insert: "≥", title: "Greater or Equal" },
    { label: "π", insert: "π", title: "Pi" },
    { label: "θ", insert: "θ", title: "Theta" },
    { label: "α", insert: "α", title: "Alpha" },
    { label: "β", insert: "β", title: "Beta" },
    { label: "Δ", insert: "Δ", title: "Delta" },
    { label: "°", insert: "°", title: "Degrees" },
    { label: "→", insert: "→", title: "Arrow" },
];

export function InlineMathTextarea({
    value,
    onChange,
    placeholder = "Type here...",
    rows = 2,
    className = "",
    label,
}: InlineMathTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showSymbols, setShowSymbols] = useState(false);

    const handleInsert = (textToInsert: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            onChange(value ? `${value} ${textToInsert}` : textToInsert);
            return;
        }

        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const before = value.substring(0, start);
        const after = value.substring(end);
        const nextVal = `${before}${textToInsert}${after}`;
        onChange(nextVal);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + textToInsert.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 30);
    };

    const hasMath = /(?:[²³ⁿ₀₁₂₃₄₅₆₇₈₉√½¼¾⅓⅔±∓×·÷≠≤≥≈∝∞∇∂⊥∥∠°αβγδΔθλμπσωΩεℏ\\∫∑∏]|lim\(|log₁₀|logₐ|\bln\(|\$)/.test(value || "");

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* Header Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                {label && <label className="text-xs font-bold text-foreground">{label}</label>}

                <div className="flex items-center gap-1.5 ml-auto">
                    <button
                        type="button"
                        onClick={() => setShowSymbols(!showSymbols)}
                        className={`h-7 px-2.5 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                            showSymbols
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-muted/30 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>Symbols</span>
                        {showSymbols ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    <FormulaPalette onInsert={handleInsert} />
                </div>
            </div>

            {/* Collapsible Quick Symbols */}
            {showSymbols && (
                <div className="flex items-center gap-1 flex-wrap p-1.5 px-2 rounded-xl bg-muted/30 border border-border/80 animate-in fade-in duration-100">
                    {COMMON_QUICK_SYMBOLS.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => handleInsert(item.insert)}
                            className="h-6 min-w-6 px-1.5 rounded-md bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border text-foreground text-xs font-bold transition-colors cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs"
                            title={item.title}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Natural Textarea */}
            <textarea
                ref={textareaRef}
                rows={rows}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-muted/20 text-foreground border border-border focus:bg-background focus:border-primary p-3 rounded-xl text-xs font-medium focus:outline-none resize-none leading-relaxed transition-all"
            />

            {/* Live KaTeX Rendered Preview when math is present */}
            {hasMath && value && value.trim() && (
                <div className="p-2.5 rounded-xl bg-card border border-primary/20 space-y-1 shadow-2xs animate-in fade-in duration-150">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Formatted Math Preview
                    </div>
                    <div className="text-sm text-foreground font-normal leading-relaxed">
                        <MathRenderer text={value} />
                    </div>
                </div>
            )}
        </div>
    );
}
