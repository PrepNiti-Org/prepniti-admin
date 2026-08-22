"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
    text: string;
    className?: string;
    inline?: boolean;
}

/**
 * Pre-processes visual/unicode math (integrals, limits, trig, vectors, symbols)
 * into high-precision, publication-grade KaTeX.
 */
export function normalizeMathToKatex(rawMath: string): string {
    if (!rawMath) return "";
    let math = rawMath;

    // 1. Vector expressions & hats
    math = math.replace(/([a-zA-Z])\u20D7/g, "\\vec{$1}");
    math = math.replace(/vec\(([a-zA-Z0-9]+)\)/g, "\\vec{$1}");
    math = math.replace(/([A-Z])⃗/g, "\\vec{$1}");
    math = math.replace(/([a-z])⃗/g, "\\vec{$1}");
    math = math.replace(/î|î/g, "\\hat{i}");
    math = math.replace(/ĵ|ĵ/g, "\\hat{j}");
    math = math.replace(/k̂/g, "\\hat{k}");
    math = math.replace(/n̂/g, "\\hat{n}");

    // 2. Limits: e.g. lim(x→∞), lim(x->0), lim(n→∞), lim(x \to a)
    math = math.replace(/lim\s*\(([a-zA-Z0-9]+)\s*(?:→|->|\\to|\\rightarrow)\s*([^)]+)\)/g, "\\lim\\limits_{$1 \\to $2}");
    math = math.replace(/\\lim_\{/g, "\\lim\\limits_{");

    // 3. Integrals with limits: e.g. ∫₀¹, ∫_0^1, ∫ₐᵇ, ∫
    math = math.replace(/∫\s*₀\s*¹/g, "\\int\\limits_{0}^{1}");
    math = math.replace(/∫\s*ₐ\s*ᵇ/g, "\\int\\limits_{a}^{b}");
    math = math.replace(/∫\s*([₀₁₂₃₄₅₆₇₈₉a-z]+)\s*([⁰¹²³⁴⁵⁶⁷⁸⁹a-z]+)/g, (match, lower, upper) => {
        const l = lower.replace(/₀/g, "0").replace(/₁/g, "1").replace(/₂/g, "2").replace(/₃/g, "3").replace(/₄/g, "4").replace(/₅/g, "5").replace(/₆/g, "6").replace(/₇/g, "7").replace(/₈/g, "8").replace(/₉/g, "9");
        const u = upper.replace(/⁰/g, "0").replace(/¹/g, "1").replace(/²/g, "2").replace(/³/g, "3").replace(/⁴/g, "4").replace(/⁵/g, "5").replace(/⁶/g, "6").replace(/⁷/g, "7").replace(/⁸/g, "8").replace(/⁹/g, "9");
        return `\\int\\limits_{${l}}^{${u}}`;
    });
    math = math.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, "\\int\\limits_{$1}^{$2}");
    math = math.replace(/\\int_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, "\\int\\limits_{$1}^{$2}");
    math = math.replace(/∫/g, "\\int ");

    // 4. Summations & Products
    math = math.replace(/∑\s*ᵢ₌₁\s*ⁿ/g, "\\sum\\limits_{i=1}^{n}");
    math = math.replace(/∑\s*ₙ₌₁\s*\^?∞/g, "\\sum\\limits_{n=1}^{\\infty}");
    math = math.replace(/∑/g, "\\sum\\limits ");
    math = math.replace(/∏\s*ᵢ₌₁\s*ⁿ/g, "\\prod\\limits_{i=1}^{n}");
    math = math.replace(/∏/g, "\\prod\\limits ");

    // 5. Trigonometric Functions & Powers
    math = math.replace(/\b(sin|cos|tan|sec|csc|cot)\s*²\s*\(/g, "\\$1^{2}(");
    math = math.replace(/\b(sin|cos|tan|sec|csc|cot)\s*³\s*\(/g, "\\$1^{3}(");
    math = math.replace(/\b(sin|cos|tan|sec|csc|cot)\s*ⁿ\s*\(/g, "\\$1^{n}(");
    math = math.replace(/\b(sin|cos|tan|sec|csc|cot)\s*²\s*([a-zA-Zθφαβ])/g, "\\$1^{2}($2)");
    math = math.replace(/\b(sin|cos|tan|sec|csc|cot)\s*\(/g, "\\$1(");

    // 6. Logarithms
    math = math.replace(/log₁₀\s*\(/g, "\\log_{10}(");
    math = math.replace(/logₐ\s*\(/g, "\\log_{a}(");
    math = math.replace(/\bln\s*\(/g, "\\ln(");
    math = math.replace(/\blog\s*\(/g, "\\log(");

    // 7. Greek Letters
    math = math.replace(/α/g, "\\alpha ");
    math = math.replace(/β/g, "\\beta ");
    math = math.replace(/γ/g, "\\gamma ");
    math = math.replace(/Δ/g, "\\Delta ");
    math = math.replace(/δ/g, "\\delta ");
    math = math.replace(/θ/g, "\\theta ");
    math = math.replace(/λ/g, "\\lambda ");
    math = math.replace(/μ/g, "\\mu ");
    math = math.replace(/π/g, "\\pi ");
    math = math.replace(/ρ/g, "\\rho ");
    math = math.replace(/σ/g, "\\sigma ");
    math = math.replace(/τ/g, "\\tau ");
    math = math.replace(/φ|ϕ/g, "\\phi ");
    math = math.replace(/ω/g, "\\omega ");
    math = math.replace(/Ω/g, "\\Omega ");
    math = math.replace(/ε₀/g, "\\varepsilon_0 ");
    math = math.replace(/μ₀/g, "\\mu_0 ");
    math = math.replace(/ε/g, "\\varepsilon ");
    math = math.replace(/ℏ/g, "\\hbar ");

    // 8. Math Operators & Relations
    math = math.replace(/±/g, "\\pm ");
    math = math.replace(/∓/g, "\\mp ");
    math = math.replace(/×/g, "\\times ");
    math = math.replace(/·/g, "\\cdot ");
    math = math.replace(/÷/g, "\\div ");
    math = math.replace(/≠/g, "\\neq ");
    math = math.replace(/≤/g, "\\le ");
    math = math.replace(/≥/g, "\\ge ");
    math = math.replace(/≈/g, "\\approx ");
    math = math.replace(/∝/g, "\\propto ");
    math = math.replace(/∞/g, "\\infty ");
    math = math.replace(/→/g, "\\rightarrow ");
    math = math.replace(/°/g, "^\\circ ");
    math = math.replace(/∇/g, "\\nabla ");
    math = math.replace(/∂/g, "\\partial ");
    math = math.replace(/⊥/g, "\\perp ");
    math = math.replace(/∥/g, "\\parallel ");
    math = math.replace(/∠/g, "\\angle ");

    // 9. Roots & Fractions
    math = math.replace(/√\(([^()]+)\)/g, "\\sqrt{$1}");
    math = math.replace(/∛\(([^()]+)\)/g, "\\sqrt[3]{$1}");
    math = math.replace(/\(([a-zA-Z0-9_+*\-\s]+)\)\/\(([a-zA-Z0-9_+*\-\s]+)\)/g, "\\frac{$1}{$2}");
    math = math.replace(/½/g, "\\frac{1}{2}");
    math = math.replace(/¼/g, "\\frac{1}{4}");
    math = math.replace(/¾/g, "\\frac{3}{4}");
    math = math.replace(/⅓/g, "\\frac{1}{3}");
    math = math.replace(/⅔/g, "\\frac{2}{3}");

    // 10. Subscripts & Superscripts
    math = math.replace(/₀/g, "_0");
    math = math.replace(/₁/g, "_1");
    math = math.replace(/₂/g, "_2");
    math = math.replace(/₃/g, "_3");
    math = math.replace(/₄/g, "_4");
    math = math.replace(/₅/g, "_5");
    math = math.replace(/₆/g, "_6");
    math = math.replace(/₇/g, "_7");
    math = math.replace(/₈/g, "_8");
    math = math.replace(/₉/g, "_9");
    math = math.replace(/ₖ/g, "_k");
    math = math.replace(/ₚ/g, "_p");
    math = math.replace(/ₙ/g, "_n");

    math = math.replace(/⁰/g, "^0");
    math = math.replace(/¹/g, "^1");
    math = math.replace(/²/g, "^2");
    math = math.replace(/³/g, "^3");
    math = math.replace(/⁴/g, "^4");
    math = math.replace(/⁵/g, "^5");
    math = math.replace(/⁶/g, "^6");
    math = math.replace(/⁷/g, "^7");
    math = math.replace(/⁸/g, "^8");
    math = math.replace(/⁹/g, "^9");
    math = math.replace(/ⁿ/g, "^n");
    math = math.replace(/⁺/g, "^+");
    math = math.replace(/⁻/g, "^-");

    return math;
}

/**
 * Safely renders a math expression string using KaTeX
 */
function renderKatexHtml(mathStr: string, displayMode = false): string {
    const normalized = normalizeMathToKatex(mathStr.trim());
    try {
        return katex.renderToString(normalized, {
            displayMode,
            throwOnError: false,
            strict: false,
        });
    } catch {
        return mathStr;
    }
}

/**
 * Auto-delimit standalone LaTeX commands and formulas in text if not already delimited by $...$
 * Guarantees that normal English words and spaces outside formulas are NEVER eaten by LaTeX.
 */
function autoDelimitMath(text: string): string {
    if (!text) return "";

    const hasExplicitDelimiters = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/.test(text);
    if (hasExplicitDelimiters) {
        return text;
    }

    let processed = text;

    // 1. Wrap block environments: \begin{...}...\end{...}
    processed = processed.replace(/(\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\})/g, "$$$1$$$");

    // 2. Wrap complex LaTeX commands with braces: e.g. \frac{a}{b}, \sqrt{x}, \int_{a}^{b}, etc.
    processed = processed.replace(
        /(\\(?:frac|sqrt|vec|hat|bar|text|mathbf|mathrm|partial|int|sum|prod|lim)(?:_\{[^}]+\}|\^\{[^}]+\}|\[[^\]]+\]|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})+)/g,
        "$$$1$$"
    );

    // 3. Wrap Greek letters and standalone LaTeX symbols: \alpha, \beta, \theta, \pi, \infty, etc.
    processed = processed.replace(
        /(\\(?:alpha|beta|gamma|delta|Delta|epsilon|varepsilon|zeta|eta|theta|Theta|iota|kappa|lambda|Lambda|mu|nu|xi|pi|Pi|rho|sigma|Sigma|tau|phi|Phi|chi|psi|Psi|omega|Omega|infty|approx|pm|mp|times|div|leq|geq|le|ge|neq|rightarrow|leftarrow|to|nabla|hbar|circ)\b)/g,
        "$$$1$$"
    );

    // 4. Wrap Integral expressions with precision (stops at dx, dy, dt, dz):
    // e.g. ∫₀¹ f(x) dx or ∫ f(x) dx
    processed = processed.replace(
        /(∫\s*(?:₀\s*¹|ₐ\s*ᵇ|[₀₁₂₃₄₅₆₇₈₉a-z]+[⁰¹²³⁴⁵⁶⁷⁸⁹a-z]+)?\s*[a-zA-Z0-9_+*\-\/\(\)\^²³ⁿ\s]+?\s*d[a-zA-Z])/g,
        "$$$1$$"
    );

    // 5. Wrap Limits: e.g. lim(x→∞) [f(x)] or lim(x→0) f(x)
    processed = processed.replace(
        /(lim\s*\([^)]+\)\s*(?:\[[^\]]+\]|\([^\)]+\)|[a-zA-Z0-9_+\-*\/()]+))/g,
        "$$$1$$"
    );

    // 6. Wrap Summations / Series: e.g. ∑ᵢ₌₁ⁿ (xᵢ)
    processed = processed.replace(
        /([∑∏]\s*(?:ᵢ₌₁\s*ⁿ|ₙ₌₁\s*\^?∞|[₀₁₂₃₄₅₆₇₈₉a-z]+[⁰¹²³⁴⁵⁶⁷⁸⁹a-z]+)?\s*(?:\[[^\]]+\]|\([^\)]+\)|[a-zA-Z0-9_+\-*\/()]+))/g,
        "$$$1$$"
    );

    // 7. Wrap Logs / Roots: e.g. log₁₀(x), ln(x), √(x), ∛(x)
    processed = processed.replace(
        /((?:log₁₀|logₐ|\bln\b|\blog\b|√|∛)\s*\([^\)]+\))/g,
        "$$$1$$"
    );

    // 8. Wrap Trig identities: e.g. sin²(θ) + cos²(θ) = 1
    processed = processed.replace(
        /(\b(?:sin|cos|tan|sec|csc|cot)[²³ⁿ]?\s*\([^\)]+\)\s*[+\-*=]\s*(?:sin|cos|tan|sec|csc|cot)[²³ⁿ]?\s*\([^\)]+\)(?:\s*=\s*[0-9a-zA-Z]+)?)/g,
        "$$$1$$"
    );

    // 9. Wrap Vectors: e.g. vec(A) · vec(B), vec(r) = x î + y ĵ + z k̂
    processed = processed.replace(
        /((?:vec\([a-zA-Z0-9]+\)|[a-zA-Z]⃗|î|ĵ|k̂|n̂)(?:\s*(?:·|×|\+|\-|=)\s*(?:vec\([a-zA-Z0-9]+\)|[a-zA-Z]⃗|î|ĵ|k̂|n̂|[a-zA-Z0-9\(\)\|]+))*)/g,
        "$$$1$$"
    );

    return processed;
}

export function MathRenderer({ text, className = "", inline = false }: MathRendererProps) {
    const renderedContent = useMemo(() => {
        if (!text) return null;

        const preparedText = autoDelimitMath(text);

        // Regex for explicit math delimiters:
        // 1. $$ ... $$ or \[ ... \]
        // 2. $ ... $ or \( ... \)
        const explicitMathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

        const parts = preparedText.split(explicitMathRegex);

        return parts.map((part, index) => {
            if (!part) return null;

            if (
                (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) ||
                (part.startsWith("\\[") && part.endsWith("\\]") && part.length >= 4)
            ) {
                const inner = part.startsWith("$$") ? part.slice(2, -2) : part.slice(2, -2);
                const html = renderKatexHtml(inner, true);
                return (
                    <span
                        key={index}
                        className="block my-2 overflow-x-auto text-center font-normal"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            }

            if (
                (part.startsWith("$") && part.endsWith("$") && part.length >= 2) ||
                (part.startsWith("\\(") && part.endsWith("\\)") && part.length >= 4)
            ) {
                const inner = part.startsWith("$") ? part.slice(1, -1) : part.slice(2, -2);
                const html = renderKatexHtml(inner, false);
                return (
                    <span
                        key={index}
                        className="inline-math px-0.5 font-normal"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                );
            }

            // Normal text outside math formulas: ALWAYS preserve all whitespace and spaces
            return (
                <span key={index} className="whitespace-pre-wrap">
                    {part}
                </span>
            );
        });
    }, [text]);

    if (inline) {
        return <span className={`math-content ${className}`}>{renderedContent}</span>;
    }

    return <div className={`math-content ${className}`}>{renderedContent}</div>;
}
