"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";

interface TrendChartProps {
    chartData: { name: string; score: number }[];
}

export function TrendChart({ chartData }: TrendChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Accuracy Progression (Last 20 attempts)</CardTitle>
                <CardDescription>Tracking candidate scores trend sequentially.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
