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
        <div className={cn("flex w-full items-center justify-center md:justify-between py-1", className)}>
            {/* Items info - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Showing <span className="font-medium">{startItem || 0}</span> to{" "}
                <span className="font-medium">{endItem || 0}</span> of{" "}
                <span className="font-medium">{safeTotalItems || 0}</span> items
            </div>

            <div className="flex flex-row items-center gap-4 max-w-full overflow-x-auto">
                {/* React Paginate - Always visible */}
                <div className="shrink-0 max-w-full overflow-x-auto">
                    <ReactPaginate
                        {...getPaginationConfig(totalPages, safeCurrentPage, hasNextPage, hasPrevPage)}
                        onPageChange={handlePageClick}
                    />
                </div>
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
        <div className={cn("flex w-full flex-col sm:flex-row items-center justify-between gap-3", className)}>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap shrink-0">
                <span className="font-medium">{startItem || 0}</span>-
                <span className="font-medium">{endItem || 0}</span> of{" "}
                <span className="font-medium">{safeTotalItems || 0}</span>
            </div>
            <div className="shrink-0 max-w-full overflow-x-auto pb-1 sm:pb-0">
                <ReactPaginate
                    {...getPaginationConfig(totalPages, safeCurrentPage, hasNextPage, hasPrevPage, 2, true)}
                    onPageChange={handlePageClick}
                />
            </div>
        </div>
    );
}
