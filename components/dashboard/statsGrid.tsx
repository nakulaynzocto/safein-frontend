"use client"

import { Calendar, CalendarCheck, CalendarX, CheckCircle } from "lucide-react"
import { StatCard } from "./statCard"
import { AppointmentStats } from "./dashboardUtils"

interface StatsGridProps {
  stats: AppointmentStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
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
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
