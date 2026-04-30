import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
    fields?: number;
    showTextarea?: boolean;
}

export function FormSkeleton({ fields = 4, showTextarea = true }: FormSkeletonProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>
            {showTextarea && <Skeleton className="h-32 w-full rounded-lg" />}
            <div className="flex justify-end pt-4">
                <Skeleton className="h-11 w-40 rounded-xl" />
            </div>
        </div>
    );
}
