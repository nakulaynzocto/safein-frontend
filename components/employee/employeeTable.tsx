"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/dataTable"
import { ConfirmationDialog } from "@/components/common/confirmationDialog"
import { Pagination } from "@/components/common/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "@/components/common/statusBadge"
import { format } from "date-fns"
import { 
  Edit, 
  Trash2, 
  Eye,
  RotateCcw,
  MoreVertical
} from "lucide-react"
import { Employee } from "@/store/api/employeeApi"
import { FilterSection } from "./filterSection"
import { EmployeeDetailsDialog } from "./employeeDetailsDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"

export interface EmployeeTableProps {
  employees: Employee[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalEmployees: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  isLoading?: boolean
  error?: any
  searchTerm: string
  departmentFilter: string
  statusFilter?: string
  currentPage: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSearchChange: (value: string) => void
  onDepartmentFilterChange: (value: string) => void
  onStatusFilterChange?: (value: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortChange: (field: string) => void
  mode: 'active' | 'trash'
  showSelection?: boolean
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
  onDelete?: (employeeId: string) => void
  onRestore?: (employeeId: string) => void
  onBulkRestore?: (employeeIds: string[]) => void
  onView?: (employee: Employee) => void
  isDeleting?: boolean
  isRestoring?: boolean
  onRefresh?: () => void
  showHeader?: boolean
  title?: string
  description?: string
}

export function EmployeeTable({
  employees,
  pagination,
  isLoading,
  error,
  searchTerm,
  departmentFilter,
  statusFilter,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  onSearchChange,
  onDepartmentFilterChange,
  onStatusFilterChange,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  mode,
  showSelection = false,
  selectedItems = [],
  onSelectionChange,
  onDelete,
  onRestore,
  onBulkRestore,
  onView,
  isDeleting = false,
  isRestoring = false,
  onRefresh,
  showHeader = true,
  title,
}: EmployeeTableProps) {
  const router = useRouter()
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(employees.map(emp => emp._id))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedItems, employeeId])
    } else {
      onSelectionChange?.(selectedItems.filter(id => id !== employeeId))
    }
  }

  // Action handlers
  const handleDelete = async () => {
    if (!selectedEmployee || !onDelete) return
    await onDelete(selectedEmployee._id)
    setShowDeleteDialog(false)
    setSelectedEmployee(null)
  }

  const handleRestore = async () => {
    if (!selectedEmployee || !onRestore) return
    await onRestore(selectedEmployee._id)
    setShowRestoreDialog(false)
    setSelectedEmployee(null)
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowViewDialog(true)
  }

  // Define columns based on mode
  const getColumns = () => {
    const baseColumns = [
      {
        key: "employeeId",
        header: "Employee ID",
        render: (employee: Employee) => (
          <div className="font-medium">{employee.employeeId}</div>
        )
      },
      {
        key: "name",
        header: "Name",
        render: (employee: Employee) => (
          <div className="font-medium">{employee.name}</div>
        )
      },
      {
        key: "email",
        header: "Email",
        render: (employee: Employee) => (
          <div className="text-muted-foreground">{employee.email}</div>
        )
      },
      {
        key: "phone",
        header: "Phone",
        render: (employee: Employee) => (
          <div className="text-sm">{employee.phone}</div>
        )
      },
      {
        key: "department",
        header: "Department",
        render: (employee: Employee) => (
          <Badge variant="secondary">{employee.department}</Badge>
        )
      },
    ]

    // Add mode-specific columns
    if (mode === 'active') {
      baseColumns.push({
        key: "status",
        header: "Status",
        render: (employee: Employee) => <StatusBadge status={employee.status.toLowerCase() as any} />
      })
    } else if (mode === 'trash') {
      baseColumns.push({
        key: "deletedAt",
        header: "Deleted At",
        render: (employee: Employee) => (
          <div className="text-sm">
            <div>{format(new Date(employee.deletedAt!), "MMM dd, yyyy")}</div>
            <div className="text-muted-foreground">
              {format(new Date(employee.deletedAt!), "HH:mm")}
            </div>
          </div>
        )
      })
    }

    // Add actions column
    baseColumns.push({
      key: "actions",
      header: "Actions",
      render: (employee: Employee) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onView && (
                <DropdownMenuItem onClick={() => handleView(employee)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {mode === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => router.push(`/employee/${employee._id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setShowDeleteDialog(true)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
              {mode === 'trash' && onRestore && (
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedEmployee(employee)
                    setShowRestoreDialog(true)
                  }}
                  disabled={isRestoring}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    })

    return baseColumns
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load employees. Please try again.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <FilterSection
        search_term={searchTerm}
        department_filter={departmentFilter}
        status_filter={statusFilter}
        sort_by={sortBy}
        sort_order={sortOrder}
        mode={mode}
        on_search_change={onSearchChange}
        on_department_filter_change={onDepartmentFilterChange}
        on_status_filter_change={onStatusFilterChange}
        on_sort_change={onSortChange}
      />

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>{title || (mode === 'active' ? 'Employees' : 'Deleted Employees')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={employees}
            columns={getColumns()}
            emptyMessage={`No ${mode === 'active' ? 'employees' : 'deleted employees'} found`}
            showCard={false}
            isLoading={isLoading}
          />
          
          {/* Pagination */}
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalEmployees}
              pageSize={pageSize}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              showPageSizeSelector={true}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      {mode === 'active' && onDelete && (
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Employee"
          description={`Are you sure you want to delete ${selectedEmployee?.name}? This will move the employee to trash.`}
          onConfirm={handleDelete}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          variant="destructive"
        />
      )}

      {mode === 'trash' && onRestore && (
        <ConfirmationDialog
          open={showRestoreDialog}
          onOpenChange={setShowRestoreDialog}
          title="Restore Employee"
          description={`Are you sure you want to restore ${selectedEmployee?.name}? This will move the employee back to the active employees list.`}
          onConfirm={handleRestore}
          confirmText={isRestoring ? "Restoring..." : "Restore"}
          variant="default"
        />
      )}

      {/* View Details Dialog */}
      <EmployeeDetailsDialog
        employee={selectedEmployee}
        mode={mode}
        open={showViewDialog}
        on_close={() => setShowViewDialog(false)}
      />
    </div>
  )
}