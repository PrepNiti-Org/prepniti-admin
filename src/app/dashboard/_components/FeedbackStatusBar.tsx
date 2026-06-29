"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface StatusCount {
    status: string;
    count: number;
}

interface FeedbackStatusBarProps {
    data: StatusCount[];
}

const STATUS_COLORS: Record<string, string> = {
    unread:   "hsl(217 91% 60%)",   // Blue
    read:     "var(--muted-foreground)", // Slate
    resolved: "hsl(142 71% 45%)",   // Emerald
    archived: "hsl(240 5% 65%)",    // Zinc
};

export function FeedbackStatusBar({ data }: FeedbackStatusBarProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                No feedback status data available
            </div>
        );
    }

    const formattedData = data.map((d) => ({
        ...d,
        displayName: d.status.charAt(0).toUpperCase() + d.status.slice(1),
    }));

    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formattedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                    <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                        dataKey="displayName"
                        type="category"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                        stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            borderRadius: "12px",
                            fontSize: "12px",
                        }}
                    />
                    <Bar dataKey="count" name="Feedback Count" radius={[0, 8, 8, 0]} barSize={16}>
                        {formattedData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={STATUS_COLORS[entry.status.toLowerCase()] || "var(--primary)"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
