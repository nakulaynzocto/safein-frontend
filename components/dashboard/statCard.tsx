"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

/**
 * StatCard component displays a single statistic with icon and optional trend
 * Optimized with React.memo to prevent unnecessary re-renders
 * Mobile-responsive: compact layout on small screens
 */
export const StatCard = memo(function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2 sm:p-4 sm:pb-2">
                <CardTitle className="truncate pr-2 text-xs font-medium sm:text-sm">{title}</CardTitle>
                <Icon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
                <div className="text-xl font-bold sm:text-2xl">{value}</div>
                {description && (
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-[10px] sm:text-xs">{description}</p>
                )}
                {trend && (
                    <div className="mt-2 flex flex-wrap items-center">
                        <span
                            className={`text-[10px] font-medium sm:text-xs ${
                                trend.isPositive ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {trend.isPositive ? "+" : ""}
                            {trend.value}%
                        </span>
                        <span className="text-muted-foreground ml-1 text-[10px] sm:text-xs">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
