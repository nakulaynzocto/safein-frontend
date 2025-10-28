import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Employee } from "@/store/api/employeeApi"

// JSON configuration for employee details
const employee_details_config = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status", mode: "active" },
  { key: "deletedAt", label: "Deleted At", mode: "trash", format: (value: string) => format(new Date(value), "MMM dd, yyyy 'at' HH:mm") },
]

interface EmployeeDetailsDialogProps {
  employee: Employee | null
  mode: 'active' | 'trash'
  open: boolean
  on_close: () => void
}

export function EmployeeDetailsDialog({ employee, mode, open, on_close }: EmployeeDetailsDialogProps) {
  if (!employee) return null

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // When the dialog closes (isOpen=false), trigger on_close to clear employee
        if (!isOpen) {
          on_close()
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {employee_details_config.map(({ key, label, mode: field_mode, format }) => {
              if (field_mode && field_mode !== mode) return null
              const value = employee[key as keyof Employee]
              return (
                <div key={key} className="space-y-2">
                  <div className="font-medium">{label}:</div>
                  <div className="text-muted-foreground">
                    {format && value ? format(value as string) : value}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end pt-4">
            {/* Close button */}
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

