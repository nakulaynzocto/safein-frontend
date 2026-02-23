"use client";

import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ className, label, error, helperText, required = false, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-foreground text-sm font-medium">
                        {label}
                        {required && <span className="ml-1 text-red-500 font-bold">*</span>}
                    </label>
                )}
                <Textarea
                    className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-destructive text-sm">{error}</p>}
                {helperText && !error && <p className="text-muted-foreground text-sm">{helperText}</p>}
            </div>
        );
    },
);

TextareaField.displayName = "TextareaField";

export { TextareaField };
