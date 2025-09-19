"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./emptyState"
import { TableSkeleton } from "./tableSkeleton"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  className?: string
  mobileLabel?: string
}

interface EmptyData {
  title: string
  description?: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
}

interface MobileDataTableProps<T> {
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
}

export function MobileDataTable<T extends Record<string, any>>({
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
}: MobileDataTableProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Show loading skeleton
  if (isLoading) {
    if (showCard) {
      return (
        <TableSkeleton 
          rows={skeletonRows} 
          columns={2}
          showCard={true}
          className={className}
        />
      )
    } else {
      return (
        <TableSkeleton 
          rows={skeletonRows} 
          columns={2}
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

  const MobileCardContent = () => (
    <div className={cn("space-y-3", className)}>
      {(Array.isArray(data) ? data : []).map((item, index) => {
        const isExpanded = expandedItems.has(index)
        const primaryColumns = columns.slice(0, 2) // Show first 2 columns in collapsed view
        const remainingColumns = columns.slice(2) // Show remaining columns when expanded

        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Primary Info - Always Visible */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {primaryColumns.map((column, colIndex) => (
                    <div key={colIndex} className="mb-2 last:mb-0">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {column.mobileLabel || column.header}
                      </div>
                      <div className="text-sm font-medium text-foreground truncate">
                        {column.render ? column.render(item) : String(item[column.key as keyof T] || "")}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Expand/Collapse Button */}
                {remainingColumns.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(index)}
                    className="ml-4 h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Expanded Info */}
              {isExpanded && remainingColumns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {remainingColumns.map((column, colIndex) => (
                    <div key={colIndex}>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        {column.mobileLabel || column.header}
                      </div>
                      <div className={cn("text-sm", column.className)}>
                        {column.render ? column.render(item) : String(item[column.key as keyof T] || "")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  if (showCard) {
    return (
      <Card>
        <CardContent className="p-0">
          <MobileCardContent />
        </CardContent>
      </Card>
    )
  }

  return <MobileCardContent />
}

