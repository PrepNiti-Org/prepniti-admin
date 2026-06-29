"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Loader2 } from "lucide-react";

interface SettingsPanelProps {
    strategy: "text" | "visual";
    setStrategy: (v: "text" | "visual") => void;
    models: string[];
    selectedModel: string;
    setSelectedModel: (v: string) => void;
    loadingModels: boolean;
    defaultCategory: string;
    setDefaultCategory: (v: string) => void;
    defaultTopic: string;
    setDefaultTopic: (v: string) => void;
    defaultDifficulty: string;
    setDefaultDifficulty: (v: string) => void;
}

export function SettingsPanel({
    strategy,
    setStrategy,
    models,
    selectedModel,
    setSelectedModel,
    loadingModels,
    defaultCategory,
    setDefaultCategory,
    defaultTopic,
    setDefaultTopic,
    defaultDifficulty,
    setDefaultDifficulty
}: SettingsPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Ingestion Settings</CardTitle>
                <CardDescription>Configure extraction models and strategies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        Strategy:
                    </label>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setStrategy("text")}
                            className={`px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${strategy === "text"
                                    ? "bg-primary/15 border-primary text-primary"
                                    : "border-border hover:bg-muted text-muted-foreground bg-background/50"
                                }`}
                        >
                            <div className="font-bold">Text Extraction</div>
                            <div className="text-[10px] opacity-80 mt-0.5 font-normal">Digital native text PDFs</div>
                        </button>
                        <button
                            onClick={() => setStrategy("visual")}
                            className={`px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${strategy === "visual"
                                    ? "bg-primary/15 border-primary text-primary"
                                    : "border-border hover:bg-muted text-muted-foreground bg-background/50"
                                }`}
                        >
                            <div className="font-bold">Visual Segmentation</div>
                            <div className="text-[10px] opacity-80 mt-0.5 font-normal">Scanned images / complex grids</div>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        Target Gemini Model:
                    </label>
                    {loadingModels ? (
                        <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 p-3 rounded-xl border border-border">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Querying models...
                        </div>
                    ) : (
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            {models.map(m => (
                                <option key={m} value={m} className="bg-background text-foreground">{m}</option>
                            ))}
                        </select>
                    )}
                </div>

                <hr className="border-border/60" />

                <div className="space-y-3.5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Default Metadata (Auto-Applied)</span>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Target Category:
                        </label>
                        <select
                            value={defaultCategory}
                            onChange={(e) => setDefaultCategory(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="UPSC" className="bg-background">UPSC</option>
                            <option value="JEE" className="bg-background">JEE</option>
                            <option value="NEET" className="bg-background">NEET</option>
                            <option value="GATE" className="bg-background">GATE</option>
                            <option value="CAT" className="bg-background">CAT</option>
                            <option value="SSC" className="bg-background">SSC CGL</option>
                            <option value="Other" className="bg-background">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Default Topic Tag:
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Modern Indian History"
                            value={defaultTopic}
                            onChange={(e) => setDefaultTopic(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Default Difficulty:
                        </label>
                        <select
                            value={defaultDifficulty}
                            onChange={(e) => setDefaultDifficulty(e.target.value)}
                            className="w-full bg-primary/10 text-foreground border border-primary/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:border-primary transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="Medium" className="bg-background">Medium (Default)</option>
                            <option value="Easy" className="bg-background">Easy</option>
                            <option value="Hard" className="bg-background">Hard</option>
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
