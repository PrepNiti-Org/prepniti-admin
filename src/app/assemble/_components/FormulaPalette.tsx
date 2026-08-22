"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, BookOpen, Atom, Compass, Sigma, Zap, Flame, Grid3X3, Layers } from "lucide-react";

interface FormulaPaletteProps {
    onInsert: (formulaText: string) => void;
}

export const FORMULA_CATEGORIES = [
    {
        id: "calculus_analysis",
        name: "Calculus & Analysis",
        icon: Sigma,
        items: [
            { name: "Indefinite Integral", display: "∫ f(x) dx", insertText: "∫ f(x) dx" },
            { name: "Definite Integral", display: "∫₀¹ f(x) dx", insertText: "∫₀¹ f(x) dx" },
            { name: "Integration by Parts", display: "∫ u dv = uv - ∫ v du", insertText: "∫ u dv = uv - ∫ v du" },
            { name: "Derivative", display: "d/dx [f(x)]", insertText: "d/dx [f(x)]" },
            { name: "Second Derivative", display: "d²y/dx²", insertText: "d²y/dx²" },
            { name: "Partial Derivative", display: "∂f/∂x", insertText: "∂f/∂x" },
            { name: "Chain Rule", display: "dy/dx = (dy/du)(du/dx)", insertText: "dy/dx = (dy/du)(du/dx)" },
            { name: "Limit at Point", display: "lim(x→0) [f(x)]", insertText: "lim(x→0) [f(x)]" },
            { name: "Limit at Infinity", display: "lim(x→∞) [f(x)]", insertText: "lim(x→∞) [f(x)]" },
            { name: "Summation Series", display: "∑ᵢ₌₁ⁿ (xᵢ)", insertText: "∑ᵢ₌₁ⁿ (xᵢ)" },
            { name: "Infinite Sum", display: "∑ₙ₌₁^∞ (aₙ)", insertText: "∑ₙ₌₁^∞ (aₙ)" },
            { name: "Product Notation", display: "∏ᵢ₌₁ⁿ (xᵢ)", insertText: "∏ᵢ₌₁ⁿ (xᵢ)" },
        ],
    },
    {
        id: "algebra_logs",
        name: "Algebra & Logs",
        icon: Layers,
        items: [
            { name: "Log Base 10", display: "log₁₀(x)", insertText: "log₁₀(x)" },
            { name: "Natural Log", display: "ln(x)", insertText: "ln(x)" },
            { name: "Log Base a", display: "logₐ(b)", insertText: "logₐ(b)" },
            { name: "Product Rule of Log", display: "log(xy) = log(x) + log(y)", insertText: "log(xy) = log(x) + log(y)" },
            { name: "Quotient Rule of Log", display: "log(x/y) = log(x) - log(y)", insertText: "log(x/y) = log(x) - log(y)" },
            { name: "Power Rule of Log", display: "log(xⁿ) = n·log(x)", insertText: "log(xⁿ) = n·log(x)" },
            { name: "Change of Base", display: "logₐ(x) = ln(x)/ln(a)", insertText: "logₐ(x) = ln(x)/ln(a)" },
            { name: "Quadratic Roots", display: "x = (-b ± √(b² - 4ac))/(2a)", insertText: "x = (-b ± √(b² - 4ac))/(2a)" },
            { name: "Binomial Expansion", display: "(a + b)ⁿ", insertText: "(a + b)ⁿ" },
            { name: "Complex Number", display: "z = a + bi = r·e^(iθ)", insertText: "z = a + bi = r·e^(iθ)" },
            { name: "Square Root", display: "√(x)", insertText: "√(x)" },
            { name: "Cube Root", display: "∛(x)", insertText: "∛(x)" },
            { name: "Fraction", display: "(a)/(b)", insertText: "(a)/(b)" },
        ],
    },
    {
        id: "physics_mechanics",
        name: "Physics: Mechanics & Energy",
        icon: Atom,
        items: [
            { name: "Velocity-Time", display: "v = u + at", insertText: "v = u + at" },
            { name: "Displacement-Time", display: "s = ut + ½at²", insertText: "s = ut + ½at²" },
            { name: "Velocity-Displacement", display: "v² = u² + 2as", insertText: "v² = u² + 2as" },
            { name: "Newton's 2nd Law", display: "F = ma", insertText: "F = ma" },
            { name: "Kinetic Energy", display: "Eₖ = ½mv²", insertText: "Eₖ = ½mv²" },
            { name: "Potential Energy", display: "Eₚ = mgh", insertText: "Eₚ = mgh" },
            { name: "Work Done", display: "W = F·d·cos(θ)", insertText: "W = F·d·cos(θ)" },
            { name: "Power", display: "P = W/t = F·v", insertText: "P = W/t = F·v" },
            { name: "Linear Momentum", display: "p = mv", insertText: "p = mv" },
            { name: "Impulse", display: "J = F·Δt = Δp", insertText: "J = F·Δt = Δp" },
            { name: "Centripetal Acceleration", display: "a_c = v²/r = ω²r", insertText: "a_c = v²/r = ω²r" },
            { name: "Universal Gravitation", display: "F = G(m₁m₂)/r²", insertText: "F = G(m₁m₂)/r²" },
            { name: "Gravitational Potential", display: "U = -G(M·m)/r", insertText: "U = -G(M·m)/r" },
            { name: "Escape Velocity", display: "v_e = √(2GM/R)", insertText: "v_e = √(2GM/R)" },
        ],
    },
    {
        id: "physics_electromagnetism",
        name: "Physics: Electromagnetism & Optics",
        icon: Zap,
        items: [
            { name: "Coulomb's Law", display: "F = k(q₁q₂)/r²", insertText: "F = k(q₁q₂)/r²" },
            { name: "Electric Field", display: "E = F/q = kQ/r²", insertText: "E = F/q = kQ/r²" },
            { name: "Ohm's Law", display: "V = IR", insertText: "V = IR" },
            { name: "Electric Power", display: "P = VI = I²R = V²/R", insertText: "P = VI = I²R = V²/R" },
            { name: "Capacitance", display: "C = Q/V = (ε₀A)/d", insertText: "C = Q/V = (ε₀A)/d" },
            { name: "Energy in Capacitor", display: "U = ½CV²", insertText: "U = ½CV²" },
            { name: "Lorentz Force", display: "F = q(E + v × B)", insertText: "F = q(E + v × B)" },
            { name: "Magnetic Force on Wire", display: "F = I·L·B·sin(θ)", insertText: "F = I·L·B·sin(θ)" },
            { name: "Biot-Savart Law", display: "B = (μ₀I)/(2πr)", insertText: "B = (μ₀I)/(2πr)" },
            { name: "Faraday's Law of Induction", display: "ε = -dΦ/dt", insertText: "ε = -dΦ/dt" },
            { name: "Lens / Mirror Formula", display: "1/f = 1/v - 1/u", insertText: "1/f = 1/v - 1/u" },
            { name: "Refractive Index (Snell's)", display: "n₁·sin(θ₁) = n₂·sin(θ₂)", insertText: "n₁·sin(θ₁) = n₂·sin(θ₂)" },
        ],
    },
    {
        id: "physics_waves_modern",
        name: "Waves, Thermo & Quantum",
        icon: Flame,
        items: [
            { name: "Ideal Gas Law", display: "PV = nRT", insertText: "PV = nRT" },
            { name: "First Law of Thermo", display: "ΔU = Q - W", insertText: "ΔU = Q - W" },
            { name: "Work in Gas Expansion", display: "W = P·ΔV", insertText: "W = P·ΔV" },
            { name: "Carnot Efficiency", display: "η = 1 - (T_c/T_h)", insertText: "η = 1 - (T_c/T_h)" },
            { name: "Simple Pendulum", display: "T = 2π√(l/g)", insertText: "T = 2π√(l/g)" },
            { name: "Spring-Mass Oscillator", display: "T = 2π√(m/k)", insertText: "T = 2π√(m/k)" },
            { name: "Wave Velocity", display: "v = f·λ", insertText: "v = f·λ" },
            { name: "Doppler Effect", display: "f' = f·(v ± v_o)/(v ∓ v_s)", insertText: "f' = f·(v ± v_o)/(v ∓ v_s)" },
            { name: "Photon Energy", display: "E = hf = hc/λ", insertText: "E = hf = hc/λ" },
            { name: "de Broglie Wavelength", display: "λ = h/p", insertText: "λ = h/p" },
            { name: "Mass-Energy Equivalence", display: "E = mc²", insertText: "E = mc²" },
            { name: "Radioactive Decay", display: "N(t) = N₀·e^(-λt)", insertText: "N(t) = N₀·e^(-λt)" },
            { name: "Half-Life Formula", display: "T_½ = ln(2)/λ", insertText: "T_½ = ln(2)/λ" },
        ],
    },
    {
        id: "chemistry_formulas",
        name: "Chemistry Formulas",
        icon: BookOpen,
        items: [
            { name: "pH Value", display: "pH = -log₁₀[H⁺]", insertText: "pH = -log₁₀[H⁺]" },
            { name: "pOH Value", display: "pOH = -log₁₀[OH⁻]", insertText: "pOH = -log₁₀[OH⁻]" },
            { name: "Water Ion Product", display: "pH + pOH = 14", insertText: "pH + pOH = 14" },
            { name: "Chemical Equilibrium", display: "K_c = [C]^c[D]^d / [A]^a[B]^b", insertText: "K_c = [C]^c[D]^d / [A]^a[B]^b" },
            { name: "Nernst Equation", display: "E = E° - (RT/nF)·ln(Q)", insertText: "E = E° - (RT/nF)·ln(Q)" },
            { name: "Gibbs Free Energy", display: "ΔG = ΔH - TΔS", insertText: "ΔG = ΔH - TΔS" },
            { name: "Arrhenius Equation", display: "k = A·e^(-E_a/RT)", insertText: "k = A·e^(-E_a/RT)" },
            { name: "Heat Capacity", display: "Q = mcΔT", insertText: "Q = mcΔT" },
            { name: "Molarity", display: "M = n/V", insertText: "M = n/V" },
            { name: "Osmotic Pressure", display: "Π = iCRT", insertText: "Π = iCRT" },
        ],
    },
    {
        id: "trig_vectors",
        name: "Trigonometry & Vectors",
        icon: Compass,
        items: [
            { name: "Sine Ratio", display: "sin(θ)", insertText: "sin(θ)" },
            { name: "Cosine Ratio", display: "cos(θ)", insertText: "cos(θ)" },
            { name: "Tangent Ratio", display: "tan(θ)", insertText: "tan(θ)" },
            { name: "Pythagorean Identity", display: "sin²(θ) + cos²(θ) = 1", insertText: "sin²(θ) + cos²(θ) = 1" },
            { name: "Secant Identity", display: "1 + tan²(θ) = sec²(θ)", insertText: "1 + tan²(θ) = sec²(θ)" },
            { name: "Double Angle Sin", display: "sin(2θ) = 2sin(θ)cos(θ)", insertText: "sin(2θ) = 2sin(θ)cos(θ)" },
            { name: "Double Angle Cos", display: "cos(2θ) = cos²(θ) - sin²(θ)", insertText: "cos(2θ) = cos²(θ) - sin²(θ)" },
            { name: "Vector Dot Product", display: "vec(A) · vec(B) = |A||B|cos(θ)", insertText: "vec(A) · vec(B) = |A||B|cos(θ)" },
            { name: "Vector Cross Product", display: "vec(A) × vec(B) = |A||B|sin(θ)n̂", insertText: "vec(A) × vec(B) = |A||B|sin(θ)n̂" },
            { name: "Vector Components", display: "vec(r) = x î + y ĵ + z k̂", insertText: "vec(r) = x î + y ĵ + z k̂" },
            { name: "Vector Magnitude", display: "|vec(r)| = √(x² + y² + z²)", insertText: "|vec(r)| = √(x² + y² + z²)" },
            { name: "Triangle Area", display: "Area = ½ × b × h", insertText: "Area = ½ × b × h" },
            { name: "Circle Area", display: "Area = πr²", insertText: "Area = πr²" },
        ],
    },
    {
        id: "matrices_sets",
        name: "Matrices & Logic",
        icon: Grid3X3,
        items: [
            { name: "2x2 Matrix", display: "[[a, b], [c, d]]", insertText: "[[a, b], [c, d]]" },
            { name: "2x2 Determinant", display: "|A| = ad - bc", insertText: "|A| = ad - bc" },
            { name: "Belongs to (Set)", display: "x ∈ A", insertText: "x ∈ A" },
            { name: "Does Not Belong to", display: "x ∉ A", insertText: "x ∉ A" },
            { name: "Subset", display: "A ⊂ B", insertText: "A ⊂ B" },
            { name: "Union", display: "A ∪ B", insertText: "A ∪ B" },
            { name: "Intersection", display: "A ∩ B", insertText: "A ∩ B" },
            { name: "Null / Empty Set", display: "∅", insertText: "∅" },
            { name: "For All Quantifier", display: "∀x", insertText: "∀x" },
            { name: "Exists Quantifier", display: "∃x", insertText: "∃x" },
            { name: "Implies", display: "P ⇒ Q", insertText: "P ⇒ Q" },
            { name: "If and Only If", display: "P ⇔ Q", insertText: "P ⇔ Q" },
        ],
    },
    {
        id: "symbols_units",
        name: "Scientific Symbols",
        icon: BookOpen,
        items: [
            { name: "Alpha", display: "α", insertText: "α" },
            { name: "Beta", display: "β", insertText: "β" },
            { name: "Gamma", display: "γ", insertText: "γ" },
            { name: "Delta", display: "Δ", insertText: "Δ" },
            { name: "Theta", display: "θ", insertText: "θ" },
            { name: "Lambda", display: "λ", insertText: "λ" },
            { name: "Mu", display: "μ", insertText: "μ" },
            { name: "Rho", display: "ρ", insertText: "ρ" },
            { name: "Sigma", display: "σ", insertText: "σ" },
            { name: "Omega", display: "ω", insertText: "ω" },
            { name: "Ohm (Resistance)", display: "Ω", insertText: "Ω" },
            { name: "Epsilon", display: "ε₀", insertText: "ε₀" },
            { name: "Degrees", display: "°", insertText: "°" },
            { name: "Plus/Minus", display: "±", insertText: "±" },
            { name: "Approximately", display: "≈", insertText: "≈" },
            { name: "Proportional to", display: "∝", insertText: "∝" },
            { name: "Infinity", display: "∞", insertText: "∞" },
            { name: "Gradient / Del", display: "∇", insertText: "∇" },
            { name: "Partial Differential", display: "∂", insertText: "∂" },
            { name: "Planck's Constant", display: "ℏ", insertText: "ℏ" },
            { name: "Perpendicular", display: "⊥", insertText: "⊥" },
            { name: "Parallel", display: "∥", insertText: "∥" },
            { name: "Angle Symbol", display: "∠", insertText: "∠" },
            { name: "Right Arrow", display: "→", insertText: "→" },
        ],
    },
];

export function FormulaPalette({ onInsert }: FormulaPaletteProps) {
    const [activeTab, setActiveTab] = useState(FORMULA_CATEGORIES[0].id);
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentCat = FORMULA_CATEGORIES.find((c) => c.id === activeTab) || FORMULA_CATEGORIES[0];

    // Close on click outside or escape
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    isOpen
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/40 border-border text-foreground"
                }`}
                title="Browse Full Math, Physics & Chemistry Formula Library"
            >
                <Sparkles className="h-3.5 w-3.5" />
                <span>+ Formula Library (Logs, Calculus, Physics, Chem)</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-2.5rem)] sm:w-[540px] max-w-[540px] bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <div>
                                <span className="font-extrabold">Formula &amp; Symbol Library</span>
                                <p className="text-[10px] text-muted-foreground font-normal">Click any formula to insert into your question</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                        {FORMULA_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeTab === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-2xs"
                                            : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                                    }`}
                                >
                                    <Icon className="h-3 w-3" />
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Formula Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                        {currentCat.items.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => {
                                    onInsert(item.insertText);
                                    setIsOpen(false);
                                }}
                                className="p-2.5 rounded-xl bg-muted/20 hover:bg-primary/10 hover:border-primary/40 border border-border/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
                            >
                                <div className="text-[10px] text-muted-foreground font-semibold group-hover:text-primary truncate">
                                    {item.name}
                                </div>
                                <div className="text-xs font-bold text-foreground font-mono mt-1 group-hover:text-primary">
                                    {item.display}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
