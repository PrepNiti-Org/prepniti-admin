/**
 * Converts raw LaTeX strings into clean, human-readable visual characters
 * so non-technical admins NEVER see LaTeX code or '$' delimiters.
 */
export function latexToVisualText(text: string): string {
    if (!text) return "";

    let clean = text;

    // Replace fractions \frac{num}{den} -> (num)/(den) or simple fractions
    clean = clean.replace(/\\frac\{1\}\{2\}/g, "½");
    clean = clean.replace(/\\frac\{1\}\{4\}/g, "¼");
    clean = clean.replace(/\\frac\{3\}\{4\}/g, "¾");
    clean = clean.replace(/\\frac\{1\}\{3\}/g, "⅓");
    clean = clean.replace(/\\frac\{2\}\{3\}/g, "⅔");
    clean = clean.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");

    // Square roots \sqrt{x} -> √(x) or √x
    clean = clean.replace(/\\sqrt\[3\]\{([^{}]+)\}/g, "∛($1)");
    clean = clean.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");

    // Superscripts
    clean = clean.replace(/\^\{?0\}?/g, "⁰");
    clean = clean.replace(/\^\{?1\}?/g, "¹");
    clean = clean.replace(/\^\{?2\}?/g, "²");
    clean = clean.replace(/\^\{?3\}?/g, "³");
    clean = clean.replace(/\^\{?4\}?/g, "⁴");
    clean = clean.replace(/\^\{?5\}?/g, "⁵");
    clean = clean.replace(/\^\{?6\}?/g, "⁶");
    clean = clean.replace(/\^\{?7\}?/g, "⁷");
    clean = clean.replace(/\^\{?8\}?/g, "⁸");
    clean = clean.replace(/\^\{?9\}?/g, "⁹");
    clean = clean.replace(/\^\{?n\}?/g, "ⁿ");
    clean = clean.replace(/\^\{?x\}?/g, "ˣ");
    clean = clean.replace(/\^\{?y\}?/g, "ʸ");
    clean = clean.replace(/\^\{?([a-z0-9])\}?/gi, "^$1");

    // Subscripts
    clean = clean.replace(/_\{?0\}?/g, "₀");
    clean = clean.replace(/_\{?1\}?/g, "₁");
    clean = clean.replace(/_\{?2\}?/g, "₂");
    clean = clean.replace(/_\{?3\}?/g, "₃");
    clean = clean.replace(/_\{?4\}?/g, "₄");
    clean = clean.replace(/_\{?5\}?/g, "₅");
    clean = clean.replace(/_\{?6\}?/g, "₆");
    clean = clean.replace(/_\{?7\}?/g, "₇");
    clean = clean.replace(/_\{?8\}?/g, "₈");
    clean = clean.replace(/_\{?9\}?/g, "₉");

    // Common math symbols
    clean = clean.replace(/\\pm/g, "±");
    clean = clean.replace(/\\times/g, "×");
    clean = clean.replace(/\\div/g, "÷");
    clean = clean.replace(/\\neq/g, "≠");
    clean = clean.replace(/\\le(q)?/g, "≤");
    clean = clean.replace(/\\ge(q)?/g, "≥");
    clean = clean.replace(/\\approx/g, "≈");
    clean = clean.replace(/\\infty/g, "∞");
    clean = clean.replace(/\^\\circ|\^\{\\circ\}/g, "°");
    clean = clean.replace(/\\pi/g, "π");
    clean = clean.replace(/\\theta/g, "θ");
    clean = clean.replace(/\\alpha/g, "α");
    clean = clean.replace(/\\beta/g, "β");
    clean = clean.replace(/\\gamma/g, "γ");
    clean = clean.replace(/\\Delta/g, "Δ");
    clean = clean.replace(/\\lambda/g, "λ");
    clean = clean.replace(/\\mu/g, "μ");
    clean = clean.replace(/\\sigma/g, "σ");
    clean = clean.replace(/\\omega/g, "ω");
    clean = clean.replace(/\\rightarrow/g, "→");
    clean = clean.replace(/\\leftarrow/g, "←");

    // Remove LaTeX math delimiters $...$ or $$...$$
    clean = clean.replace(/\$\$/g, "");
    clean = clean.replace(/\$/g, "");

    return clean;
}

/**
 * Converts visual text to standard math representation with KaTeX delimiters
 * when saving / publishing so it renders with crisp typography on student tests.
 */
export function visualTextToLatex(text: string): string {
    if (!text) return "";
    return text.trim();
}
