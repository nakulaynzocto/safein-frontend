"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { useGetAppointmentsQuery } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { useGetVisitorsQuery } from "@/store/api/visitorApi"
import { routes } from "@/utils/routes"
import { DashboardHeader } from "./DashboardHeader"
import { StatsGrid } from "./statsGrid"
import { AppointmentsTable } from "./AppointmentsTable"
import { QuickActions } from "./QuickActions"
import { DashboardCharts } from "./dashboardCharts"
import { NewAppointmentModal } from "@/components/appointment/NewAppointmentModal"
import { calculateAppointmentStats, getRecentAppointments, getTodaysAppointments } from "./dashboardUtils"

export function DashboardOverview() {
  const router = useRouter()
  const [showAppointmentModal, setShowAppointmentModal] = React.useState(false)
  
  // Use optimized queries with caching
  const { data: appointmentsData, isLoading: appointmentsLoading } = useGetAppointmentsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  
  const { data: employeesData, isLoading: employeesLoading } = useGetEmployeesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  
  const { data: visitorsData, isLoading: visitorsLoading } = useGetVisitorsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  
  const { user } = useAppSelector((state) => state.auth)

  // Extract appointments array from the API response
  const appointments = appointmentsData?.appointments || []
  const employees = employeesData?.employees || []
  const visitors = visitorsData?.visitors || []

  // Calculate statistics
  const stats = calculateAppointmentStats(appointments)

  // Get filtered appointments
  const recentAppointments = getRecentAppointments(appointments, 5)
  const todaysAppointments = getTodaysAppointments(appointments)

  // Handle appointment creation
  const handleScheduleAppointment = () => {
    setShowAppointmentModal(true)
  }

  const handleAppointmentCreated = () => {
    setShowAppointmentModal(false)
    // The appointments data will be refetched automatically due to RTK Query cache invalidation
  }

  return (
    <div className="space-y-6">
      <DashboardHeader userName={user?.name} />

      {/* Statistics Cards */}
      <StatsGrid stats={stats} />

      {/* Image-Type Charts */}
      <DashboardCharts 
        appointmentsData={appointments}
        employeesData={employees}
        visitorsData={visitors}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <AppointmentsTable
          title="Today's Appointments"
          description="Appointments scheduled for today"
          data={todaysAppointments}
          isLoading={appointmentsLoading}
          showDateTime={true}
          emptyData={{
            title: "No appointments today",
            description: "No appointments are scheduled for today.",
            primaryActionLabel: "Schedule Appointment"
          }}
          onPrimaryAction={handleScheduleAppointment}
        />

        {/* Recent Appointments */}
        <AppointmentsTable
          title="Recent Appointments"
          description="Latest appointment activities"
          data={recentAppointments}
          isLoading={appointmentsLoading}
          showDateTime={true}
          emptyData={{
            title: "No recent appointments",
            description: "No recent appointment activities found.",
            primaryActionLabel: "Schedule Appointment"
          }}
          onPrimaryAction={handleScheduleAppointment}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Appointment Modal */}
      <NewAppointmentModal
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
        onSuccess={handleAppointmentCreated}
        triggerButton={<div />} // Hidden trigger since we control the modal programmatically
      />
    </div>
  )
}
