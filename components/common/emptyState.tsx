"use client"

import { ReactNode } from "react"
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

export function EmptyState({
  title,
  description = "",
  icon,
  primaryActionLabel,
  onPrimaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center text-center p-10 space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          {icon || <GlobeIcon className="w-8 h-8 text-primary" />}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        )}

        {/* Primary Action */}
        {primaryActionLabel && (
          <Button onClick={onPrimaryAction}>{primaryActionLabel}</Button>
        )}
      </CardContent>
    </Card>
  )
}
