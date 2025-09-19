"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected" | "completed" | "checked-out" | "active" | "inactive" | "scheduled"
  className?: string
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  "checked-out": {
    label: "Checked Out",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
