import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Appointment } from "@/store/api/appointmentApi"
import { ExternalLink, User, Mail, Phone, Calendar, Clock, Briefcase, FileText, Car, CheckCircle, XCircle } from "lucide-react"

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null
  mode: 'active'
  open: boolean
  on_close: () => void
}

const formatDate = (value: string | null | undefined, formatStr: string, fallback: string = "N/A"): string => {
  if (!value) return fallback
  const date = new Date(value)
  return isNaN(date.getTime()) ? "Invalid Date" : format(date, formatStr)
}

const getFieldValue = (appointment: Appointment, key: string): any => {
  const fieldMap: Record<string, (appt: Appointment) => any> = {
    _id: (appt) => appt._id || 'N/A',
    visitorName: (appt) => (appt as any).visitorId?.name || appt.visitor?.name || 'N/A',
    visitorEmail: (appt) => (appt as any).visitorId?.email || appt.visitor?.email || 'N/A',
    visitorPhone: (appt) => (appt as any).visitorId?.phone || appt.visitor?.phone || 'N/A',
    visitorPhoto: (appt) => (appt as any).visitorId?.photo || (appt as any).visitor?.photo || '',
    employeeName: (appt) => (appt as any).employeeId?.name || appt.employee?.name || 'N/A',
    purpose: (appt) => appt.appointmentDetails?.purpose || 'N/A',
    appointmentDate: (appt) => appt.appointmentDetails?.scheduledDate || 'N/A',
    appointmentTime: (appt) => appt.appointmentDetails?.scheduledTime || 'N/A',
    notes: (appt) => appt.appointmentDetails?.notes || 'N/A',
    vehicleNumber: (appt) => appt.appointmentDetails?.vehicleNumber || '',
    vehiclePhoto: (appt) => appt.appointmentDetails?.vehiclePhoto || '',
    checkInTime: (appt) => appt.checkInTime || null,
    checkOutTime: (appt) => appt.checkOutTime || null,
  }

  const handler = fieldMap[key]
  return handler ? handler(appointment) : appointment[key as keyof Appointment] || 'N/A'
}

const statusVariants: Record<string, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  completed: 'default',
  'checked-out': 'outline',
}

const fieldConfig = [
  { key: "_id", label: "Appointment ID" },
  { key: "visitorName", label: "Visitor Name" },
  { key: "visitorEmail", label: "Visitor Email" },
  { key: "visitorPhone", label: "Visitor Phone" },
  { key: "employeeName", label: "Employee" },
  { key: "purpose", label: "Purpose" },
  { 
    key: "appointmentDate", 
    label: "Appointment Date",
    format: (val: string) => formatDate(val, "MMM dd, yyyy")
  },
  { key: "appointmentTime", label: "Appointment Time" },
  { key: "status", label: "Status" },
  { key: "notes", label: "Notes", optional: true },
  { key: "vehicleNumber", label: "Vehicle Number", optional: true },
  { 
    key: "checkInTime", 
    label: "Check In Time",
    format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' HH:mm", "Not checked in")
  },
  { 
    key: "checkOutTime", 
    label: "Check Out Time",
    showOnlyForCompleted: true,
    format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' HH:mm", "Not checked out")
  },
  { 
    key: "createdAt", 
    label: "Created At",
    format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' HH:mm")
  },
]

export function AppointmentDetailsDialog({ appointment, mode, open, on_close }: AppointmentDetailsDialogProps) {
  if (!appointment) return null

  const renderFieldValue = (key: string, value: any, formatFn?: (val: string) => string) => {
    if (key === 'status') {
      return (
        <Badge variant={statusVariants[value] || 'secondary'}>
          {value}
        </Badge>
      )
    }

    if (key === 'vehicleNumber' && appointment.appointmentDetails?.vehiclePhoto) {
      return (
        <button
          onClick={() => window.open(appointment.appointmentDetails?.vehiclePhoto, '_blank')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          <span>{value}</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      )
    }

    if (formatFn && value) {
      return formatFn(value as string)
    }

    return value || 'N/A'
  }

  const visitorPhoto = getFieldValue(appointment, 'visitorPhoto')
  const visitorName = getFieldValue(appointment, 'visitorName')
  const status = appointment.status

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && on_close()}>
      <DialogContent className="max-w-4xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header - LinkedIn/Facebook Style */}
          <div className="flex gap-6 pb-6 border-b">
            {/* Left Side - Visitor Photo */}
            <div className="shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={visitorPhoto} alt={visitorName} />
                <AvatarFallback className="text-2xl">
                  {visitorName !== 'N/A' ? visitorName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'V'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Right Side - Visitor Info & Status */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{visitorName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getFieldValue(appointment, 'visitorEmail')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getFieldValue(appointment, 'visitorPhone')}</span>
                </div>
              </div>
              <div>
                <Badge variant={statusVariants[status] || 'secondary'} className="text-sm">
                  {status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Appointment Details - Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldConfig.map(({ key, label, format, optional, showOnlyForCompleted }) => {
              if (key === 'visitorName' || key === 'visitorEmail' || key === 'visitorPhone' || key === 'status') return null
              if (showOnlyForCompleted && appointment.status !== 'completed') return null
              
              const value = getFieldValue(appointment, key)
              
              if (optional && !value && key !== 'checkInTime' && key !== 'checkOutTime') return null
              
              let icon = null
              if (key === '_id') icon = <FileText className="h-4 w-4" />
              else if (key === 'employeeName') icon = <Briefcase className="h-4 w-4" />
              else if (key === 'purpose') icon = <FileText className="h-4 w-4" />
              else if (key === 'appointmentDate') icon = <Calendar className="h-4 w-4" />
              else if (key === 'appointmentTime') icon = <Clock className="h-4 w-4" />
              else if (key === 'checkInTime') icon = <CheckCircle className="h-4 w-4" />
              else if (key === 'checkOutTime') icon = <XCircle className="h-4 w-4" />
              else if (key === 'vehicleNumber') icon = <Car className="h-4 w-4" />
              else if (key === 'notes') icon = <FileText className="h-4 w-4" />
              else if (key === 'createdAt') icon = <Calendar className="h-4 w-4" />
              
              return (
                <div key={key} className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {icon}
                    {label}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {renderFieldValue(key, value, format)}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              type="button" 
              onClick={on_close}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
