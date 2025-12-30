"use client"

import { memo, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, User, Calendar, Clock as ClockIcon } from "lucide-react"
import { Appointment } from "@/store/api/appointmentApi"

interface NotificationCardProps {
  appointment: Appointment
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isProcessing?: boolean
}

/**
 * NotificationCard component displays appointment notification with approve/reject actions
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const NotificationCard = memo(function NotificationCard({ 
  appointment, 
  onApprove, 
  onReject, 
  isProcessing = false 
}: NotificationCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const statusIcon = useMemo(() => {
    switch (appointment.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }, [appointment.status])

  const statusColor = useMemo(() => {
    switch (appointment.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }, [appointment.status])

  const formattedDate = useMemo(() => formatDate(appointment.appointmentDetails.scheduledDate), [appointment.appointmentDetails.scheduledDate])
  
  const description = useMemo(() => {
    if (appointment.status === 'pending') {
      return "You have a new appointment request. Please review and click Approve or Reject."
    }
    if (appointment.status === 'approved') {
      return "Appointment approved successfully. The visitor has been notified."
    }
    return "Appointment rejected. The visitor has been informed."
  }, [appointment.status])

  const employeeName = useMemo(() => {
    // Handle both populated and non-populated employeeId
    const employee = (appointment as any).employeeId || appointment.employee
    if (typeof employee === 'object' && employee !== null) {
      return employee.name || 'N/A'
    }
    return appointment.employee?.name || 'N/A'
  }, [appointment.employeeId, appointment.employee])

  const visitorName = useMemo(() => {
    // Handle both populated and non-populated visitorId
    const visitor = (appointment as any).visitorId || appointment.visitor
    if (typeof visitor === 'object' && visitor !== null) {
      return visitor.name || 'N/A'
    }
    return appointment.visitor?.name || 'N/A'
  }, [appointment.visitorId, appointment.visitor])

  return (
    <Card className="w-full h-full flex flex-col mx-2 sm:mx-0">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusIcon}
            <CardTitle className="text-base">Appointment Request</CardTitle>
          </div>
          <Badge className={statusColor}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="text-sm mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Visitor</p>
              <p className="text-sm text-gray-600 truncate">{visitorName}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Date</p>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Time</p>
              <p className="text-sm text-gray-600">{appointment.appointmentDetails.scheduledTime}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Meeting With</p>
              <p className="text-sm text-gray-600 truncate">{employeeName}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">Purpose</p>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{appointment.appointmentDetails.purpose}</p>
        </div>
        
        {appointment.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-auto">
            <Button 
              onClick={() => onApprove(appointment._id)} 
              disabled={isProcessing}
              className="flex-1 h-10"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => onReject(appointment._id)} 
              disabled={isProcessing}
              className="flex-1 h-10"
              variant="destructive"
              size="sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})