"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    description?: string;
    colorClassName?: string;
    bgClassName?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    onClick?: () => void;
    isActive?: boolean;
}

/**
 * StatCard component displays a single statistic with icon and optional trend
 * Optimized with React.memo to prevent unnecessary re-renders
 * Mobile-responsive: compact layout on small screens
 */
export const StatCard = memo(function StatCard({ title, value, icon: Icon, description, trend, colorClassName, bgClassName, onClick, isActive }: StatCardProps) {
    // Determine active border color based on text color
    const activeBorderClass = isActive 
        ? (colorClassName?.includes('amber') ? 'border-amber-500 ring-2 ring-amber-500/20' : 
           colorClassName?.includes('emerald') ? 'border-emerald-500 ring-2 ring-emerald-500/20' :
           colorClassName?.includes('indigo') ? 'border-indigo-500 ring-2 ring-indigo-500/20' :
           'border-[#3882a5] ring-2 ring-[#3882a5]/20')
        : 'border-transparent';

    return (
        <Card
            onClick={onClick}
            className={`
                relative border-2 shadow-sm transition-all duration-300 overflow-hidden
                ${isActive ? "shadow-lg scale-[1.05] bg-white z-10" : (bgClassName || "bg-card opacity-80")} 
                ${activeBorderClass}
                ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" : ""}
            `}
        >
            {isActive && (
                <div className={`absolute top-0 right-0 p-1`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${colorClassName?.replace('text-', 'bg-')}`}></div>
                </div>
            )}
            <CardContent className="flex flex-col items-center justify-center py-2 sm:py-3 px-4 sm:px-5">
                <div className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-center mb-1 ${colorClassName || "text-muted-foreground"}`}>
                    {title}
                </div>
                <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${colorClassName || ""}`}>
                    {value}
                </div>
                {description && (
                    <div className="text-[10px] sm:text-xs text-muted-foreground text-center mt-1 font-medium italic opacity-70">
                        {description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
