"use client"

import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { useGetAppointmentsQuery } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { DashboardHeader } from "./DashboardHeader"
import { StatsGrid } from "./StatsGrid"
import { AppointmentsTable } from "./AppointmentsTable"
import { QuickActions } from "./QuickActions"
import { calculateAppointmentStats, getRecentAppointments, getTodaysAppointments } from "./dashboard.utils"

export function DashboardOverview() {
  const router = useRouter()
  const { data: appointments = [], isLoading: appointmentsLoading } = useGetAppointmentsQuery()
  const { data: employees = [], isLoading: employeesLoading } = useGetEmployeesQuery()
  const { user } = useAppSelector((state) => state.auth)

  // Calculate statistics
  const stats = calculateAppointmentStats(appointments)
  const statsWithEmployees = {
    ...stats,
    totalEmployees: employees.length,
  }

  // Get filtered appointments
  const recentAppointments = getRecentAppointments(appointments, 5)
  const todaysAppointments = getTodaysAppointments(appointments)

  return (
    <div className="space-y-6">
      <DashboardHeader userName={user?.name} />

      {/* Statistics Cards */}
      <StatsGrid stats={statsWithEmployees} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <AppointmentsTable
          title="Today's Appointments"
          description="Appointments scheduled for today"
          data={todaysAppointments}
          isLoading={appointmentsLoading}
          emptyData={{
            title: "No appointments scheduled for today",
            description: "You don't have any appointments scheduled for today.",
            primaryActionLabel: "Schedule Appointment",
          }}
          onPrimaryAction={() => router.push("/appointment/create")}
        />

        {/* Recent Appointments */}
        <AppointmentsTable
          title="Recent Appointments"
          description="Latest appointment requests"
          data={recentAppointments}
          isLoading={appointmentsLoading}
          showDateTime={true}
          emptyData={{
            title: "No recent appointments",
            description: "You don't have any recent appointments.",
            primaryActionLabel: "View All Appointments",
          }}
          onPrimaryAction={() => router.push("/appointment/list")}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
