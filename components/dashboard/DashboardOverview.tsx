"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { useGetAppointmentsQuery, useGetAppointmentStatsQuery } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { useGetVisitorsQuery } from "@/store/api/visitorApi"
import { DashboardHeader } from "./DashboardHeader"
import { StatsGrid } from "./statsGrid"
import { AppointmentsTable } from "./AppointmentsTable"
import { QuickActions } from "./QuickActions"
import { DashboardCharts } from "./dashboardCharts"
import { calculateAppointmentStats } from "./dashboardUtils"
import { DashboardSkeleton } from "@/components/common/tableSkeleton"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useGetTrialLimitsStatusQuery } from "@/store/api/userSubscriptionApi"
import DateRangePicker from "@/components/common/dateRangePicker"
import { routes } from "@/utils/routes"

export function DashboardOverview() {
  const router = useRouter()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDefaultDateRange = (): { startDate: string; endDate: string } => {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    return { startDate: formatDate(sevenDaysAgo), endDate: formatDate(today) }
  }

  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>(() => {
    if (typeof window === 'undefined') {
      return { startDate: null, endDate: null }
    }

    const saved = localStorage.getItem('dashboardDateRange')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.startDate && parsed.endDate) {
          return { startDate: parsed.startDate, endDate: parsed.endDate }
        }
      } catch {
        // Invalid JSON
      }
    }

    const defaultRange = getDefaultDateRange()
    localStorage.setItem('dashboardDateRange', JSON.stringify(defaultRange))
    return defaultRange
  })

  const handleDateRangeChange = useCallback((range: { startDate: string | null; endDate: string | null }) => {
    setDateRange(range)
    if (typeof window !== 'undefined' && range.startDate && range.endDate) {
      localStorage.setItem('dashboardDateRange', JSON.stringify(range))
    }
  }, [])
  
  const timezoneOffset = useMemo(() => -new Date().getTimezoneOffset(), [])
  const isDateRangeInitialized = dateRange.startDate !== null && dateRange.endDate !== null

  const appointmentQueryParams = useMemo(
    () => ({
      page: 1,
      limit: 5000,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      timezoneOffsetMinutes: timezoneOffset,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    }),
    [timezoneOffset, dateRange.startDate, dateRange.endDate]
  )

  const recentAppointmentsQueryParams = useMemo(
    () => ({
      page: 1,
      limit: 5,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      timezoneOffsetMinutes: timezoneOffset,
    }),
    [timezoneOffset]
  )

  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } =
    useGetAppointmentsQuery(appointmentQueryParams, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      skip: !isDateRangeInitialized,
    })

  const { data: recentAppointmentsData, isLoading: recentAppointmentsLoading } =
    useGetAppointmentsQuery(recentAppointmentsQueryParams, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    })

  const { data: appointmentStatsData, isLoading: appointmentStatsLoading } = useGetAppointmentStatsQuery(
    isDateRangeInitialized ? { startDate: dateRange.startDate!, endDate: dateRange.endDate! } : undefined,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      skip: !isDateRangeInitialized,
    }
  )
  
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

  const { data: trialStatus } = useGetTrialLimitsStatusQuery()
  const { user } = useAppSelector((state) => state.auth)

  const isLoading = appointmentsLoading || employeesLoading || visitorsLoading
  
  const hasData = appointmentsData || employeesData || visitorsData
  const shouldShowSkeleton = isLoading && !hasData && retryCount < 2
  
  useEffect(() => {
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

  const recentAppointments = useMemo(
    () => (recentAppointmentsData?.appointments || []).slice(0, 5),
    [recentAppointmentsData?.appointments]
  )

  const stats = useMemo(() => {
    const calculatedStats = calculateAppointmentStats(appointments)
    const { pendingAppointments, approvedAppointments, rejectedAppointments, completedAppointments, timeOutAppointments, totalAppointments } = calculatedStats
    const sumOfCategories = pendingAppointments + approvedAppointments + rejectedAppointments + completedAppointments + timeOutAppointments
    
    return sumOfCategories !== totalAppointments
      ? { ...calculatedStats, totalAppointments: sumOfCategories }
      : calculatedStats
  }, [appointments])

  const hasReachedAppointmentLimit =
    trialStatus?.data?.isTrial && trialStatus.data.limits.appointments.reached

  const handleScheduleAppointment = useCallback(() => {
    if (hasReachedAppointmentLimit) {
      setShowUpgradeModal(true)
    } else {
      router.push(routes.privateroute.APPOINTMENTCREATE)
    }
  }, [hasReachedAppointmentLimit, router])

  const hasError = useMemo(
    () => appointmentsError || employeesError || visitorsError,
    [appointmentsError, employeesError, visitorsError]
  )
  
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
        <DashboardHeader companyName={user?.companyName} />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">Loading is taking longer than expected</h3>
          <p className="text-sm sm:text-base text-yellow-600 mb-4">
            The dashboard is taking longer to load than usual. This may be due to network issues or server response delays.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button 
              onClick={handleRetry} 
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm sm:text-base min-h-[40px]"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800 text-sm sm:text-base min-h-[40px]"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  if (hasError && !hasData && !isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader companyName={user?.companyName} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Failed to load dashboard data</h3>
          <p className="text-sm sm:text-base text-red-600 mb-4 whitespace-pre-line">
            {appointmentsError && `Appointments: ${(appointmentsError as any)?.data?.message || 'Failed to load'}`}
            {employeesError && `\nEmployees: ${(employeesError as any)?.data?.message || 'Failed to load'}`}
            {visitorsError && `\nVisitors: ${(visitorsError as any)?.data?.message || 'Failed to load'}`}
          </p>
          <button 
            onClick={handleRetry} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base min-h-[40px]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DashboardHeader companyName={user?.companyName} />

      <div className="flex justify-end">
        <DateRangePicker 
          onDateRangeChange={handleDateRangeChange}
          initialValue={dateRange.startDate && dateRange.endDate ? dateRange : undefined}
          className="w-full sm:w-auto"
        />
      </div>

      <StatsGrid stats={stats} />

      <DashboardCharts 
        appointmentsData={appointments}
        employeesData={employees}
        visitorsData={visitors}
        dateRange={dateRange}
      />

      <AppointmentsTable
        title="Recent Appointments"
        description="Latest appointment activities"
        data={recentAppointments}
        isLoading={recentAppointmentsLoading}
        showDateTime={true}
        emptyData={{
          title: "No recent appointments",
          description: "No recent appointment activities found.",
          primaryActionLabel: hasReachedAppointmentLimit ? "Upgrade Plan" : "Schedule Appointment",
        }}
        onPrimaryAction={handleScheduleAppointment}
      />

      <QuickActions />

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
