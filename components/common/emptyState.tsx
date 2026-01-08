"use client";

import { memo, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlobeIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    className?: string;
}

/**
 * EmptyState component displays an empty state message with optional action
 * Optimized with React.memo to prevent unnecessary re-renders
 * Mobile-responsive with adjusted padding and sizing
 */
export const EmptyState = memo(function EmptyState({
    title,
    description = "",
    icon,
    primaryActionLabel,
    onPrimaryAction,
    className,
}: EmptyStateProps) {
    return (
        <Card className={className}>
            <CardContent className="flex flex-col items-center justify-center space-y-3 p-6 text-center sm:space-y-4 sm:p-10">
                {/* Icon */}
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full sm:h-16 sm:w-16">
                    {icon || <GlobeIcon className="text-primary h-6 w-6 sm:h-8 sm:w-8" />}
                </div>

                {/* Title */}
                <h2 className="text-foreground text-lg font-semibold sm:text-xl">{title}</h2>

                {/* Description */}
                {description && <p className="text-muted-foreground max-w-md px-2 text-xs sm:text-sm">{description}</p>}

                {/* Primary Action */}
                {primaryActionLabel && (
                    <Button onClick={onPrimaryAction} className="w-full text-xs sm:w-auto sm:text-sm">
                        {primaryActionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
});
