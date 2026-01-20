"use client";

import { memo, type ReactNode } from "react";
import { ActionButton } from "@/components/common/actionButton";
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
        <div className={`flex flex-col items-center justify-center h-64 bg-accent/50 rounded-xl border border-dashed border-border ${className || ""}`}>
            {/* Icon */}
            <div className="bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full mb-4 sm:h-16 sm:w-16">
                {icon || <GlobeIcon className="text-muted-foreground h-6 w-6 sm:h-8 sm:w-8" />}
            </div>

            {/* Title */}
            <h3 className="text-foreground text-lg font-medium sm:text-xl">{title}</h3>

            {/* Description */}
            {description && <p className="text-muted-foreground max-w-md px-2 text-sm mt-1">{description}</p>}

            {/* Primary Action */}
            {primaryActionLabel && (
                <ActionButton onClick={onPrimaryAction} size="default" className="mt-4">
                    {primaryActionLabel}
                </ActionButton>
            )}
        </div>
    );
});
