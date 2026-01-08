import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
    return (
        <div className="animate-in fade-in space-y-6 duration-500">
            {/* Page Header Skeleton */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 sm:w-64" />
                    <Skeleton className="h-4 w-32 sm:w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Stats/Cards Grid Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl sm:h-32" />
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left/Main Column */}
                <div className="space-y-6 lg:col-span-2">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                    </div>
                </div>

                {/* Right Column / Sidebar */}
                <div className="space-y-6">
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
