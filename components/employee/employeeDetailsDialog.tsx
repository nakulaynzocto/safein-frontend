import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Employee } from "@/store/api/employeeApi"
import { User, Mail, Phone, Building, Briefcase, Calendar, Clock } from "lucide-react"
import { StatusBadge } from "@/components/common/statusBadge"

const formatDate = (value: string | null | undefined, formatStr: string, fallback: string = "N/A"): string => {
  if (!value) return fallback
  const date = new Date(value)
  return isNaN(date.getTime()) ? "Invalid Date" : format(date, formatStr)
}

const employee_details_config = [
  { key: "_id", label: "Employee ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "department", label: "Department" },
  { key: "designation", label: "Position" },
  { key: "status", label: "Status" },
  {
    key: "createdAt",
    label: "Created At",
    format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' HH:mm")
  },
  {
    key: "updatedAt",
    label: "Updated At",
    format: (val: string) => formatDate(val, "MMM dd, yyyy 'at' HH:mm")
  },
]

interface EmployeeDetailsDialogProps {
  employee: Employee | null
  mode: 'active'
  open: boolean
  on_close: () => void
}

export function EmployeeDetailsDialog({ employee, mode, open, on_close }: EmployeeDetailsDialogProps) {
  if (!employee) return null

  const renderFieldValue = (key: string, value: any, formatFn?: (val: string) => string) => {
    if (key === 'status') {
      return (
        <StatusBadge status={value} />
      )
    }

    if (formatFn && value) {
      return formatFn(value)
    }

    return value || 'N/A'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
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
      <DialogContent className="max-w-4xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header - LinkedIn/Facebook Style */}
          <div className="flex gap-6 pb-6 border-b">
            {/* Left Side - Employee Photo/Avatar */}
            <div className="shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Right Side - Employee Info & Status */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{employee.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{employee.phone}</span>
                </div>
              </div>
              <div>
                {renderFieldValue('status', employee.status)}
              </div>
            </div>
          </div>

          {/* Employee Details - Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employee_details_config.map(({ key, label, format: formatFn }) => {
              if (key === 'name' || key === 'email' || key === 'phone' || key === 'status') return null

              const value = employee[key as keyof Employee]
              let icon = null
              if (key === '_id') icon = <User className="h-4 w-4" />
              else if (key === 'department') icon = <Building className="h-4 w-4" />
              else if (key === 'designation') icon = <Briefcase className="h-4 w-4" />
              else if (key === 'createdAt') icon = <Calendar className="h-4 w-4" />
              else if (key === 'updatedAt') icon = <Clock className="h-4 w-4" />

              return (
                <div key={key} className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {icon}
                    {label}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {key === '_id' ? (
                      <span className="font-mono text-xs">{value}</span>
                    ) : (
                      renderFieldValue(key, value, formatFn)
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

