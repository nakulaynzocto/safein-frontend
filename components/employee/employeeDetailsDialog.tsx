import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Employee } from "@/store/api/employeeApi"


const employee_details_config = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
]

interface EmployeeDetailsDialogProps {
  employee: Employee | null
  mode: 'active'
  open: boolean
  on_close: () => void
}

export function EmployeeDetailsDialog({ employee, mode, open, on_close }: EmployeeDetailsDialogProps) {
  if (!employee) return null

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
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {employee_details_config.map(({ key, label }) => {
              const value = employee[key as keyof Employee]
              return (
                <div key={key} className="space-y-2">
                  <div className="font-medium">{label}:</div>
                  <div className="text-muted-foreground">
                    {value || 'N/A'}
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

