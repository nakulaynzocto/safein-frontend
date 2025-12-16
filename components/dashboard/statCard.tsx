"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

/**
 * StatCard component displays a single statistic with icon and optional trend
 * Optimized with React.memo to prevent unnecessary re-renders
 * Mobile-responsive: compact layout on small screens
 */
export const StatCard = memo(function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2 flex-wrap">
            <span
              className={`text-[10px] sm:text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
