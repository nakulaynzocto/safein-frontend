import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
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
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
}
