"use client"

import { memo, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GlobeIcon } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  className?: string
}

/**
 * EmptyState component displays an empty state message with optional action
 * Optimized with React.memo to prevent unnecessary re-renders
 * Mobile-responsive with adjusted padding and sizing
 */
export const EmptyState = memo(function EmptyState({
  title,
  description = "",
  icon,
  primaryActionLabel,
  onPrimaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center text-center p-6 sm:p-10 space-y-3 sm:space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted">
          {icon || <GlobeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md px-2">{description}</p>
        )}

        {/* Primary Action */}
        {primaryActionLabel && (
          <Button onClick={onPrimaryAction} className="text-xs sm:text-sm w-full sm:w-auto">
            {primaryActionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
})
