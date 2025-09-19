"use client"

import { Calendar, CalendarCheck, CalendarX, CheckCircle, Users } from "lucide-react"
import { StatCard } from "./statCard"
import { AppointmentStats } from "./dashboardUtils"

interface StatsGridProps {
  stats: AppointmentStats & { totalEmployees: number }
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      description: "All time appointments",
    },
    {
      title: "Pending",
      value: stats.pendingAppointments,
      icon: CalendarCheck,
      description: "Awaiting approval",
    },
    {
      title: "Approved",
      value: stats.approvedAppointments,
      icon: CheckCircle,
      description: "Scheduled appointments",
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: CalendarX,
      description: "Finished appointments",
    },
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments,
      icon: Calendar,
      description: "Scheduled for today",
    },
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      description: "Active employees",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          description={card.description}
        />
      ))}
    </div>
  )
}
