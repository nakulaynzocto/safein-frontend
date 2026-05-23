"use client";

import { ReactNode } from "react";
import { LoadingSpinner } from "./loadingSpinner";
import { cn } from "@/lib/utils";

interface FormContainerProps {
    children: ReactNode;
    isPage?: boolean;
    isLoading?: boolean;
    isEditMode?: boolean;
    className?: string;
}

export function FormContainer({ 
    children, 
    isPage = false, 
    isLoading = false, 
    isEditMode = false,
    className 
}: FormContainerProps) {
    const containerContent = (
        <div
            className={cn(
                isPage ? "bg-card rounded-xl border px-3 py-4 shadow-sm sm:px-5 sm:py-5" : "",
                className
            )}
        >
            {isEditMode && isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className={isPage ? "" : "max-h-[calc(65vh-40px)] overflow-y-auto overflow-x-hidden pr-2 pb-4 scroll-smooth overscroll-contain [-webkit-overflow-scrolling:touch]"}>
                    {children}
                    {/* Simple footer strip for mobile */}
                    {!isPage && (
                        <div className="mt-6 pt-4 border-t border-border/50">
                            <div className="h-2 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-full"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (isPage) {
        return <div className="w-full">{containerContent}</div>;
    }

    return containerContent;
}
