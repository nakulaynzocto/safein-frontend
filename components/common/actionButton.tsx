import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends ButtonProps {
    // Add any specific props if needed
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({ className, variant = "outline-primary", size = "xl", ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn("bg-muted/30 font-medium", className)}
                {...props}
            />
        );
    }
);
ActionButton.displayName = "ActionButton";
