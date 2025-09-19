"use client"

import React, { type ReactNode } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./emptyState"
import { TableSkeleton } from "./tableSkeleton"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  className?: string
  sortable?: boolean
}

interface EmptyData {
  title: string
  description?: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
  route?: string
}

interface DataTableProps<T> {
  data: T[] | undefined | null
  columns: Column<T>[]
  className?: string
  emptyMessage?: string
  description?: string
  isLoading?: boolean
  emptyData?: EmptyData
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  showCard?: boolean
  skeletonRows?: number
  skeletonColumns?: number
  enableSorting?: boolean
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
    key: string | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  const handleSort = (key: string) => {
    if (!enableSorting) return
    
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Ensure data is an array, default to empty array if not
  const safeData = Array.isArray(data) ? data : []
  
  const sortedData = enableSorting && sortConfig.key 
    ? [...safeData].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T]
        const bValue = b[sortConfig.key as keyof T]
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    : safeData

  const getSortIcon = (columnKey: string, column: Column<T>) => {
    if (!enableSorting || !column.sortable) return null
    
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  // Show loading skeleton
  if (isLoading) {
    if (showCard) {
      return (
        <TableSkeleton 
          rows={skeletonRows} 
          columns={skeletonColumns || columns.length}
          showCard={true}
          className={className}
        />
      )
    } else {
      return (
        <TableSkeleton 
          rows={skeletonRows} 
          columns={skeletonColumns || columns.length}
          showCard={false}
          className={className}
        />
      )
    }
  }

  // Show empty state
  if (!Array.isArray(data) || data.length === 0) {
    const emptyStateProps = emptyData ? {
      title: emptyData.title,
      description: emptyData.description || description,
      primaryActionLabel: emptyData.primaryActionLabel,
      secondaryActionLabel: emptyData.secondaryActionLabel,
      onPrimaryAction: onPrimaryAction,
      onSecondaryAction: onSecondaryAction,
    } : {
      title: emptyMessage,
      description: description,
      primaryActionLabel: "Add new item",
      onPrimaryAction: onPrimaryAction,
    }

    return <EmptyState {...emptyStateProps} />
  }

  const TableContent = () => (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  "px-4 py-3 text-left text-sm font-medium text-foreground",
                  enableSorting && column.sortable && "cursor-pointer hover:bg-muted/70 transition-colors",
                  column.className
                )}
                onClick={() => enableSorting && column.sortable && handleSort(column.key as string)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {getSortIcon(column.key as string, column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border hover:bg-muted/30 transition-colors"
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn("px-4 py-3 text-sm text-foreground", column.className)}
                >
                  {(() => {
                    const renderSafeValue = (value: any): React.ReactNode => {
                      if (value === null || value === undefined) return ""
                      if (React.isValidElement(value)) return value
                      if (typeof value === 'object') {
                        // Handle objects by trying to find a meaningful string representation
                        if (Array.isArray(value)) {
                          return value.join(', ')
                        }
                        if (value.name) return String(value.name)
                        if (value.title) return String(value.title)
                        if (value.label) return String(value.label)
                        if (value.id) return String(value.id)
                        if (value._id) return String(value._id)
                        // Fallback to JSON if no meaningful property found
                        return "[Object]"
                      }
                      return String(value)
                    }

                    try {
                      if (column.render) {
                        const result = column.render(item)
                        return renderSafeValue(result)
                      } else {
                        const value = item[column.key as keyof T]
                        return renderSafeValue(value)
                      }
                    } catch (error) {
                      console.error('Error rendering table cell:', error, { column: column.key, item })
                      return "Error"
                    }
                  })()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (showCard) {
    return (
      <Card>
        <CardContent className="p-0">
          <TableContent />
        </CardContent>
      </Card>
    )
  }

  return <TableContent />
}