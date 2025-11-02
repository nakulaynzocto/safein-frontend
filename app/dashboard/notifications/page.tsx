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
import { ProtectedLayout } from "@/components/layout/protectedLayout"

function NotificationsPageContent() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // API hooks
  const { data: appointmentsData, isLoading, error, refetch } = useGetAppointmentsQuery({
    status: 'pending',
    limit: 50,
    page: 1
  })
  
  const [approveAppointment] = useApproveAppointmentMutation()
  const [rejectAppointment] = useRejectAppointmentMutation()
  
  const pendingAppointments = appointmentsData?.appointments || []
  
  const handleApprove = async (appointmentId: string) => {
    setIsProcessing(true)
    try {
      await approveAppointment(appointmentId).unwrap()
      await refetch() // Refresh the list
      showSuccessToast('Appointment approved successfully!')
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
      await refetch() // Refresh the list
      showSuccessToast('Appointment rejected successfully!')
    } catch (error) {
      showErrorToast('Failed to reject appointment')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      showSuccessToast('Notifications refreshed successfully!')
    } catch (error) {
      showErrorToast('Failed to refresh notifications')
    } finally {
      setIsRefreshing(false)
    }
  }
  
  if (isLoading) {
    return null
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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
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
    <ProtectedLayout>
      <NotificationsPageContent />
    </ProtectedLayout>
  )
}
