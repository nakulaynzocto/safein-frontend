"use client";

import { type ReactNode, useState, useMemo, useCallback, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./emptyState";
import { TableSkeleton } from "./tableSkeleton";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
    sortable?: boolean;
}

interface EmptyData {
    title: string;
    description?: string;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    route?: string;
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
    skeletonRows = 5,
    skeletonColumns,
    enableSorting = false,
}: DataTableProps<T>) {
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
        const emptyStateProps = emptyData
            ? {
                  title: emptyData.title,
                  description: emptyData.description || description,
                  primaryActionLabel: emptyData.primaryActionLabel,
                  secondaryActionLabel: emptyData.secondaryActionLabel,
                  onPrimaryAction: onPrimaryAction,
                  onSecondaryAction: onSecondaryAction,
              }
            : {
                  title: emptyMessage,
                  description: description,
                  primaryActionLabel: "Add new item",
                  onPrimaryAction: onPrimaryAction,
              };

        return <EmptyState {...emptyStateProps} />;
    }

    const TableContent = () => (
        <div className={cn("-mx-1 overflow-x-auto sm:mx-0", className)}>
            <table className="w-full text-left text-sm">
                <thead className="bg-muted/80 border-border text-muted-foreground border-b text-[10px] font-bold tracking-wider uppercase">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={cn(
                                    "px-6 py-4 font-bold",
                                    enableSorting &&
                                        column.sortable &&
                                        "hover:bg-muted/70 cursor-pointer transition-colors",
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
                    {sortedData.map((item, rowIndex) => (
                        <tr key={rowIndex} className="border-border hover:bg-muted/30 border-b transition-colors">
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={cn(
                                        "text-foreground px-2 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm",
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
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (showCard) {
        return (
            <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
                <CardContent className="p-0">
                    <TableContent />
                </CardContent>
            </div>
        );
    }

    return (
        <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
            <TableContent />
        </div>
    );
}
