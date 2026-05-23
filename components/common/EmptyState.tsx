import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    /** Shown above the primary action (e.g. mobile-only quick actions) */
    beforeAction?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    beforeAction,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-background/50 animate-in fade-in zoom-in-95 duration-300", className)}>
            {Icon && (
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted/50">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <h3 className="mb-2 text-lg font-semibold tracking-tight">
                {title}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                {description}
            </p>
            {beforeAction && (
                <div className="mb-4 w-full max-w-sm sm:hidden">{beforeAction}</div>
            )}
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
}
