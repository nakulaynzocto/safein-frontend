import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps extends ButtonProps {
    icon?: LucideIcon;
    label?: string;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({ icon: Icon, label, className, children, variant = "outline-primary", size = "default", ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                className={cn("gap-2", className)}
                {...props}
            >
                {Icon && <Icon className="w-4 h-4" />}
                {label || children}
            </Button>
        );
    }
);
ActionButton.displayName = "ActionButton";
