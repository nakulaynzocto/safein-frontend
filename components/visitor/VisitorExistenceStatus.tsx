"use client";

import React from "react";
import { User, ShieldCheck, UserPlus } from "lucide-react";
import { LoadingSpinner } from "@/components/common/loadingSpinner";

interface VisitorExistenceStatusProps {
    isLoading: boolean;
    exists: boolean | null;
    foundVisitor?: any;
}

/**
 * Component to display the existence status of a visitor (Registered vs New).
 */
export function VisitorExistenceStatus({
    isLoading,
    exists,
    foundVisitor
}: VisitorExistenceStatusProps) {
    if (isLoading) {
        return <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <LoadingSpinner size="sm" className="h-3 w-3" /> Checking visitor profile...
        </p>;
    }

    if (exists === null) return null;

    return (
        <div className="flex items-center gap-2 text-xs font-medium mt-1 animate-in fade-in slide-in-from-top-1">
            {exists ? (
                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Registered Visitor {foundVisitor?.name ? `: ${foundVisitor.name}` : ""}
                </span>
            ) : (
                <span className="flex items-center gap-1 text-[#3882a5] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    <UserPlus className="h-3.5 w-3.5" />
                    New Visitor
                </span>
            )}
        </div>
    );
}
