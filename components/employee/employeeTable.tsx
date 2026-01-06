"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable } from "@/components/common/dataTable"
import { ConfirmationDialog } from "@/components/common/confirmationDialog"
import { Pagination } from "@/components/common/pagination"
import { StatusBadge } from "@/components/common/statusBadge"
import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Plus,
  Phone,
  Mail,
  Building,
  User
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
import { routes } from "@/utils/routes"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { formatName, getInitials } from "@/utils/helpers"

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
  onDelete?: (employeeId: string) => void
  onView?: (employee: Employee) => void
  isDeleting?: boolean
  showHeader?: boolean
  title?: string
  description?: string
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
  onDelete,
  onView,
  isDeleting = false,
  showHeader = true,
  title,
  hasReachedLimit = false,
}: EmployeeTableProps) {
  const router = useRouter()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)



  const handleDelete = async () => {
    if (!selectedEmployee || !onDelete) return
    await onDelete(selectedEmployee._id)
    setShowDeleteDialog(false)
    setSelectedEmployee(null)
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowViewDialog(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    router.push(routes.privateroute.EMPLOYEEEDIT.replace("[id]", employee._id))
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
                {getInitials(formatName(employee.name) || employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{formatName(employee.name)}</div>

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
            {formatName(employee.department)}
          </div>
        )
      },
    ]

    baseColumns.push({
      key: "status",
      header: "Status",
      render: (employee: Employee) => <StatusBadge status={employee.status.toLowerCase() as any} className="capitalize" />
    })

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
      <Card className="card-hostinger p-4 gap-3 sm:gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-3">
            <SearchInput
              placeholder="Search employees..."
              value={searchTerm}
              onChange={onSearchChange}
              debounceDelay={500}
              className="w-full"
            />
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
                    No employees yet
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Add your first employee to get started.
                  </p>
                </div>
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
                  <Button className="mt-4" onClick={() => router.push(routes.privateroute.EMPLOYEECREATE)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <DataTable
              data={employees}
              columns={getColumns()}
              emptyMessage="No employees found"
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
      {onDelete && (
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Employee"
          description={`Are you sure you want to delete ${selectedEmployee?.name}?`}
          onConfirm={handleDelete}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          variant="destructive"

        />
      )}

      {/* View Details Dialog */}
      <EmployeeDetailsDialog
        employee={selectedEmployee}
        mode="active"
        open={showViewDialog}
        on_close={() => setShowViewDialog(false)}
      />

      {/* Edit Employee handled via navigation (see useEffect) */}
    </div>
  )
}