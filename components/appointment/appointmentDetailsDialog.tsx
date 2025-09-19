import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Appointment } from "@/store/api/appointmentApi"

// JSON configuration for appointment details
const appointment_details_config = [
  { key: "appointmentId", label: "Appointment ID" },
  { key: "visitorName", label: "Visitor Name" },
  { key: "visitorEmail", label: "Visitor Email" },
  { key: "visitorPhone", label: "Visitor Phone" },
  { key: "employeeName", label: "Employee" },
  { key: "purpose", label: "Purpose" },
  { key: "appointmentDate", label: "Appointment Date", format: (value: string) => format(new Date(value), "MMM dd, yyyy") },
  { key: "appointmentTime", label: "Appointment Time" },
  { key: "status", label: "Status", mode: "active" },
  { key: "notes", label: "Notes", optional: true },
  { key: "checkInTime", label: "Check In Time", mode: "active", optional: true, format: (value: string) => value ? format(new Date(value), "MMM dd, yyyy 'at' HH:mm") : "Not checked in" },
  { key: "checkOutTime", label: "Check Out Time", mode: "active", optional: true, format: (value: string) => value ? format(new Date(value), "MMM dd, yyyy 'at' HH:mm") : "Not checked out" },
  { key: "deletedAt", label: "Deleted At", mode: "trash", format: (value: string) => format(new Date(value), "MMM dd, yyyy 'at' HH:mm") },
]

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null
  mode: 'active' | 'trash'
  open: boolean
  on_close: () => void
}

export function AppointmentDetailsDialog({ appointment, mode, open, on_close }: AppointmentDetailsDialogProps) {
  if (!appointment) return null

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {appointment_details_config.map(({ key, label, mode: field_mode, format, optional }) => {
              if (field_mode && field_mode !== mode) return null
              const value = appointment[key as keyof Appointment]
              
              // Skip optional fields if they don't have values
              if (optional && !value) return null
              
              return (
                <div key={key} className="space-y-2">
                  <div className="font-medium">{label}:</div>
                  <div className="text-muted-foreground">
                    {key === 'status' ? (
                      <Badge variant={getStatusBadgeVariant(value as string)}>
                        {value}
                      </Badge>
                    ) : (
                      format && value ? format(value as string) : value || 'N/A'
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Additional info for active appointments */}
          {mode === 'active' && (
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                <div>Created: {format(new Date(appointment.createdAt), "MMM dd, yyyy 'at' HH:mm")}</div>
                <div>Last Updated: {format(new Date(appointment.updatedAt), "MMM dd, yyyy 'at' HH:mm")}</div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
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
