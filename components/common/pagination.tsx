"use client";

import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
    className?: string;
}

// Shared constants for className strings
const PAGINATION_CLASSES = {
    baseLink:
        "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md transition-colors cursor-pointer",
    hoverEnabled: "hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#3882a5] hover:text-[#3882a5]",
    hoverDisabled: "opacity-50 cursor-not-allowed",
    activeLink:
        "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium !bg-[#3882a5] !border-[#3882a5] !text-white rounded-md hover:!bg-[#2d6a87] hover:!border-[#2d6a87] transition-colors cursor-pointer shadow-sm",
    activeLinkCompact:
        "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-white bg-[#3882a5] border border-[#3882a5] rounded-md hover:bg-[#2d6a87] hover:border-[#2d6a87] transition-colors cursor-pointer shadow-sm",
    breakLink:
        "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-500 dark:text-gray-400",
} as const;

// Shared helper functions
const getSafeValues = (currentPage: number, pageSize: number, totalItems: number) => {
    const safeCurrentPage = Number(currentPage) || 1;
    const safePageSize = Number(pageSize) || 10;
    const safeTotalItems = Number(totalItems) || 0;

    const startItem = Math.max(1, (safeCurrentPage - 1) * safePageSize + 1);
    const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems);

    return { safeCurrentPage, safePageSize, safeTotalItems, startItem, endItem };
};

const getPaginationConfig = (
    totalPages: number,
    safeCurrentPage: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
    pageRangeDisplayed: number = 3,
    useCompactActiveLink: boolean = false,
) => ({
    breakLabel: "...",
    nextLabel: <ChevronRight className="h-4 w-4" />,
    previousLabel: <ChevronLeft className="h-4 w-4" />,
    pageRangeDisplayed,
    marginPagesDisplayed: 1,
    pageCount: Number(totalPages) || 1,
    forcePage: safeCurrentPage - 1,
    disabledClassName: "opacity-50 cursor-not-allowed",
    containerClassName: "flex items-center gap-1 list-none",
    pageClassName: "mx-0.5",
    pageLinkClassName: PAGINATION_CLASSES.baseLink,
    previousClassName: "mx-0.5",
    previousLinkClassName: cn(
        PAGINATION_CLASSES.baseLink,
        hasPrevPage ? PAGINATION_CLASSES.hoverEnabled : PAGINATION_CLASSES.hoverDisabled,
    ),
    nextClassName: "mx-0.5",
    nextLinkClassName: cn(
        PAGINATION_CLASSES.baseLink,
        hasNextPage ? PAGINATION_CLASSES.hoverEnabled : PAGINATION_CLASSES.hoverDisabled,
    ),
    breakClassName: "mx-0.5",
    breakLinkClassName: PAGINATION_CLASSES.breakLink,
    activeClassName: "mx-0.5 selected",
    activeLinkClassName: useCompactActiveLink ? PAGINATION_CLASSES.activeLinkCompact : PAGINATION_CLASSES.activeLink,
});

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage,
    hasPrevPage,
    onPageChange,
    onPageSizeChange,
    showPageSizeSelector = false,
    pageSizeOptions = [10, 20, 50, 100],
    className = "",
}: PaginationProps) {
    const { safeCurrentPage, safeTotalItems, startItem, endItem } = getSafeValues(currentPage, pageSize, totalItems);

    const handlePageClick = (event: { selected: number }) => {
        onPageChange(event.selected + 1);
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={cn("flex flex-col items-center justify-between gap-4 sm:flex-row", className)}>
            {/* Items info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium">{startItem || 0}</span> to{" "}
                <span className="font-medium">{endItem || 0}</span> of{" "}
                <span className="font-medium">{safeTotalItems || 0}</span> items
            </div>

            <div className="flex items-center gap-4">
                {/* Page size selector (optional) */}
                {showPageSizeSelector && onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#3882a5] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* React Paginate */}
                <ReactPaginate
                    {...getPaginationConfig(totalPages, safeCurrentPage, hasNextPage, hasPrevPage)}
                    onPageChange={handlePageClick}
                />
            </div>
        </div>
    );
}

// Alternative compact version for smaller spaces
export function CompactPagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage,
    hasPrevPage,
    onPageChange,
    className = "",
}: Omit<PaginationProps, "onPageSizeChange" | "showPageSizeSelector" | "pageSizeOptions">) {
    const { safeCurrentPage, safeTotalItems, startItem, endItem } = getSafeValues(currentPage, pageSize, totalItems);

    const handlePageClick = (event: { selected: number }) => {
        onPageChange(event.selected + 1);
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={cn("flex flex-col items-center justify-between gap-4 sm:flex-row", className)}>
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{startItem || 0}</span>-
                <span className="font-medium">{endItem || 0}</span> of{" "}
                <span className="font-medium">{safeTotalItems || 0}</span>
            </div>
            <ReactPaginate
                {...getPaginationConfig(totalPages, safeCurrentPage, hasNextPage, hasPrevPage, 2, true)}
                onPageChange={handlePageClick}
            />
        </div>
    );
}
