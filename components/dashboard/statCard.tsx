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
    return (
        <Card
            onClick={onClick}
            className={`
                border shadow-sm transition-all duration-200 
                ${bgClassName || "bg-card"} 
                ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]" : ""}
            `}
        >
            <CardContent className="flex flex-col items-center justify-center py-1 px-2">
                <div className={`text-[10px] font-bold uppercase tracking-wider text-center ${colorClassName || "text-muted-foreground"}`}>
                    {title}
                </div>
                <div className={`text-lg font-bold tracking-tight sm:text-xl leading-none ${colorClassName || ""}`}>
                    {value}
                </div>
            </CardContent>
        </Card>
    );
});
