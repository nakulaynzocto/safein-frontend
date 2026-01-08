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
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6">
                {/* Left side: Title and Description */}
                <div className="flex min-w-0 flex-col">
                    <h2 className="text-foreground truncate text-xl font-semibold sm:text-2xl">{title}</h2>
                    {description && (
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs sm:text-sm">{description}</p>
                    )}
                </div>

                {/* Right side: Actions/children */}
                {children && <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">{children}</div>}
            </CardContent>
        </Card>
    );
});
