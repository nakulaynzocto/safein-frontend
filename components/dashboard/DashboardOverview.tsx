"use client"

import * as React from "react"
import { useMemo, useCallback } from "react"
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
import { DashboardSkeleton } from "@/components/common/tableSkeleton"

export function DashboardOverview() {
  const router = useRouter()
  const [showAppointmentModal, setShowAppointmentModal] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const [loadingTimeout, setLoadingTimeout] = React.useState(false)
  
  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = useGetAppointmentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    skip: false,
  })
  
  const { data: employeesData, isLoading: employeesLoading, error: employeesError, refetch: refetchEmployees } = useGetEmployeesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    skip: false,
  })
  
  const { data: visitorsData, isLoading: visitorsLoading, error: visitorsError, refetch: refetchVisitors } = useGetVisitorsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    skip: false,
  })
  
  const { user } = useAppSelector((state) => state.auth)

  const isLoading = appointmentsLoading || employeesLoading || visitorsLoading
  
  const hasData = appointmentsData || employeesData || visitorsData
  const shouldShowSkeleton = isLoading && !hasData && retryCount < 2
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true)
      }
    }, 15000)
    
    return () => clearTimeout(timer)
  }, [isLoading])

  const appointments = useMemo(() => appointmentsData?.appointments || [], [appointmentsData?.appointments])
  const employees = useMemo(() => employeesData?.employees || [], [employeesData?.employees])
  const visitors = useMemo(() => visitorsData?.visitors || [], [visitorsData?.visitors])

  const stats = useMemo(() => calculateAppointmentStats(appointments), [appointments])

  const recentAppointments = useMemo(() => getRecentAppointments(appointments, 5), [appointments])
  const todaysAppointments = useMemo(() => getTodaysAppointments(appointments), [appointments])

  const handleScheduleAppointment = useCallback(() => {
    setShowAppointmentModal(true)
  }, [])

  const handleAppointmentCreated = useCallback(() => {
    setShowAppointmentModal(false)
  }, [])

  const hasError = useMemo(() => appointmentsError || employeesError || visitorsError, [appointmentsError, employeesError, visitorsError])
  
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    refetchAppointments()
    refetchEmployees()
    refetchVisitors()
  }, [refetchAppointments, refetchEmployees, refetchVisitors])
  
  if (shouldShowSkeleton && !hasError && !loadingTimeout) {
    return <DashboardSkeleton />
  }
  
  if (loadingTimeout && isLoading && !hasData && !hasError) {
    return (
      <div className="space-y-6">
        <DashboardHeader userName={user?.name} />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Loading is taking longer than expected</h3>
          <p className="text-yellow-600 mb-4">
            The dashboard is taking longer to load than usual. This may be due to network issues or server response delays.
          </p>
          <button 
            onClick={handleRetry} 
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 mr-4"
          >
            Retry
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
  
  if (hasError && !hasData) {
    return (
      <div className="space-y-6">
        <DashboardHeader userName={user?.name} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load dashboard data</h3>
          <p className="text-red-600 mb-4">
            {appointmentsError && `Appointments: ${(appointmentsError as any)?.data?.message || 'Failed to load'}`}
            {employeesError && `\nEmployees: ${(employeesError as any)?.data?.message || 'Failed to load'}`}
            {visitorsError && `\nVisitors: ${(visitorsError as any)?.data?.message || 'Failed to load'}`}
          </p>
          <button 
            onClick={handleRetry} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
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
