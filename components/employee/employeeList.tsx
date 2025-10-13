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
  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 500)
  
  // API query with parameters
  const { data: employeeData, isLoading, error } = useGetEmployeesQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    department: departmentFilter && departmentFilter !== "all" ? departmentFilter : undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter as "Active" | "Inactive" : undefined,
    sortBy,
    sortOrder,
  })
  
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation()
  
  const employees = employeeData?.employees || []
  const pagination = employeeData?.pagination

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId).unwrap()
      showSuccessToast("Employee deleted successfully")
    } catch (error) {
      showErrorToast("Failed to delete employee")
      console.error("Delete error:", error)
    }
  }

  // Reset to first page when debounced search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
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
    // Refresh the employee list by refetching the query
    // The query will automatically refetch when the modal closes
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
        // Data
        employees={employees}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        
        // Filters and pagination
        searchTerm={search}
        currentPage={currentPage}
        pageSize={pageSize}
        
        // Actions
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        
        // Table configuration
        mode="active"
        showSelection={false}
        
        // Actions
        onDelete={handleDelete}
        onView={(employee) => {}}
        
        // Loading states
        isDeleting={isDeleting}
        
        // Optional props
        showHeader={false}
      />
    </div>
  )
}