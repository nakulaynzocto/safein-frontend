"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ErrorDisplayProps } from "@/utils/errorUtils";

/**
 * Reusable error display component
 */
export function ErrorDisplay({
    title,
    message,
    onRetry,
    retryLabel = "Retry",
    showReload = false,
}: ErrorDisplayProps) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 sm:h-6 sm:w-6" />
                <div className="flex-1">
                    <h3 className="mb-2 text-base font-semibold text-red-800 sm:text-lg">
                        {title}
                    </h3>
                    <p className="mb-4 whitespace-pre-line text-sm text-red-600 sm:text-base">
                        {message}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                        {onRetry && (
                            <Button
                                onClick={onRetry}
                                variant="destructive"
                                className="min-h-[40px] text-sm sm:text-base"
                            >
                                {retryLabel}
                            </Button>
                        )}
                        {showReload && (
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="min-h-[40px] text-sm sm:text-base"
                            >
                                Reload Page
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

