"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ErrorDisplayProps {
    title?: string;
    message?: string;
    description?: string;
    onRetry?: () => void;
    retryLabel?: string;
    showReload?: boolean;
    className?: string;
}

/**
 * Reusable premium error display component
 */
export function ErrorDisplay({
    title = "Something went wrong",
    message,
    description,
    onRetry,
    retryLabel = "Try Again",
    showReload = false,
    className,
}: ErrorDisplayProps) {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = () => {
        if (onRetry) {
            setIsRetrying(true);
            onRetry();
            setTimeout(() => setIsRetrying(false), 2000);
        } else if (showReload) {
            window.location.reload();
        }
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500 rounded-2xl bg-white border border-red-100 shadow-xl shadow-red-500/5",
            className
        )}>
            <div className="relative mb-6">
                <div className="absolute -inset-2 rounded-full bg-red-500/10 blur-lg animate-pulse" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 shadow-inner border border-red-100">
                    <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
            </div>

            <h3 className="mb-2 text-lg font-bold text-gray-900 tracking-tight">
                {title}
            </h3>

            {message && (
                <p className="max-w-md text-sm text-gray-500 mb-4 whitespace-pre-line">
                    {message}
                </p>
            )}

            {description && (
                <div className="mb-6 rounded-lg bg-gray-50 px-3 py-2 border border-gray-100 max-w-full overflow-hidden">
                    <code className="text-[10px] text-gray-400 font-mono break-all whitespace-pre-wrap">
                        {description}
                    </code>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                {(onRetry || showReload) && (
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        variant="primary"
                        size="xl"
                        className="relative min-w-[160px] w-full sm:w-auto shadow-lg shadow-[#3882a5]/20 group"
                    >
                        <span className={cn(
                            "flex items-center justify-center gap-2 transition-all",
                            isRetrying ? "opacity-0" : "opacity-100"
                        )}>
                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                            {retryLabel}
                        </span>
                        {isRetrying && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            </div>
                        )}
                    </Button>
                )}

                {showReload && onRetry && (
                    <Button
                        variant="primary"
                        size="xl"
                        onClick={() => window.location.reload()}
                        className="min-w-[160px] w-full sm:w-auto shadow-lg shadow-[#3882a5]/20"
                    >
                        Reload Page
                    </Button>
                )}
            </div>
        </div>
    );
}
