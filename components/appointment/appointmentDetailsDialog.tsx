import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Appointment } from "@/store/api/appointmentApi"
import { ExternalLink } from "lucide-react"

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
    visitorName: (appt) => (appt as any).visitorId?.name || appt.visitor?.name || 'N/A',
    visitorEmail: (appt) => (appt as any).visitorId?.email || appt.visitor?.email || 'N/A',
    visitorPhone: (appt) => (appt as any).visitorId?.phone || appt.visitor?.phone || 'N/A',
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
  { key: "appointmentId", label: "Appointment ID" },
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && on_close()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fieldConfig.map(({ key, label, format, optional, showOnlyForCompleted }) => {
              if (showOnlyForCompleted && appointment.status !== 'completed') return null
              
              const value = getFieldValue(appointment, key)
              
              if (optional && !value && key !== 'checkInTime' && key !== 'checkOutTime') return null
              
              return (
                <div key={key} className="space-y-2">
                  <div className="font-medium">{label}:</div>
                  <div className="text-muted-foreground">
                    {renderFieldValue(key, value, format)}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button type="button" onClick={on_close}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
