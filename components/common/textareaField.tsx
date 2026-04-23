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
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] text-muted-foreground uppercase font-bold tracking-[0.1em]">
                            {label}
                            {required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        {!required && !error && (
                            <span className="text-[9px] text-muted-foreground/60 uppercase font-medium tracking-wider">Optional</span>
                        )}
                    </div>
                )}
                <Textarea
                    className={cn(
                        "rounded-xl transition-all duration-300 font-medium text-sm",
                        "bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800",
                        "hover:border-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-[#3882a5] focus-visible:ring-4 focus-visible:ring-[#3882a5]/5 focus:outline-none",
                        error && "border-rose-500 focus-visible:ring-rose-500/5",
                        className
                    )}
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
