"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="flex items-center justify-between">
        {/* Left side: Title and Description */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Right side: Actions/children */}
        {children && <div className="flex items-center gap-2">{children}</div>}
      </CardContent>
    </Card>
  )
}
