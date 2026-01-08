"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Calendar, Clock, MapPin } from "lucide-react";

interface ImageChartProps {
    title: string;
    description?: string;
    data: {
        value: number;
        label: string;
        color?: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
    type?: "donut" | "bar" | "line" | "area" | "scatter";
    className?: string;
}

export function ImageChart({ title, description, data, type = "donut", className }: ImageChartProps) {
    const renderChart = () => {
        switch (type) {
            case "donut":
                return <DonutChart data={data} />;
            case "bar":
                return <BarChart data={data} />;
            case "line":
                return <LineChart data={data} />;
            case "area":
                return <AreaChart data={data} />;
            case "scatter":
                return <ScatterChart data={data} />;
            default:
                return <DonutChart data={data} />;
        }
    };

    return (
        <Card className={className}>
            <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base font-semibold sm:text-lg">{title}</CardTitle>
                {description && <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>}
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 md:p-6">{renderChart()}</CardContent>
        </Card>
    );
}

function DonutChart({ data }: { data: ImageChartProps["data"] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

    if (total === 0 || data.length === 0) {
        return (
            <div className="relative flex h-48 w-full flex-col items-center justify-center sm:h-64">
                <svg className="h-32 w-32 -rotate-90 transform sm:h-48 sm:w-48" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        strokeDasharray="100 0"
                        strokeDashoffset="0"
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-400 sm:text-2xl">0</span>
                    <span className="text-xs text-gray-400 sm:text-sm">No Data</span>
                </div>
            </div>
        );
    }

    let cumulativePercentage = 0;

    return (
        <div className="w-full">
            {/* Chart and Legend Container - Stack on mobile, side by side on larger screens */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {/* Chart */}
                <div className="relative flex items-center justify-center">
                    <svg
                        className="h-32 w-32 -rotate-90 transform sm:h-40 sm:w-40 md:h-48 md:w-48"
                        viewBox="0 0 100 100"
                    >
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const strokeDasharray = `${percentage} ${100 - percentage}`;
                            const strokeDashoffset = -cumulativePercentage;

                            cumulativePercentage += percentage;

                            return (
                                <circle
                                    key={index}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={item.color || colors[index % colors.length]}
                                    strokeWidth="8"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset.toString()}
                                    className="transition-all duration-500 ease-in-out"
                                />
                            );
                        })}
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{total}</span>
                        <span className="text-xs text-gray-500 sm:text-sm">Total</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-2 sm:flex-col sm:gap-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                            <div
                                className="h-2.5 w-2.5 flex-shrink-0 rounded-full sm:h-3 sm:w-3"
                                style={{ backgroundColor: item.color || colors[index % colors.length] }}
                            />
                            <span className="max-w-[60px] truncate text-gray-600 sm:max-w-none">{item.label}</span>
                            <span className="font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BarChart({ data }: { data: ImageChartProps["data"] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-48 w-full items-center justify-center text-gray-400 sm:h-64">
                <div className="text-center">
                    <div className="text-base font-medium sm:text-lg">No Data Available</div>
                    <div className="text-xs sm:text-sm">Add some data to see the chart</div>
                </div>
            </div>
        );
    }

    const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.value || 0)) : 1;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

    return (
        <div className="h-48 w-full sm:h-64">
            <div className="flex h-full items-end justify-between gap-1 sm:gap-2">
                {data.map((item, index) => {
                    const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                        <div key={index} className="flex min-w-0 flex-1 flex-col items-center">
                            <div className="relative flex w-full flex-col items-center">
                                <div
                                    className="mx-auto w-full max-w-[40px] rounded-t-md transition-all duration-500 ease-in-out hover:opacity-80 sm:max-w-none"
                                    style={{
                                        height: `${Math.max(height, 2)}%`,
                                        backgroundColor: item.color || colors[index % colors.length],
                                    }}
                                />
                                <div className="mt-1 text-[10px] font-medium text-gray-600 sm:mt-2 sm:text-xs">
                                    {item.value}
                                </div>
                            </div>
                            <div className="mt-0.5 w-full truncate px-0.5 text-center text-[10px] text-gray-500 sm:mt-1 sm:text-xs">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LineChart({ data }: { data: ImageChartProps["data"] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-48 w-full items-center justify-center text-gray-400 sm:h-64">
                <div className="text-center">
                    <div className="text-base font-medium sm:text-lg">No Data Available</div>
                    <div className="text-xs sm:text-sm">Add some data to see the chart</div>
                </div>
            </div>
        );
    }

    const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.value || 0)) : 1;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

    const points = data
        .map((item, index) => {
            const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
            const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 100;
            const validX = isNaN(x) ? 50 : x;
            const validY = isNaN(y) ? 50 : y;
            return `${validX},${validY}`;
        })
        .join(" ");

    return (
        <div className="relative h-48 w-full pb-5 sm:h-64 sm:pb-6">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y, index) => (
                    <line key={index} x1="0" y1={y} x2="100" y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
                ))}

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    className="transition-all duration-500 ease-in-out"
                />

                {/* Data points */}
                {data.map((item, index) => {
                    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
                    const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 100;
                    const validX = isNaN(x) ? 50 : x;
                    const validY = isNaN(y) ? 50 : y;
                    return (
                        <circle
                            key={index}
                            cx={validX}
                            cy={validY}
                            r="2"
                            fill="#3B82F6"
                            className="hover:r-3 transition-all duration-500 ease-in-out"
                        />
                    );
                })}
            </svg>

            {/* Labels */}
            <div className="absolute right-0 bottom-0 left-0 flex justify-between px-1 text-[10px] text-gray-500 sm:text-xs">
                {data.map((item, index) => (
                    <span key={index} className="max-w-[35px] truncate sm:max-w-none">
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function AreaChart({ data }: { data: ImageChartProps["data"] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-48 w-full items-center justify-center text-gray-400 sm:h-64">
                <div className="text-center">
                    <div className="text-base font-medium sm:text-lg">No Data Available</div>
                    <div className="text-xs sm:text-sm">Add some data to see the chart</div>
                </div>
            </div>
        );
    }

    const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.value || 0)) : 1;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

    const points = data
        .map((item, index) => {
            const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
            const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 100;
            const validX = isNaN(x) ? 50 : x;
            const validY = isNaN(y) ? 50 : y;
            return `${validX},${validY}`;
        })
        .join(" ");

    const areaPath = `M 0,100 L ${points} L 100,100 Z`;

    return (
        <div className="relative h-48 w-full pb-5 sm:h-64 sm:pb-6">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y, index) => (
                    <line key={index} x1="0" y1={y} x2="100" y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
                ))}

                {/* Area */}
                <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-500 ease-in-out" />

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    className="transition-all duration-500 ease-in-out"
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Labels */}
            <div className="absolute right-0 bottom-0 left-0 flex justify-between px-1 text-[10px] text-gray-500 sm:text-xs">
                {data.map((item, index) => (
                    <span key={index} className="max-w-[35px] truncate sm:max-w-none">
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function ScatterChart({ data }: { data: ImageChartProps["data"] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-48 w-full items-center justify-center text-gray-400 sm:h-64">
                <div className="text-center">
                    <div className="text-base font-medium sm:text-lg">No Data Available</div>
                    <div className="text-xs sm:text-sm">Add some data to see the chart</div>
                </div>
            </div>
        );
    }

    const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.value || 0)) : 1;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

    return (
        <div className="relative h-48 w-full pb-5 sm:h-64 sm:pb-6">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y, index) => (
                    <line key={`h-${index}`} x1="0" y1={y} x2="100" y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
                ))}
                {[0, 25, 50, 75, 100].map((x, index) => (
                    <line key={`v-${index}`} x1={x} y1="0" x2={x} y2="100" stroke="#E5E7EB" strokeWidth="0.5" />
                ))}

                {/* Scatter points */}
                {data.map((item, index) => {
                    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
                    const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 100;
                    const radius = maxValue > 0 ? Math.max(2, Math.min(8, (item.value / maxValue) * 6 + 2)) : 2;

                    const validX = isNaN(x) ? 50 : x;
                    const validY = isNaN(y) ? 50 : y;
                    const validRadius = isNaN(radius) ? 4 : radius;

                    return (
                        <circle
                            key={index}
                            cx={validX}
                            cy={validY}
                            r={validRadius}
                            fill={item.color || colors[index % colors.length]}
                            className="hover:r-10 transition-all duration-500 ease-in-out"
                        />
                    );
                })}
            </svg>

            {/* Labels */}
            <div className="absolute right-0 bottom-0 left-0 flex justify-between px-1 text-[10px] text-gray-500 sm:text-xs">
                {data.map((item, index) => (
                    <span key={index} className="max-w-[35px] truncate sm:max-w-none">
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
