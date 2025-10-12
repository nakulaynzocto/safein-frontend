"use client"

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

export function NotificationCard({ appointment, onApprove, onReject, isProcessing = false }: NotificationCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(appointment.status)}
            <CardTitle className="text-base">Appointment Request</CardTitle>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {appointment.status === 'pending' 
            ? "You have a new appointment request. Please review and click Approve or Reject."
            : appointment.status === 'approved'
            ? "Appointment approved successfully. The visitor has been notified."
            : "Appointment rejected. The visitor has been informed."
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Visitor</p>
              <p className="text-sm text-muted-foreground truncate">{appointment.visitor?.name || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(appointment.appointmentDetails.scheduledDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-muted-foreground">{appointment.appointmentDetails.scheduledTime}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Employee</p>
              <p className="text-sm text-muted-foreground truncate">{appointment.employeeId}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-1">Purpose</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{appointment.appointmentDetails.purpose}</p>
        </div>
        
        {appointment.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            <Button 
              onClick={() => onApprove(appointment._id)} 
              disabled={isProcessing}
              className="flex-1"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => onReject(appointment._id)} 
              disabled={isProcessing}
              className="flex-1"
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
}
