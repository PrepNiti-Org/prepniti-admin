"use client";

import { useTheme } from "next-themes";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface DailyAttempt {
    date: string;
    count: number;
}

interface AttemptsTrendChartProps {
    data: DailyAttempt[];
}

export function AttemptsTrendChart({ data }: AttemptsTrendChartProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const formattedData = data.map((d) => {
        const dateObj = new Date(d.date);
        return {
            ...d,
            formattedDate: dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
        };
    });

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={formattedData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="attemptsColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="formattedDate"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        stroke="var(--muted-foreground)"
                    />
                    <YAxis
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        stroke="var(--muted-foreground)"
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "var(--muted-foreground)" }}
                        itemStyle={{ color: "var(--primary)" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        name="Attempts"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#attemptsColor)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
