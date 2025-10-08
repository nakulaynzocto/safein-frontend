"use client"

import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { useGetAppointmentsQuery } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { routes } from "@/utils/routes"
import { DashboardHeader } from "./dashboardHeader"
import { StatsGrid } from "./statsGrid"
import { AppointmentsTable } from "./AppointmentsTable"
import { QuickActions } from "./quickActions"
import { DashboardCharts } from "./dashboardCharts"
import { calculateAppointmentStats, getRecentAppointments, getTodaysAppointments } from "./dashboardUtils"

export function DashboardOverview() {
  const router = useRouter()
  
  // Use optimized queries with caching
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointmentsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployeesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  
  const { user } = useAppSelector((state) => state.auth)

  // Extract appointments array from the API response
  const appointments = appointmentsData?.appointments || []
  const employees = employeesData?.employees || []

  // Calculate statistics
  const stats = calculateAppointmentStats(appointments)

  // Get filtered appointments
  const recentAppointments = getRecentAppointments(appointments, 5)
  const todaysAppointments = getTodaysAppointments(appointments)

  return (
    <div className="space-y-6">
      <DashboardHeader userName={user?.name} />

      {/* Statistics Cards */}
      <StatsGrid stats={stats} />

      {/* Image-Type Charts */}
      <DashboardCharts 
        appointmentsData={appointments}
        employeesData={employees}
        visitorsData={[]} // Add visitor data when available
      />

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
          onPrimaryAction={() => router.push(routes.privateroute.APPOINTMENTCREATE)}
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
          onPrimaryAction={() => router.push(routes.privateroute.APPOINTMENTLIST)}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
