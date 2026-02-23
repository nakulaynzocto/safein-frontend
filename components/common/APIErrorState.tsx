"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, ShieldAlert, Headset } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface APIErrorStateProps {
    title?: string;
    message?: string;
    description?: string;
    onRetry?: () => void;
    error?: any;
    className?: string;
}

export function APIErrorState({
    title,
    message,
    description,
    onRetry,
    error,
    className
}: APIErrorStateProps) {
    const [isRetrying, setIsRetrying] = useState(false);

    // Detect if it's a network/connection error
    const isNetworkError =
        error?.message?.toLowerCase().includes("fetch") ||
        error?.status === "FETCH_ERROR" ||
        error?.code === "ECONNREFUSED" ||
        !navigator.onLine;

    const handleRetry = () => {
        if (onRetry) {
            setIsRetrying(true);
            onRetry();
            // Reset loading state after a delay if it doesn't resolve immediately
            setTimeout(() => setIsRetrying(false), 2000);
        } else {
            window.location.reload();
        }
    };

    const displayTitle = title || (isNetworkError ? "Connection Lost" : "Server Error");
    const displayMessage = message || (isNetworkError
        ? "We're having trouble connecting to our servers. Please check your internet connection."
        : "Something went wrong while processing your request.");

    const displayDescription = description || (error?.data?.message || error?.message || "");

    return (
        <div className={cn(
            "flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500",
            className
        )}>
            <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-red-500/10 blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl shadow-red-500/10 border border-red-100">
                    {isNetworkError ? (
                        <WifiOff className="h-10 w-10 text-red-500" />
                    ) : (
                        <ServerCrash className="h-10 w-10 text-red-500" />
                    )}
                </div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-gray-900 tracking-tight">
                {displayTitle}
            </h3>

            <p className="max-w-md text-sm text-gray-500 mb-2">
                {displayMessage}
            </p>

            {displayDescription && (
                <div className="mb-6 rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
                    <code className="text-[10px] text-gray-400 font-mono">
                        {displayDescription}
                    </code>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    variant="primary"
                    size="xl"
                    className="relative min-w-[160px] shadow-lg shadow-[#3882a5]/20 group"
                >
                    <span className={cn(
                        "flex items-center gap-2 transition-all",
                        isRetrying ? "opacity-0" : "opacity-100"
                    )}>
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                        Try Again
                    </span>
                    {isRetrying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                        </div>
                    )}
                </Button>

                <Button
                    variant="primary"
                    size="xl"
                    onClick={() => window.location.href = '/help'}
                    className="min-w-[160px] shadow-lg shadow-[#3882a5]/20"
                >
                    <Headset className="h-4 w-4 mr-2" />
                    Contact Support
                </Button>
            </div>

            <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                System Status: <span className={cn(
                    "inline-block w-2 h-2 rounded-full ml-1",
                    isNetworkError ? "bg-red-400" : "bg-orange-400 animate-pulse"
                )} /> {isNetworkError ? "OFFLINE" : "UNSTABLE"}
            </p>
        </div>
    );
}
