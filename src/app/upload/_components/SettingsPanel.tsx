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
        <Card className="border border-border bg-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Ingestion Configuration</CardTitle>
                <CardDescription className="text-xs">Configure extraction models and target metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        Extraction Strategy:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setStrategy("text")}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                strategy === "text"
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "border-border hover:bg-muted text-muted-foreground bg-muted/20"
                            }`}
                        >
                            <div className="font-bold">Text Native</div>
                            <div className="text-[10px] opacity-75 font-normal">Digital PDFs</div>
                        </button>
                        <button
                            onClick={() => setStrategy("visual")}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                strategy === "visual"
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "border-border hover:bg-muted text-muted-foreground bg-muted/20"
                            }`}
                        >
                            <div className="font-bold">Visual Scan</div>
                            <div className="text-[10px] opacity-75 font-normal">Scanned images</div>
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground block">
                        Target Gemini Model:
                    </label>
                    {loadingModels ? (
                        <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/40 p-2.5 rounded-xl border border-border">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Querying models...
                        </div>
                    ) : (
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            {models.map(m => (
                                <option key={m} value={m} className="bg-background text-foreground">{m}</option>
                            ))}
                        </select>
                    )}
                </div>

                <hr className="border-border/60" />

                <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Default Auto-Applied Tags
                    </span>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Target Category:
                        </label>
                        <select
                            value={defaultCategory}
                            onChange={(e) => setDefaultCategory(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                            <option value="UPSC" className="bg-background">UPSC</option>
                            <option value="JEE" className="bg-background">JEE</option>
                            <option value="NEET" className="bg-background">NEET</option>
                            <option value="GATE" className="bg-background">GATE</option>
                            <option value="CAT" className="bg-background">CAT</option>
                            <option value="SSC" className="bg-background">SSC CGL</option>
                            <option value="Bank" className="bg-background">Bank</option>
                            <option value="Teaching" className="bg-background">Teaching</option>
                            <option value="State PCS" className="bg-background">State PCS</option>
                            <option value="Defence" className="bg-background">Defence</option>
                            <option value="Other" className="bg-background">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Default Topic Tag:
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Modern Indian History"
                            value={defaultTopic}
                            onChange={(e) => setDefaultTopic(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Default Difficulty:
                        </label>
                        <select
                            value={defaultDifficulty}
                            onChange={(e) => setDefaultDifficulty(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
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
