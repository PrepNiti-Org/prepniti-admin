"use client";

import React from "react";
import { Clock, Target, Users } from "lucide-react";
import { Card } from "../../../components/ui/card";

interface MetricCardsProps {
    totalAttemptsCount: number;
    avgAccuracy: number;
    uniqueUsersCount: number;
}

export function MetricCards({
    totalAttemptsCount,
    avgAccuracy,
    uniqueUsersCount
}: MetricCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card>
                <div className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-sans block">Total Attempts</span>
                        <div className="text-xl font-bold font-mono text-foreground mt-0.5">{totalAttemptsCount} sessions</div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
                        <Target className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-sans block">Average Accuracy</span>
                        <div className="text-xl font-bold font-mono text-foreground mt-0.5">{avgAccuracy}%</div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500 shrink-0">
                        <Users className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-sans block">Unique Candidates</span>
                        <div className="text-xl font-bold font-mono text-foreground mt-0.5">{uniqueUsersCount} active users</div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
