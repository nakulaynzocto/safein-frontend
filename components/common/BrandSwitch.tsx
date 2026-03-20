"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandSwitchProps {
    checked: boolean;
    onCheckedChange: () => void;
    variant?: "default" | "large";
    className?: string;
}

export function BrandSwitch({ 
    checked, 
    onCheckedChange, 
    variant = "default",
    className
}: BrandSwitchProps) {
    return (
        <button
            onClick={onCheckedChange}
            type="button"
            className={cn(
                "relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none",
                variant === "large" ? "h-7 w-12" : "h-5 w-9",
                checked ? "bg-[#3882a5]" : "bg-gray-200 dark:bg-gray-700",
                className
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    variant === "large" 
                        ? (checked ? "translate-x-5 h-6 w-6" : "translate-x-0 h-6 w-6") 
                        : (checked ? "translate-x-4 h-4 w-4" : "translate-x-0 h-4 w-4")
                )}
            />
        </button>
    );
}
