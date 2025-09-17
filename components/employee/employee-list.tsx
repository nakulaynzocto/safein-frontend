"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from "@/store/api/employeeApi"
import { showSuccess, showError } from "@/utils/toaster"
import { UserPlus, Edit, Trash2, Search, Filter } from "lucide-react"
import { routes } from "@/utils/routes"

export function EmployeeList() {
  const router = useRouter()
  
  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // API query with parameters
  const { data: employeeData, isLoading, error } = useGetEmployeesQuery({
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
    department: departmentFilter && departmentFilter !== "all" ? departmentFilter : undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter as "Active" | "Inactive" : undefined,
    sortBy,
    sortOrder,
  })
  
  const [deleteEmployee] = useDeleteEmployeeMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  
  const employees = employeeData?.employees || []
  const pagination = employeeData?.pagination

  const handleDelete = async () => {
    if (!selectedEmployee) return

    try {
      await deleteEmployee(selectedEmployee).unwrap()
      showSuccess("Employee deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedEmployee(null)
    } catch (error: any) {
      showError(error?.data?.message || error?.message || "Failed to delete employee")
    }
  }

  const openDeleteDialog = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    setDeleteDialogOpen(true)
  }

  const columns = [
    {
      key: "employeeId",
      header: "Employee ID",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone",
      sortable: true,
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
    },
    {
      key: "designation",
      header: "Designation",
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
    },
    // {
    //   key: "officeLocation",
    //   header: "Office Location",
    //   sortable: true,
    // },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (employee: any) => <StatusBadge status={employee.status.toLowerCase()} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (employee: any) => (
        <div className="flex gap-2 justify-end">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => router.push(`/employee/${employee._id}`)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => openDeleteDialog(employee._id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  const emptyData = {
    title: "No employees found",
    primaryActionLabel: "Add employee",
    description: "You don't have any employees in your organization. Add your first employee to get started.",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage your organization's employees">
        <Button asChild>
          <Link href={routes.privateroute.EMPLOYEECREATE} prefetch={true}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Information Technology">Information Technology</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-')
            setSortBy(field)
            setSortOrder(order as "asc" | "desc")
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="department-asc">Department (A-Z)</SelectItem>
              <SelectItem value="department-desc">Department (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable 
        data={employees} 
        columns={columns} 
        isLoading={isLoading} 
        emptyData={emptyData}
        enableSorting={true}
        onPrimaryAction={() => router.push(routes.privateroute.EMPLOYEECREATE)}
      />

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * pageSize) + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalEmployees)} of {pagination.totalEmployees} employees
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
