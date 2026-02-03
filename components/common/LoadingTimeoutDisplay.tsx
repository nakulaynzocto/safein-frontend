"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface LoadingTimeoutDisplayProps {
    onRetry: () => void;
}

/**
 * Reusable loading timeout display component
 */
export function LoadingTimeoutDisplay({ onRetry }: LoadingTimeoutDisplayProps) {
    return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 sm:p-6">
            <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 flex-shrink-0 text-yellow-600 sm:h-6 sm:w-6" />
                <div className="flex-1">
                    <h3 className="mb-2 text-base font-semibold text-yellow-800 sm:text-lg">
                        Loading is taking longer than expected
                    </h3>
                    <p className="mb-4 text-sm text-yellow-600 sm:text-base">
                        The dashboard is taking longer to load than usual. This may be due to network issues or server
                        response delays.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                        <Button
                            onClick={onRetry}
                            className="min-h-[40px] bg-yellow-600 text-sm text-white hover:bg-yellow-700 sm:text-base"
                        >
                            Retry
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="min-h-[40px] bg-yellow-700 text-sm text-white hover:bg-yellow-800 sm:text-base"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

