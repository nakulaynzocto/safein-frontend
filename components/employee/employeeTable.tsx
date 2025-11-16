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
import DateRangePicker from "@/components/common/dateRangePicker"
import { EmployeeDetailsDialog } from "./employeeDetailsDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import { Input } from "../ui/input"
import { routes } from "@/utils/routes"
import { NewEmployeeModal } from "./NewEmployeeModal"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"

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
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  hasReachedLimit?: boolean
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
  onDateFromChange,
  onDateToChange,
  hasReachedLimit = false,
}: EmployeeTableProps) {
  const router = useRouter()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)


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


  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
  }


  const handleEmployeeUpdated = () => {
    setEditingEmployee(null)
    onRefresh?.()
  }


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
              <div className="text-sm text-gray-500">{employee.department}</div>
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
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-3 w-3" />
            {employee.department}
          </div>
        )
      },
    ]


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
                  <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
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
          <div className="flex items-center justify-between gap-3">
            <SearchInput
              placeholder="Search employees..."
              value={searchTerm}
              onChange={onSearchChange}
              debounceDelay={500}
              className="w-full"
            />
            <DateRangePicker onDateRangeChange={(r) => { onDateFromChange?.(r.startDate || ""); onDateToChange?.(r.endDate || ""); }} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {employees.length === 0 && !isLoading ? (

            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-center space-y-4">
                <div className="p-4 rounded-full bg-gray-100 mx-auto w-fit">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mode === 'active' ? 'No employees yet' : 'No deleted employees'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {mode === 'active' 
                      ? 'Add your first employee to get started.'
                      : 'Trash is empty.'
                    }
                  </p>
                </div>
                {mode === 'active' && (
                  <>
                    {hasReachedLimit ? (
                      <>
                        <Button className="mt-4" onClick={() => setShowUpgradeModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                        <UpgradePlanModal
                          isOpen={showUpgradeModal}
                          onClose={() => setShowUpgradeModal(false)}
                        />
                      </>
                    ) : (
                      <NewEmployeeModal
                        trigger={
                          <Button className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                          </Button>
                        }
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <DataTable
              data={employees}
              columns={getColumns()}
              emptyMessage={`No ${mode === 'active' ? 'employees' : 'deleted employees'} found`}
              showCard={false}
              isLoading={isLoading}
            />
          )}
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

      {/* Edit Employee Modal */}
      <NewEmployeeModal
        employeeId={editingEmployee?._id}
        open={!!editingEmployee}
        onOpenChange={(open: boolean) => !open && setEditingEmployee(null)}
        onSuccess={handleEmployeeUpdated}
        trigger={<div />} // Hidden trigger since we control the modal programmatically
      />
    </div>
  )
}