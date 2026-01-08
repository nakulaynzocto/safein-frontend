"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
    showCard?: boolean;
    className?: string;
}

export function TableSkeleton({
    rows = 5,
    columns = 4,
    showHeader = true,
    showCard = true,
    className = "",
}: TableSkeletonProps) {
    const skeletonRows = Array.from({ length: rows }, (_, i) => i);
    const skeletonColumns = Array.from({ length: columns }, (_, i) => i);

    const TableContent = () => (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full border-collapse">
                {showHeader && (
                    <thead>
                        <tr className="border-border bg-muted/50 border-b">
                            {skeletonColumns.map((_, index) => (
                                <th key={index} className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {skeletonRows.map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-border border-b">
                            {skeletonColumns.map((_, colIndex) => (
                                <td key={colIndex} className="px-4 py-3">
                                    <Skeleton className="h-4 w-full max-w-[120px]" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (showCard) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <TableContent />
                </CardContent>
            </Card>
        );
    }

    return <TableContent />;
}

// Specialized skeleton components for different table types
export function EmployeeTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-border bg-muted/50 border-b">
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-24" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: rows }, (_, index) => (
                                <tr key={index} className="border-border border-b">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-28" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-16" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

export function AppointmentTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-border bg-muted/50 border-b">
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-24" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-24" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: rows }, (_, index) => (
                                <tr key={index} className="border-border border-b">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-32" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-28" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-24" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// Generic list skeleton for cards
export function ListSkeleton({ items = 3 }: { items?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: items }, (_, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Page skeleton for loading states
export function PageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
}

// Dashboard skeleton for initial loading
export function DashboardSkeleton() {
    return (
        <div className="animate-in fade-in space-y-6 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
                <TableSkeleton rows={5} columns={5} />
                <TableSkeleton rows={5} columns={5} />
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {Array.from({ length: 3 }, (_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
