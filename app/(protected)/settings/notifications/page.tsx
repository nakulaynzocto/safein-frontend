"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, User, Calendar, Bell, RefreshCw } from "lucide-react"
import {
  useGetAppointmentsQuery,
  useApproveAppointmentMutation,
  useRejectAppointmentMutation,
  Appointment
} from "@/store/api/appointmentApi"
import { NotificationCard } from "@/components/common/notificationCard"
import { PageHeader } from "@/components/common/pageHeader"
import { showSuccessToast, showErrorToast } from "@/utils/toast"

import { getAppointmentDateTime } from "@/utils/helpers"
import { PageSkeleton } from "@/components/common/pageSkeleton"

function NotificationsPageContent() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: appointmentsData, isLoading, error, refetch } = useGetAppointmentsQuery(
    {
      status: 'pending',
      limit: 20,
      page: 1
    },
    {
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000, // Auto-refresh every 30 seconds
    }
  )

  const [approveAppointment] = useApproveAppointmentMutation()
  const [rejectAppointment] = useRejectAppointmentMutation()

  // Filter to show only future pending appointments (exclude past appointments)
  const pendingAppointments = (appointmentsData?.appointments || []).filter(
    (appointment) => {
      // First check if status is pending
      if (appointment.status !== 'pending') {
        return false
      }

      // Check if appointment is in the future
      const scheduledDateTime = getAppointmentDateTime(appointment)
      if (!scheduledDateTime) {
        // If we can't determine the date/time, exclude it
        return false
      }

      // Only show appointments that are scheduled for the future
      const now = new Date()
      return scheduledDateTime.getTime() > now.getTime()
    }
  )

  const handleApprove = async (appointmentId: string) => {
    setIsProcessing(true)
    try {
      await approveAppointment(appointmentId).unwrap()
      // Cache invalidation will automatically refresh, but we also manually refetch to ensure immediate update
      const result = await refetch()
      if (result.data) {
        showSuccessToast('Appointment approved successfully!')
      }
    } catch (error) {
      showErrorToast('Failed to approve appointment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (appointmentId: string) => {
    setIsProcessing(true)
    try {
      await rejectAppointment(appointmentId).unwrap()
      // Cache invalidation will automatically refresh, but we also manually refetch to ensure immediate update
      const result = await refetch()
      if (result.data) {
        showSuccessToast('Appointment rejected successfully!')
      }
    } catch (error) {
      showErrorToast('Failed to reject appointment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Force refetch by passing true to bypass cache
      const result = await refetch()
      if (result.data) {
        showSuccessToast('Notifications refreshed successfully!')
      } else {
        showErrorToast('Failed to refresh notifications')
      }
    } catch (error) {
      showErrorToast('Failed to refresh notifications')
    } finally {
      setIsRefreshing(false)
    }
  }


  if (isLoading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load notifications. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Notifications"
        description="Review and manage pending appointment requests"
      >
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isProcessing || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Completed today</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Declined today</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        {pendingAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Pending Notifications</h3>
              <p className="text-muted-foreground">
                You have no pending appointment requests at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">
                Pending Appointment Requests ({pendingAppointments.length})
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pendingAppointments.map((appointment) => (
                <NotificationCard
                  key={appointment._id}
                  appointment={appointment}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={isProcessing || isRefreshing}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <NotificationsPageContent />
  )
}


