"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  MoreVertical,
  Plus,
  RefreshCw,
  Filter,
  Phone,
  Mail,
  Building,
  Calendar,
  User,
  Briefcase
} from "lucide-react"
import { Employee } from "@/store/api/employeeApi"
import { SearchInput } from "@/components/common/searchInput"
import { EmployeeDetailsDialog } from "./employeeDetailsDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import { Input } from "../ui/input"

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
  currentPage: number
  pageSize: number
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
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
  currentPage,
  pageSize,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
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
        key: "employee",
        header: "Employee",
        render: (employee: Employee) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {employee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{employee.name}</div>
              <div className="text-sm text-gray-500">{employee.designation}</div>
              <div className="text-xs text-blue-600 font-mono">ID: {employee.employeeId}</div>
            </div>
          </div>
        )
      },
      {
        key: "contact",
        header: "Contact",
        render: (employee: Employee) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3" />
              {employee.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="h-3 w-3" />
              {employee.email}
            </div>
          </div>
        )
      },
      {
        key: "department",
        header: "Department",
        render: (employee: Employee) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-3 w-3" />
              {employee.department}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase className="h-3 w-3" />
              {employee.role}
            </div>
          </div>
        )
      },
      {
        key: "officeLocation",
        header: "Office Location",
        render: (employee: Employee) => (
          <div className="text-sm">{employee.officeLocation}</div>
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
      {/* Main Table */}
      <Card className="card-hostinger p-4">
        <CardHeader className="pb-4">
            <SearchInput
              placeholder="Search employees..."
              value={searchTerm}
              onChange={onSearchChange}
              debounceDelay={500}
            />
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={employees}
            columns={getColumns()}
            emptyMessage={`No ${mode === 'active' ? 'employees' : 'deleted employees'} found`}
            emptyData={{
              title: mode === 'active' ? 'No employees yet' : 'No deleted employees',
              description: mode === 'active' 
                ? 'Add your first employee to get started.'
                : 'Trash is empty.',
              primaryActionLabel: mode === 'active' ? 'Add Employee' : undefined,
            }}
            onPrimaryAction={mode === 'active' ? () => router.push('/employee/create') : undefined}
            showCard={false}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
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
          />
        </div>
      )}

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