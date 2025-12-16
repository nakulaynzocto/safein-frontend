"use client"

import { memo, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

/**
 * PageHeader component displays page title and description with optional actions
 * Optimized with React.memo to prevent unnecessary re-renders
 * Mobile-responsive: stacks vertically on small screens
 */
export const PageHeader = memo(function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6">
        {/* Left side: Title and Description */}
        <div className="flex flex-col min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground truncate">{title}</h2>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        {/* Right side: Actions/children */}
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
})
