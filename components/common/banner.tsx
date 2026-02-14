"use client";

import React from "react";

interface BannerProps {
    show: boolean;
    variant?: "warning" | "error" | "info" | "success";
    message: React.ReactNode;
    action?: React.ReactNode;
}

export function Banner({ show, variant = "warning", message, action }: BannerProps) {
    if (!show) return null;

    const variants = {
        warning: "bg-amber-500/90",
        error: "bg-red-600/95",
        info: "bg-blue-500/90",
        success: "bg-emerald-500/90",
    };

    return (
        <div className={`w-full ${variants[variant]} px-4 py-3 text-center text-xs text-white shadow-md backdrop-blur-sm sm:text-sm transition-colors duration-300`}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <span className="font-medium flex items-center gap-2">
                    <span>{variant === "error" || variant === "warning" ? "⚠️" : "🔔"}</span>
                    {message}
                </span>
                {action && (
                    <div className="flex items-center gap-4">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}
