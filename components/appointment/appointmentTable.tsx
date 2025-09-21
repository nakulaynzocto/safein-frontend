"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/dataTable"
import { ConfirmationDialog } from "@/components/common/confirmationDialog"
import { Pagination } from "@/components/common/pagination"
import { StatusBadge } from "@/components/common/statusBadge"
import { format } from "date-fns"
import { 
  Edit, 
  Trash2, 
  Eye,
  RotateCcw,
  Clock,
  LogOut,
  Calendar,
  User,
  MoreVertical
} from "lucide-react"
import { Appointment } from "@/store/api/appointmentApi"
import { AppointmentFilterSection } from "./appointmentFilterSection"
import { AppointmentDetailsDialog } from "./appointmentDetailsDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"

export interface AppointmentTableProps {
  appointments: Appointment[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalAppointments: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  isLoading?: boolean
  error?: any
  searchTerm: string
  statusFilter?: string
  employeeFilter?: string
  dateFrom?: string
  dateTo?: string
  currentPage: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSearchChange: (value: string) => void
  onStatusFilterChange?: (value: string) => void
  onEmployeeFilterChange?: (value: string) => void
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortChange: (field: string) => void
  mode: 'active' | 'trash'
  showSelection?: boolean
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
  onDelete?: (appointmentId: string) => void
  onRestore?: (appointmentId: string) => void
  onBulkRestore?: (appointmentIds: string[]) => void
  onView?: (appointment: Appointment) => void
  onCheckIn?: (appointmentId: string) => void
  onCheckOut?: (appointmentId: string) => void
  isDeleting?: boolean
  isRestoring?: boolean
  isCheckingIn?: boolean
  isCheckingOut?: boolean
  onRefresh?: () => void
  showHeader?: boolean
  title?: string
  description?: string
}

export function AppointmentTable({
  appointments,
  pagination,
  isLoading,
  error,
  searchTerm,
  statusFilter,
  employeeFilter,
  dateFrom,
  dateTo,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusFilterChange,
  onEmployeeFilterChange,
  onDateFromChange,
  onDateToChange,
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
  onCheckIn,
  onCheckOut,
  isDeleting = false,
  isRestoring = false,
  isCheckingIn = false,
  isCheckingOut = false,
  onRefresh,
  showHeader = true,
  title,
}: AppointmentTableProps) {
  const router = useRouter()
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(appointments.map(apt => apt._id))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectAppointment = (appointmentId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedItems, appointmentId])
    } else {
      onSelectionChange?.(selectedItems.filter(id => id !== appointmentId))
    }
  }

  // Action handlers
  const handleDelete = async () => {
    if (!selectedAppointment || !onDelete) return
    await onDelete(selectedAppointment._id)
    setShowDeleteDialog(false)
    setSelectedAppointment(null)
  }

  const handleRestore = async () => {
    if (!selectedAppointment || !onRestore) return
    await onRestore(selectedAppointment._id)
    setShowRestoreDialog(false)
    setSelectedAppointment(null)
  }

  const handleCheckIn = async () => {
    if (!selectedAppointment || !onCheckIn) return
    await onCheckIn(selectedAppointment._id)
    setShowCheckInDialog(false)
    setSelectedAppointment(null)
  }

  const handleCheckOut = async () => {
    if (!selectedAppointment || !onCheckOut) return
    await onCheckOut(selectedAppointment._id)
    setShowCheckOutDialog(false)
    setSelectedAppointment(null)
  }

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowViewDialog(true)
  }

  // Define columns based on mode
  const getColumns = () => {
    const baseColumns = [
      {
        key: "appointmentId",
        header: "Appointment ID",
        render: (appointment: Appointment) => (
          <div className="font-medium">{appointment.appointmentId}</div>
        ),
      },
      {
        key: "visitorName",
        header: "Visitor",
        render: (appointment: Appointment) => (
          <div>
            <div className="font-medium">{appointment.visitorDetails?.name || "N/A"}</div>
            <div className="text-sm text-muted-foreground">{appointment.visitorDetails?.email || "N/A"}</div>
          </div>
        ),
      },
      {
        key: "employeeName",
        header: "Employee",
        render: (appointment: Appointment) => {
          // Handle case where employeeId might be an object or string
          let employeeName = "N/A"
          if (typeof appointment.employeeId === 'string') {
            employeeName = appointment.employeeId
          } else if (typeof appointment.employeeId === 'object' && appointment.employeeId !== null) {
            employeeName = (appointment.employeeId as any).name || (appointment.employeeId as any).employeeId || "N/A"
          }
          return <div className="text-sm">{employeeName}</div>
        },
      },
      {
        key: "purpose",
        header: "Purpose",
        render: (appointment: Appointment) => (
          <div className="text-sm max-w-[200px] truncate" title={appointment.appointmentDetails?.purpose || "N/A"}>
            {appointment.appointmentDetails?.purpose || "N/A"}
          </div>
        ),
      },
      {
        key: "appointmentDate",
        header: "Date & Time",
        render: (appointment: Appointment) => (
          <div className="text-sm">
            <div>{appointment.appointmentDetails?.scheduledDate ? format(new Date(appointment.appointmentDetails.scheduledDate), "MMM dd, yyyy") : "N/A"}</div>
            <div className="text-muted-foreground">{appointment.appointmentDetails?.scheduledTime || "N/A"}</div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (appointment: Appointment) => {
          // Ensure status is a string, not an object
          const status = typeof appointment.status === 'string' ? appointment.status : 'pending'
          return <StatusBadge status={status} />
        },
      },
    ]

    // Add mode-specific columns
    if (mode === 'trash') {
      baseColumns.push({
        key: "deletedAt",
        header: "Deleted At",
        render: (appointment: Appointment) => (
          <div className="text-sm">
            <div>{format(new Date(appointment.deletedAt!), "MMM dd, yyyy")}</div>
            <div className="text-muted-foreground">
              {format(new Date(appointment.deletedAt!), "HH:mm")}
            </div>
          </div>
        ),
      })
    }

    // Add actions column
    baseColumns.push({
      key: "actions",
      header: "Actions",
      render: (appointment: Appointment) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onView && (
                <DropdownMenuItem onClick={() => handleView(appointment)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {mode === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => router.push(`/appointment/${appointment._id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {appointment.status === 'approved' && onCheckIn && (
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowCheckInDialog(true)
                      }}
                      disabled={isCheckingIn}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Check In
                    </DropdownMenuItem>
                  )}
                  {appointment.status === 'completed' && onCheckOut && (
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowCheckOutDialog(true)
                      }}
                      disabled={isCheckingOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Check Out
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedAppointment(appointment)
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
                    setSelectedAppointment(appointment)
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
      ),
    })

    return baseColumns
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Failed to load appointments. Please try again.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <AppointmentFilterSection
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        employeeFilter={employeeFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sortBy={sortBy}
        sortOrder={sortOrder}
        mode={mode}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        onEmployeeFilterChange={onEmployeeFilterChange}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
        onSortChange={onSortChange}
      />

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>{title || (mode === 'active' ? 'Appointments' : 'Deleted Appointments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={appointments}
            columns={getColumns()}
            emptyMessage={`No ${mode === 'active' ? 'appointments' : 'deleted appointments'} found`}
            showCard={false}
            isLoading={isLoading}
          />
          
          {/* Pagination */}
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalAppointments}
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
          title="Delete Appointment"
          description={`Are you sure you want to delete appointment ${selectedAppointment?.appointmentId}? This will move the appointment to trash.`}
          onConfirm={handleDelete}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          variant="destructive"
        />
      )}

      {mode === 'trash' && onRestore && (
        <ConfirmationDialog
          open={showRestoreDialog}
          onOpenChange={setShowRestoreDialog}
          title="Restore Appointment"
          description={`Are you sure you want to restore appointment ${selectedAppointment?.appointmentId}? This will move the appointment back to the active appointments list.`}
          onConfirm={handleRestore}
          confirmText={isRestoring ? "Restoring..." : "Restore"}
          variant="default"
        />
      )}

      {mode === 'active' && onCheckIn && (
        <ConfirmationDialog
          open={showCheckInDialog}
          onOpenChange={setShowCheckInDialog}
          title="Check In Appointment"
          description={`Are you sure you want to check in visitor ${selectedAppointment?.visitorDetails.name} for appointment ${selectedAppointment?.appointmentId}?`}
          onConfirm={handleCheckIn}
          confirmText={isCheckingIn ? "Checking In..." : "Check In"}
          variant="default"
        />
      )}

      {mode === 'active' && onCheckOut && (
        <ConfirmationDialog
          open={showCheckOutDialog}
          onOpenChange={setShowCheckOutDialog}
          title="Check Out Appointment"
          description={`Are you sure you want to check out visitor ${selectedAppointment?.visitorDetails.name} for appointment ${selectedAppointment?.appointmentId}? `}
          onConfirm={handleCheckOut}
          confirmText={isCheckingOut ? "Checking Out..." : "Check Out"}
          variant="default"
        />
      )}

      {/* View Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        mode={mode}
        open={showViewDialog}
        on_close={() => setShowViewDialog(false)}
      />
    </div>
  )
}