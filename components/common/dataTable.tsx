"use client";

import { type ReactNode, useState, useMemo, useCallback, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { TableSkeleton } from "./tableSkeleton";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus } from "lucide-react";

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
    sortable?: boolean;
    sticky?: 'left' | 'right';
}

interface EmptyData {
    title: string;
    description?: string;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    route?: string;
    icon?: any;
    onPrimaryAction?: () => void;
}

interface DataTableProps<T> {
    data: T[] | undefined | null;
    columns: Column<T>[];
    className?: string;
    emptyMessage?: string;
    description?: string;
    isLoading?: boolean;
    emptyData?: EmptyData;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
    showCard?: boolean;
    skeletonRows?: number;
    skeletonColumns?: number;
    enableSorting?: boolean;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    className,
    emptyMessage = "No data available",
    description = "",
    isLoading = false,
    emptyData,
    onPrimaryAction,
    onSecondaryAction,
    showCard = true,
    skeletonRows = 10,
    skeletonColumns,
    enableSorting = false,
    minHeight = "650px",
    minWidth = "100%",
}: DataTableProps<T> & { minHeight?: string; minWidth?: string }) {
    const [sortConfig, setSortConfig] = useState<{
        key: string | null;
        direction: "asc" | "desc";
    }>({ key: null, direction: "asc" });

    const handleSort = useCallback(
        (key: string) => {
            if (!enableSorting) return;

            setSortConfig((prev) => ({
                key,
                direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
            }));
        },
        [enableSorting],
    );

    const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const sortedData = useMemo(() => {
        if (!enableSorting || !sortConfig.key) return safeData;

        return [...safeData].sort((a, b) => {
            const aValue = a[sortConfig.key as keyof T];
            const bValue = b[sortConfig.key as keyof T];

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [safeData, enableSorting, sortConfig]);

    const getSortIcon = useCallback(
        (columnKey: string, column: Column<T>) => {
            if (!enableSorting || !column.sortable) return null;

            if (sortConfig.key !== columnKey) {
                return <ArrowUpDown className="h-4 w-4 opacity-50" />;
            }

            return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
        },
        [enableSorting, sortConfig],
    );

    if (isLoading) {
        if (showCard) {
            return (
                <TableSkeleton
                    rows={skeletonRows}
                    columns={skeletonColumns || columns.length}
                    showCard={true}
                    className={className}
                />
            );
        } else {
            return (
                <TableSkeleton
                    rows={skeletonRows}
                    columns={skeletonColumns || columns.length}
                    showCard={false}
                    className={className}
                />
            );
        }
    }

    if (!Array.isArray(data) || data.length === 0) {
        const action = (emptyData?.primaryActionLabel || onPrimaryAction) ? (
            <Button
                onClick={emptyData?.onPrimaryAction || onPrimaryAction}
                variant="default"
                className="bg-[#3882a5] hover:bg-[#2d6a87] text-white"
            >
                <Plus className="mr-2 h-4 w-4" />
                {emptyData?.primaryActionLabel || "Add new item"}
            </Button>
        ) : null;

        return (
            <EmptyState
                title={emptyData?.title || emptyMessage}
                description={emptyData?.description || description}
                action={action}
                icon={emptyData?.icon}
            />
        );
    }

    const tableContent = (
        <div
            className={cn("-mx-1 sm:mx-0", className)}
            style={{
                overflowX: "auto",
                overflowY: "visible",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                userSelect: "none",
                WebkitUserSelect: "none",
                minHeight: minHeight
            }}
        >
            <table
                className="w-full text-left text-sm"
                style={{
                    userSelect: "none",
                    minWidth: minWidth
                }}
            >
                <thead className="bg-muted/80 border-border text-muted-foreground border-b text-[10px] font-bold tracking-wider uppercase">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={column.key as string || index}
                                className={cn(
                                    "px-6 py-4 font-bold",
                                    enableSorting &&
                                    column.sortable &&
                                    "hover:bg-muted/70 cursor-pointer transition-colors",
                                    column.sticky === 'right' && "md:sticky md:right-0 md:z-10 md:!bg-muted/80 md:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]",
                                    column.sticky === 'left' && "md:sticky md:left-0 md:z-10 md:!bg-muted/80 md:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]",
                                    column.className,
                                )}
                                onClick={() => enableSorting && column.sortable && handleSort(column.key as string)}
                            >
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <span className="truncate">{column.header}</span>
                                    {getSortIcon(column.key as string, column)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sortedData.map((item, rowIndex) => {
                        const rowKey = item._id || item.id || rowIndex;
                        return (
                            <tr key={rowKey} className="border-border hover:bg-muted/30 border-b transition-colors group">
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={column.key as string || colIndex}
                                        className={cn(
                                            "text-foreground px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm",
                                            column.sticky === 'right' && "md:sticky md:right-0 md:z-10 !bg-white md:group-hover:!bg-muted/30 dark:!bg-gray-950 md:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)]",
                                            column.sticky === 'left' && "md:sticky md:left-0 md:z-10 !bg-white md:group-hover:!bg-muted/30 dark:!bg-gray-950 md:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]",
                                            column.className,
                                        )}
                                    >
                                        {(() => {
                                            const renderSafeValue = (value: any): ReactNode => {
                                                if (value === null || value === undefined) return "";
                                                if (isValidElement(value)) return value;
                                                if (typeof value === "object") {
                                                    if (Array.isArray(value)) {
                                                        return value.join(", ");
                                                    }
                                                    if (value.name) return String(value.name);
                                                    if (value.title) return String(value.title);
                                                    if (value.label) return String(value.label);
                                                    if (value.id) return String(value.id);
                                                    if (value._id) return String(value._id);
                                                    return "[Object]";
                                                }
                                                return String(value);
                                            };

                                            try {
                                                if (column.render) {
                                                    const result = column.render(item);
                                                    return renderSafeValue(result);
                                                } else {
                                                    const value = item[column.key as keyof T];
                                                    return renderSafeValue(value);
                                                }
                                            } catch (error) {
                                                return "Error";
                                            }
                                        })()}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    if (showCard) {
        return (
            <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                <CardContent className="p-0">
                    {tableContent}
                </CardContent>
            </div>
        );
    }

    return (
        <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
            {tableContent}
        </div>
    );
}
