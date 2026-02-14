"use client";

import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode;
    className?: string;
}

/**
 * PageHeader component displays page title and description with optional actions
 * Optimized with React.memo to prevent unnecessary re-renders
 * Mobile-responsive: stacks vertically on small screens
 */
export const PageHeader = memo(function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <Card className={cn("w-full", className)}>
            <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4 md:p-6">
                {/* Left side: Title and Description */}
                <div className="flex min-w-0 flex-col">
                    <h2 className="text-foreground text-lg font-bold sm:text-xl md:text-2xl break-words">{title}</h2>
                    {description && (
                        <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm break-words">{description}</p>
                    )}
                </div>

                {/* Right side: Actions/children */}
                {children && <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">{children}</div>}
            </CardContent>
        </Card>
    );
});
