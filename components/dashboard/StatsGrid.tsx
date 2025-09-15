"use client"

import { StatCard } from "./StatCard"
import { Calendar, Clock, Users } from "lucide-react"

interface StatsGridProps {
  stats: {
    totalAppointments: number
    pendingAppointments: number
    todayAppointments: number
    totalEmployees: number
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Appointments"
        value={stats.totalAppointments}
        description="All time appointments"
        icon={Calendar}
      />
      <StatCard
        title="Pending Approvals"
        value={stats.pendingAppointments}
        description="Awaiting approval"
        icon={Clock}
      />
      <StatCard
        title="Today's Appointments"
        value={stats.todayAppointments}
        description="Scheduled for today"
        icon={Calendar}
      />
      <StatCard
        title="Total Employees"
        value={stats.totalEmployees}
        description="Active employees"
        icon={Users}
      />
    </div>
  )
}
