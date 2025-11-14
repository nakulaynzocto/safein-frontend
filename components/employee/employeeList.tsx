"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/pageHeader"
import { EmployeeTable } from "./employeeTable"
import { NewEmployeeModal } from "./NewEmployeeModal"
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from "@/store/api/employeeApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { UserPlus, Archive } from "lucide-react"
import { routes } from "@/utils/routes"
import { useDebounce } from "@/hooks/useDebounce"

export function EmployeeList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('dateRange')
      return raw ? JSON.parse(raw) : { startDate: null, endDate: null }
    }
    return { startDate: null, endDate: null }
  })
  
  const debouncedSearch = useDebounce(search, 500)
  
  const { data: employeeData, isLoading, error, refetch } = useGetEmployeesQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    department: departmentFilter && departmentFilter !== "all" ? departmentFilter : undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter as "Active" | "Inactive" : undefined,
    sortBy,
    sortOrder,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  })
  
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation()
  
  const employees = employeeData?.employees || []
  const pagination = employeeData?.pagination

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId).unwrap()
      showSuccessToast("Employee deleted successfully")
      refetch()
    } catch (error) {
      showErrorToast("Failed to delete employee")
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const handleEmployeeCreated = () => {
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage your organization's employees">
        <div className="flex gap-2">
          <NewEmployeeModal 
            onSuccess={handleEmployeeCreated}
            trigger={
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            }
          />
        </div>
      </PageHeader>

      <EmployeeTable
        employees={employees}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        searchTerm={search}
        currentPage={currentPage}
        pageSize={pageSize}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        mode="active"
        showSelection={false}
        onDateFromChange={(v) => { setDateRange(prev => ({ ...prev, startDate: v || null })); setCurrentPage(1) }}
        onDateToChange={(v) => { setDateRange(prev => ({ ...prev, endDate: v || null })); setCurrentPage(1) }}
        onDelete={handleDelete}
        onView={(employee) => {}}
        onRefresh={handleRefresh}
        isDeleting={isDeleting}
        showHeader={false}
      />
    </div>
  )
}