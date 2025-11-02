import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"


const filterConfig = {
  departments: [
    { value: "all", label: "All Departments" },
    { value: "IT", label: "IT" },
    { value: "HR", label: "HR" },
    { value: "Finance", label: "Finance" },
    { value: "Marketing", label: "Marketing" },
    { value: "Operations", label: "Operations" },
  ],
  statuses: [
    { value: "all", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ],
  sort_options: [
    { value: "createdAt-desc", label: "Created Date (Newest)" },
    { value: "createdAt-asc", label: "Created Date (Oldest)" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "department-asc", label: "Department (A-Z)" },
    { value: "department-desc", label: "Department (Z-A)" },
    { value: "email-asc", label: "Email (A-Z)" },
    { value: "email-desc", label: "Email (Z-A)" },
  ],
}

interface FilterSectionProps {
  search_term: string
  department_filter: string
  status_filter?: string
  sort_by: string
  sort_order: 'asc' | 'desc'
  mode: 'active' | 'trash'
  on_search_change: (value: string) => void
  on_department_filter_change: (value: string) => void
  on_status_filter_change?: (value: string) => void
  on_sort_change: (field: string) => void
}

export function FilterSection({
  search_term,
  department_filter,
  status_filter,
  sort_by,
  sort_order,
  mode,
  on_search_change,
  on_department_filter_change,
  on_status_filter_change,
  on_sort_change,
}: FilterSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={search_term}
              onChange={(e) => on_search_change(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={department_filter || "all"} onValueChange={on_department_filter_change}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              {filterConfig.departments.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mode === 'active' && on_status_filter_change && (
            <Select value={status_filter || "all"} onValueChange={on_status_filter_change}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {filterConfig.statuses.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={`${sort_by}-${sort_order}`} onValueChange={(value) => {
            const [field, order] = value.split('-')
            on_sort_change(field)
          }}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {filterConfig.sort_options.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
