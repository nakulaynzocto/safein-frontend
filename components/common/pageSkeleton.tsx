import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PageSkeletonProps {
    type?: "dashboard" | "table" | "form" | "generic";
    className?: string;
    showStats?: boolean;
}

export function PageSkeleton({ type = "generic", className, showStats = false }: PageSkeletonProps) {
    if (type === "table") {
        return (
            <div className={cn("animate-in fade-in space-y-6 duration-500", className)}>
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center px-1">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 sm:w-64" />
                        <Skeleton className="h-4 w-32 sm:w-48" />
                    </div>
                </div>

                {/* Optional Stats Grid */}
                {showStats && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4 px-1">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="border-border bg-muted/30 shadow-sm overflow-hidden">
                                <CardContent className="p-4 sm:p-6 flex items-start justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-8 w-10" />
                                        <Skeleton className="h-3 w-28" />
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Search & Actions Area */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-1">
                    <Skeleton className="h-12 w-full sm:max-w-[300px] rounded-xl" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 sm:w-40 rounded-xl" />
                        <Skeleton className="h-12 w-12 sm:w-40 rounded-xl" />
                    </div>
                </div>

                {/* Table Content */}
                <Card className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs mx-1">
                    <div className="border-b bg-muted/80 p-4">
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} className="h-4 flex-1" />
                            ))}
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex gap-4 border-b p-4 last:border-0 items-center">
                                {/* First col with avatar */}
                                <div className="flex-1 flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                    <div className="space-y-1 w-full">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                                {/* Other cols */}
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <Skeleton key={j} className="h-4 flex-1 hidden sm:block" />
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (type === "dashboard") {
        return (
            <div className={cn("animate-in fade-in space-y-4 sm:space-y-6 duration-500", className)}>
                {/* Charts Grid - Match Unified Dashboard */}
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-border shadow-sm overflow-hidden">
                            <CardHeader className="p-3 sm:p-4 md:p-6 pb-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                                <Skeleton className="h-3 w-60 mt-2" />
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                                <Skeleton className="h-[200px] w-full mt-2 sm:h-[250px] rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Appointments Table - Match actual table */}
                <div className="space-y-4">
                    <div className="px-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64 mt-1" />
                    </div>
                    <Card className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs mx-1">
                        <div className="border-b bg-muted/80 p-4">
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-4 flex-1" />
                                ))}
                            </div>
                        </div>
                        <CardContent className="p-0">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4 border-b p-4 last:border-0 items-center">
                                    <div className="flex-1 flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                                        <div className="space-y-1 w-full">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                    {[1, 2, 3, 4].map((j) => (
                                        <Skeleton key={j} className="h-4 flex-1 hidden sm:block" />
                                    ))}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mx-1">
                    <CardHeader className="p-3 sm:p-4 md:p-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-4 md:p-6">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl sm:h-20" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (type === "form") {
        return (
            <div className={cn("animate-in fade-in space-y-6 duration-500", className)}>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>

                <Card className="p-6">
                    <div className="grid gap-8 md:grid-cols-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <Skeleton className="h-11 w-32 rounded-xl" />
                        <Skeleton className="h-11 w-40 rounded-xl" />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("animate-in fade-in space-y-6 duration-500", className)}>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 sm:w-64" />
                    <Skeleton className="h-4 w-32 sm:w-48" />
                </div>
            </div>
            <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
    );
}

