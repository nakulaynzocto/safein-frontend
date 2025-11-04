import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Appointment } from "@/store/api/appointmentApi"
import { ExternalLink } from "lucide-react"

const appointment_details_config = [
  { key: "appointmentId", label: "Appointment ID" },
  { key: "visitorName", label: "Visitor Name" },
  { key: "visitorEmail", label: "Visitor Email" },
  { key: "visitorPhone", label: "Visitor Phone" },
  { key: "employeeName", label: "Employee" },
  { key: "purpose", label: "Purpose" },
  { key: "appointmentDate", label: "Appointment Date", format: (value: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM dd, yyyy");
  }},
  { key: "appointmentTime", label: "Appointment Time" },
  { key: "status", label: "Status", mode: "active" },
  { key: "notes", label: "Notes", optional: true },
  { key: "vehicleNumber", label: "Vehicle Number", optional: true },
  { key: "checkInTime", label: "Check In Time", mode: "active", format: (value: string) => {
    if (!value) return "Not checked in";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM dd, yyyy 'at' HH:mm");
  }},
  { key: "checkOutTime", label: "Check Out Time", mode: "active", showOnlyForCompleted: true, format: (value: string) => {
    if (!value) return "Not checked out";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM dd, yyyy 'at' HH:mm");
  }},
  { key: "createdAt", label: "Created At", mode: "active", format: (value: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM dd, yyyy 'at' HH:mm");
  }},
  { key: "deletedAt", label: "Deleted At", mode: "trash", format: (value: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM dd, yyyy 'at' HH:mm");
  }},
]

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null
  mode: 'active' | 'trash'
  open: boolean
  on_close: () => void
}

export function AppointmentDetailsDialog({ appointment, mode, open, on_close }: AppointmentDetailsDialogProps) {
  if (!appointment) return null

  const getFieldValue = (key: string) => {
    switch (key) {
      case 'visitorName':
        return (appointment as any).visitorId?.name || appointment.visitor?.name || 'N/A';
      case 'visitorEmail':
        return (appointment as any).visitorId?.email || appointment.visitor?.email || 'N/A';
      case 'visitorPhone':
        return (appointment as any).visitorId?.phone || appointment.visitor?.phone || 'N/A';
      case 'employeeName':
        return (appointment as any).employeeId?.name || appointment.employee?.name || 'N/A';
      case 'purpose':
        return appointment.appointmentDetails?.purpose || 'N/A';
      case 'appointmentDate':
        return appointment.appointmentDetails?.scheduledDate || 'N/A';
      case 'appointmentTime':
        return appointment.appointmentDetails?.scheduledTime || 'N/A';
      case 'notes':
        return appointment.appointmentDetails?.notes || 'N/A';
      case 'vehicleNumber':
        return appointment.appointmentDetails?.vehicleNumber || '';
      case 'vehiclePhoto':
        return appointment.appointmentDetails?.vehiclePhoto || '';
      case 'checkInTime':
        return appointment.checkInTime || null;
      case 'checkOutTime':
        return appointment.checkOutTime || null;
      default:
        return appointment[key as keyof Appointment] || 'N/A';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'completed': return 'default'
      case 'checked-out': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          on_close()
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {appointment_details_config.map(({ key, label, mode: field_mode, format, optional, showOnlyForCompleted }: any) => {
              if (field_mode && field_mode !== mode) return null
              
              if (showOnlyForCompleted && appointment.status !== 'completed') return null
              
              const value = getFieldValue(key)
              
              if (optional && !value && key !== 'checkInTime' && key !== 'checkOutTime') return null
              
              return (
                <div key={key} className="space-y-2">
                  <div className="font-medium">{label}:</div>
                  <div className="text-muted-foreground">
                    {key === 'status' ? (
                      <Badge variant={getStatusBadgeVariant(value as string)}>
                        {value}
                      </Badge>
                    ) : key === 'vehicleNumber' && appointment.appointmentDetails?.vehiclePhoto ? (
                      <button
                        onClick={() => window.open(appointment.appointmentDetails?.vehiclePhoto, '_blank')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        <span>{value}</span>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    ) : (
                      format && value ? format(value as string) : value || 'N/A'
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              type="button" 
              onClick={on_close}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
