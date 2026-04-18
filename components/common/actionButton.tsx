import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, Loader2 } from "lucide-react";

interface ActionButtonProps extends ButtonProps {
    icon?: LucideIcon;
    label?: string;
    isLoading?: boolean;
    /** Shown while loading; defaults to "Processing..." */
    loadingLabel?: string;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    (
        {
            icon: Icon,
            label,
            className,
            children,
            variant = "outline-primary",
            size = "default",
            isLoading,
            loadingLabel,
            disabled,
            ...props
        },
        ref
    ) => {
        const loadingText = loadingLabel ?? "Processing...";
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                disabled={disabled || isLoading}
                className={cn("gap-2", className)}
                {...props}
            >
                <span className="flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        Icon && <Icon className="w-4 h-4" />
                    )}
                    {isLoading ? loadingText : label || children}
                </span>
            </Button>
        );
    }
);
ActionButton.displayName = "ActionButton";
