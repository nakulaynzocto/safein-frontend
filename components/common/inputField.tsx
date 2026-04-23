"use client";

import type React from "react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    icon?: React.ReactNode;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ className, label, error, helperText, required = false, type = "text", autoComplete = "off", icon, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordField = type === "password";
        const inputType = isPasswordField && showPassword ? "text" : type;

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
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-[#3882a5] transition-colors duration-300">
                            {icon}
                        </div>
                    )}
                    <input
                        type={inputType}
                        autoComplete={autoComplete}
                        className={cn(
                            "flex h-12 w-full px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm",
                            "bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700",
                            "placeholder:text-slate-400/60 dark:placeholder:text-slate-600",
                            "focus:bg-white dark:focus:bg-slate-950 focus:border-[#3882a5] focus:ring-4 focus:ring-[#3882a5]/5 focus:outline-none",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            icon && "pl-11",
                            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/5",
                            isPasswordField && "pr-11",
                            className
                        )}
                        ref={ref}
                        {...props}
                        onFocus={(e) => {
                            if (type === "number" && e.target.value === "0") {
                                e.target.select();
                            }
                            props.onFocus?.(e);
                        }}
                    />
                    {isPasswordField && (
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-[#3882a5] transition-colors duration-300"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-rose-600 dark:text-rose-400 text-[11px] font-medium mt-1 animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-muted-foreground/80 text-[11px] leading-relaxed mt-1">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

InputField.displayName = "InputField";

export { InputField };
