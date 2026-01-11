"use client";

import type React from "react";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ className, label, error, helperText, required = false, type = "text", autoComplete = "off", ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordField = type === "password";
        const inputType = isPasswordField && showPassword ? "text" : type;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="text-foreground text-sm font-medium">
                        {label}
                        {required && <span className="ml-1 text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        type={inputType}
                        autoComplete={autoComplete}
                        className={cn(
                            "border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:ring-ring flex h-12 w-full rounded-xl border px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-destructive focus:ring-destructive",
                            isPasswordField && "pr-10",
                            className,
                        )}
                        ref={ref}
                        {...props}
                    />
                    {isPasswordField && (
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    )}
                </div>
                {error && <p className="text-destructive text-xs">{error}</p>}
                {helperText && !error && <p className="text-muted-foreground text-xs">{helperText}</p>}
            </div>
        );
    },
);

InputField.displayName = "InputField";

export { InputField };
