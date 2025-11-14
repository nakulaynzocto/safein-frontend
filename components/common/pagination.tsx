"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

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

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, currentPage + 2)
      
      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('...')
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Items info */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector (optional) */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-muted-foreground">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border rounded-md bg-background"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={!hasPrevPage}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <div className="h-8 w-8 flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-muted-foreground">
        {startItem}-{endItem} of {totalItems}
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={!hasPrevPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
