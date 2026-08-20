"use client";

import React from "react";
import { Question } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Sparkles, Loader2, X, GripVertical, HelpCircle, BarChart2 } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CompilePanelProps {
    paperTitle: string;
    setPaperTitle: (title: string) => void;
    examType: string;
    setExamType: (type: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
    targetExam: string;
    setTargetExam: (targetExam: string) => void;
    selectedQuestions: Question[];
    onRemoveSelected: (id: string) => void;
    onReorder: (ids: string[]) => void;
    onClickQuestion?: (id: string) => void;
    onCompile: () => void;
    publishing: boolean;
    isEditing?: boolean;
}

interface SortableItemProps {
    id: string;
    q: Question;
    idx: number;
    onRemove: (id: string) => void;
    onClick?: () => void;
}

function SortableItem({ id, q, idx, onRemove, onClick }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 50 : "auto",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between gap-3 p-3 bg-card border border-border/80 rounded-xl hover:border-primary/40 transition-all select-none group"
        >
            <div
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                onClick={onClick}
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground p-1 rounded transition-colors shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="h-4 w-4" />
                </div>
                <span className="text-xs font-mono font-bold text-primary shrink-0">
                    Q{idx + 1}.
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{q.question_text}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                        {q.topic && <span>{q.topic}</span>}
                        {q.difficulty && <span>• {q.difficulty}</span>}
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(q.id);
                }}
                className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                title="Remove from paper"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function CompilePanel({
    paperTitle,
    setPaperTitle,
    examType,
    setExamType,
    duration,
    setDuration,
    targetExam,
    setTargetExam,
    selectedQuestions,
    onRemoveSelected,
    onReorder,
    onClickQuestion,
    onCompile,
    publishing,
    isEditing = false
}: CompilePanelProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = selectedQuestions.findIndex((q) => q.id === active.id);
            const newIndex = selectedQuestions.findIndex((q) => q.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove(selectedQuestions, oldIndex, newIndex);
                onReorder(reordered.map((q) => q.id));
            }
        }
    };

    // Calculate difficulty distribution
    const totalQ = selectedQuestions.length;
    const easyCount = selectedQuestions.filter(q => q.difficulty?.toLowerCase() === "easy").length;
    const medCount = selectedQuestions.filter(q => q.difficulty?.toLowerCase() === "medium" || q.difficulty?.toLowerCase() === "average").length;
    const hardCount = selectedQuestions.filter(q => q.difficulty?.toLowerCase() === "hard" || q.difficulty?.toLowerCase() === "difficult").length;

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Paper Specifications Card */}
            <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">
                        {isEditing ? "Edit Test Paper Details" : "Test Paper Details"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Set title, target exam, format, and time duration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground block">
                            Mock Paper Title:
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. UPSC CSE CSAT 2026 Set-B"
                            value={paperTitle}
                            onChange={(e) => setPaperTitle(e.target.value)}
                            className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Target Exam Category:
                            </label>
                            <select
                                value={targetExam}
                                onChange={(e) => setTargetExam(e.target.value)}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
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
                                <option value="Law" className="bg-background">Law</option>
                                <option value="Nursing" className="bg-background">Nursing</option>
                                <option value="Other" className="bg-background">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Exam Format:
                            </label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="practice" className="bg-background">Practice Sheet</option>
                                <option value="full" className="bg-background">Full-Length Mock</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground block">
                                Duration (Mins):
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={duration || ""}
                                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full bg-muted/40 text-foreground border border-border focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all h-10 px-3.5 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Blueprint Stats & Reorder Section */}
            <Card className="border border-border bg-card">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-primary" /> Selected Questions & Order
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Drag questions using the grip handle to reorder the test sequence.
                        </CardDescription>
                    </div>
                    <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                        {totalQ} Questions Selected
                    </span>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Difficulty breakdown */}
                    {totalQ > 0 && (
                        <div className="p-3 bg-muted/30 rounded-xl border border-border space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                                <span>Difficulty Breakdown</span>
                                <div className="flex gap-3">
                                    <span className="text-emerald-500 font-bold">Easy: {easyCount}</span>
                                    <span className="text-amber-500 font-bold">Medium: {medCount}</span>
                                    <span className="text-rose-500 font-bold">Hard: {hardCount}</span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                                {easyCount > 0 && (
                                    <div
                                        style={{ width: `${(easyCount / totalQ) * 100}%` }}
                                        className="bg-emerald-500 h-full"
                                        title={`Easy: ${Math.round((easyCount / totalQ) * 100)}%`}
                                    />
                                )}
                                {medCount > 0 && (
                                    <div
                                        style={{ width: `${(medCount / totalQ) * 100}%` }}
                                        className="bg-amber-500 h-full"
                                        title={`Medium: ${Math.round((medCount / totalQ) * 100)}%`}
                                    />
                                )}
                                {hardCount > 0 && (
                                    <div
                                        style={{ width: `${(hardCount / totalQ) * 100}%` }}
                                        className="bg-rose-500 h-full"
                                        title={`Hard: ${Math.round((hardCount / totalQ) * 100)}%`}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Question Reorder List */}
                    {totalQ === 0 ? (
                        <div className="py-12 text-center border border-dashed rounded-xl text-muted-foreground text-xs space-y-2">
                            <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/50" />
                            <p className="font-semibold text-foreground">No questions selected yet.</p>
                            <p>Switch to the &ldquo;Question Bank&rdquo; tab above to select questions for this mock paper.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={selectedQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                                    {selectedQuestions.map((q, idx) => (
                                        <SortableItem
                                            key={q.id}
                                            id={q.id}
                                            q={q}
                                            idx={idx}
                                            onRemove={onRemoveSelected}
                                            onClick={() => onClickQuestion && onClickQuestion(q.id)}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}

                    <div className="pt-2 border-t border-border">
                        <button
                            onClick={onCompile}
                            disabled={publishing || selectedQuestions.length === 0 || !paperTitle.trim()}
                            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {publishing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> {isEditing ? "Saving Paper Updates..." : "Publishing Exam Paper..."}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" /> {isEditing ? "Save Exam Changes" : "Compile & Publish Paper"}
                                </>
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
