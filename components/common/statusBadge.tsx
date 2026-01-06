"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  active: {
    label: "Active",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-emerald-500"
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-slate-500"
  },
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-amber-500"
  },
  approved: {
    label: "Approved",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-emerald-500"
  },
  rejected: {
    label: "Rejected",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-rose-500"
  },
  completed: {
    label: "Completed",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-blue-500"
  },
  time_out: {
    label: "Time Out",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-orange-500"
  },
  "checked-out": {
    label: "Checked Out",
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-stone-500"
  },
} as const

interface StatusBadgeProps {
  status: string
  className?: string
}

/**
 * StatusBadge component displays appointment status with dot indicator and pill shape
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const StatusBadge = memo(function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || "pending"
  const config = STATUS_CONFIG[normalizedStatus as keyof typeof STATUS_CONFIG] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
    dotColor: "bg-gray-500"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold",
        config.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  )
})
