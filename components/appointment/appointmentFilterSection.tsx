import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"

const appointmentFilterConfig = {
  statuses: [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "checked-out", label: "Checked Out" },
  ],
  sort_options: [
    { value: "createdAt-desc", label: "Created Date (Newest)" },
    { value: "createdAt-asc", label: "Created Date (Oldest)" },
    { value: "appointmentDate-desc", label: "Appointment Date (Newest)" },
    { value: "appointmentDate-asc", label: "Appointment Date (Oldest)" },
    { value: "visitorName-asc", label: "Visitor Name (A-Z)" },
    { value: "visitorName-desc", label: "Visitor Name (Z-A)" },
    { value: "employeeName-asc", label: "Employee Name (A-Z)" },
    { value: "employeeName-desc", label: "Employee Name (Z-A)" },
    { value: "status-asc", label: "Status (A-Z)" },
    { value: "status-desc", label: "Status (Z-A)" },
  ],
}

interface AppointmentFilterSectionProps {
  searchTerm: string
  statusFilter?: string
  employeeFilter?: string
  dateFrom?: string
  dateTo?: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  mode: 'active' | 'trash'
  onSearchChange: (value: string) => void
  onStatusFilterChange?: (value: string) => void
  onEmployeeFilterChange?: (value: string) => void
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  onSortChange: (field: string) => void
}

export function AppointmentFilterSection({
  searchTerm,
  statusFilter,
  employeeFilter,
  dateFrom,
  dateTo,
  sortBy,
  sortOrder,
  mode,
  onSearchChange,
  onStatusFilterChange,
  onEmployeeFilterChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
}: AppointmentFilterSectionProps) {
  const { data: employeesData } = useGetEmployeesQuery()
  const employees = employeesData?.employees || []
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {mode === 'active' && onStatusFilterChange && (
            <Select value={statusFilter || "all"} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {appointmentFilterConfig.statuses.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {onEmployeeFilterChange && (
            <Select value={employeeFilter || "all"} onValueChange={onEmployeeFilterChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.name} ({employee.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {onDateFromChange && (
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom || ""}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full sm:w-[150px]"
            />
          )}
          
          {onDateToChange && (
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo || ""}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full sm:w-[150px]"
            />
          )}
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-')
            onSortChange(field)
          }}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {appointmentFilterConfig.sort_options.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
