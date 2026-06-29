"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryCount {
    category: string;
    count: number;
}

interface FeedbackDonutChartProps {
    data: CategoryCount[];
}

const COLORS = [
    "hsl(15 100% 57%)",  // Primary orange
    "hsl(122 39% 50%)",  // Secondary green
    "hsl(262 83% 58%)",  // Purple
    "hsl(190 90% 45%)",  // Cyan
    "hsl(340 75% 55%)",  // Pink/Rose
    "hsl(43 96% 56%)",   // Yellow/Amber
];

export function FeedbackDonutChart({ data }: FeedbackDonutChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">
                No feedback data available
            </div>
        );
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="category"
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="var(--card)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            borderRadius: "12px",
                            fontSize: "12px",
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                            <span className="text-[11px] capitalize text-muted-foreground font-semibold px-1">
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
