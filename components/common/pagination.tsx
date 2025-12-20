"use client"

import ReactPaginate from "react-paginate"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  hasNextPage: boolean
  hasPrevPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  className?: string
}

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
  className = ""
}: PaginationProps) {
  const startItem = ((currentPage - 1) * pageSize) + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePageClick = (event: { selected: number }) => {
    onPageChange(event.selected + 1)
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .pagination-active-link {
        background-color: #3882a5 !important;
        border-color: #3882a5 !important;
        color: white !important;
      }
      .pagination-active-link:hover {
        background-color: #2d6a87 !important;
        border-color: #2d6a87 !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Items info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span> items
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector (optional) */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3882a5] focus:border-transparent"
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
          breakLabel="..."
          nextLabel={<ChevronRight className="h-4 w-4" />}
          previousLabel={<ChevronLeft className="h-4 w-4" />}
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          pageCount={totalPages}
          forcePage={currentPage - 1}
          disabledClassName="opacity-50 cursor-not-allowed"
          containerClassName="flex items-center gap-1 list-none"
          pageClassName="mx-0.5"
          pageLinkClassName="flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          previousClassName="mx-0.5"
          previousLinkClassName={cn(
            "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md transition-colors cursor-pointer",
            hasPrevPage 
              ? "hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#3882a5] hover:text-[#3882a5]" 
              : "opacity-50 cursor-not-allowed"
          )}
          nextClassName="mx-0.5"
          nextLinkClassName={cn(
            "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md transition-colors cursor-pointer",
            hasNextPage 
              ? "hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#3882a5] hover:text-[#3882a5]" 
              : "opacity-50 cursor-not-allowed"
          )}
          breakClassName="mx-0.5"
          breakLinkClassName="flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-500 dark:text-gray-400"
          activeClassName="mx-0.5 selected"
          activeLinkClassName="flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium rounded-md transition-colors cursor-pointer shadow-sm"
        />
      </div>
    </div>
  )
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
  className = ""
}: Omit<PaginationProps, 'onPageSizeChange' | 'showPageSizeSelector' | 'pageSizeOptions'>) {
  const startItem = ((currentPage - 1) * pageSize) + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePageClick = (event: { selected: number }) => {
    onPageChange(event.selected + 1)
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .pagination-active-link {
        background-color: #3882a5 !important;
        border-color: #3882a5 !important;
        color: white !important;
      }
      .pagination-active-link:hover {
        background-color: #2d6a87 !important;
        border-color: #2d6a87 !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{startItem}</span>-<span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span>
      </div>
      <ReactPaginate
        breakLabel="..."
        nextLabel={<ChevronRight className="h-4 w-4" />}
        previousLabel={<ChevronLeft className="h-4 w-4" />}
        onPageChange={handlePageClick}
        pageRangeDisplayed={2}
        marginPagesDisplayed={1}
        pageCount={totalPages}
        forcePage={currentPage - 1}
        disabledClassName="opacity-50 cursor-not-allowed"
        containerClassName="flex items-center gap-1 list-none"
        pageClassName="mx-0.5"
        pageLinkClassName="flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        previousClassName="mx-0.5"
        previousLinkClassName={cn(
          "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md transition-colors cursor-pointer",
          hasPrevPage 
            ? "hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#3882a5] hover:text-[#3882a5]" 
            : "opacity-50 cursor-not-allowed"
        )}
        nextClassName="mx-0.5"
        nextLinkClassName={cn(
          "flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md transition-colors cursor-pointer",
          hasNextPage 
            ? "hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#3882a5] hover:text-[#3882a5]" 
            : "opacity-50 cursor-not-allowed"
        )}
        breakClassName="mx-0.5"
        breakLinkClassName="flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-gray-500 dark:text-gray-400"
        activeClassName="mx-0.5 selected"
        activeLinkClassName="flex items-center justify-center min-w-[32px] h-8 px-2 text-sm font-medium text-white bg-[#3882a5] border border-[#3882a5] rounded-md hover:bg-[#2d6a87] hover:border-[#2d6a87] transition-colors cursor-pointer shadow-sm"
      />
    </div>
  )
}
