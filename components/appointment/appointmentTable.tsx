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
  MoreVertical,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  Building,
  CheckCircle,
  X
} from "lucide-react"
import { Appointment } from "@/store/api/appointmentApi"
import { 
  useApproveAppointmentMutation, 
  useRejectAppointmentMutation 
} from "@/store/api/appointmentApi"
import { SearchInput } from "@/components/common/searchInput"
import { AppointmentDetailsDialog } from "./appointmentDetailsDialog"
import { CheckOutDialog } from "./checkOutDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { NewAppointmentModal } from "./NewAppointmentModal"

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
  currentPage: number
  pageSize: number
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  mode: 'active' | 'trash'
  showSelection?: boolean
  selectedItems?: string[]
  onSelectionChange?: (items: string[]) => void
  onDelete?: (appointmentId: string) => void
  onRestore?: (appointmentId: string) => void
  onBulkRestore?: (appointmentIds: string[]) => void
  onView?: (appointment: Appointment) => void
  onCheckOut?: (appointmentId: string, notes?: string) => void
  onApprove?: (appointmentId: string) => void
  onCancel?: (appointmentId: string) => void
  isDeleting?: boolean
  isRestoring?: boolean
  isCheckingOut?: boolean
  isApproving?: boolean
  isCancelling?: boolean
  onRefresh?: () => void
  showHeader?: boolean
  title?: string
  description?: string
  statusFilter?: string
  employeeFilter?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onStatusFilterChange?: (value: string) => void
  onEmployeeFilterChange?: (value: string) => void
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  onPageSizeChange?: (value: number) => void
  onSortChange?: (field: string) => void
}

export function AppointmentTable({
  appointments,
  pagination,
  isLoading,
  error,
  searchTerm,
  currentPage,
  pageSize,
  onSearchChange,
  onPageChange,
  mode,
  showSelection = false,
  selectedItems = [],
  onSelectionChange,
  onDelete,
  onRestore,
  onBulkRestore,
  onView,
  onCheckOut,
  onApprove,
  onCancel,
  isDeleting = false,
  isRestoring = false,
  isCheckingOut = false,
  isApproving = false,
  isCancelling = false,
  onRefresh,
  showHeader = true,
  title,
}: AppointmentTableProps) {
  const router = useRouter()
  
  // API mutations
  const [approveAppointment, { isLoading: isApprovingMutation }] = useApproveAppointmentMutation()
  const [rejectAppointment, { isLoading: isRejectingMutation }] = useRejectAppointmentMutation()
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
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


  const handleCheckOut = async (appointmentId: string, notes?: string) => {
    if (!onCheckOut) return
    await onCheckOut(appointmentId, notes)
    setShowCheckOutDialog(false)
    setSelectedAppointment(null)
  }

  const handleApprove = async (appointmentId: string) => {
    try {
      await approveAppointment(appointmentId).unwrap()
      showSuccessToast('Appointment approved successfully!')
      onApprove?.(appointmentId)
    } catch (error) {
      console.error('Failed to approve appointment:', error)
      showErrorToast('Failed to approve appointment')
    }
  }

  const handleReject = async (appointmentId: string) => {
    try {
      await rejectAppointment(appointmentId).unwrap()
      showSuccessToast('Appointment rejected successfully!')
      onCancel?.(appointmentId) // Using onCancel for rejection
    } catch (error) {
      console.error('Failed to reject appointment:', error)
      showErrorToast('Failed to reject appointment')
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment || !onCancel) return
    await onCancel(selectedAppointment._id)
    setShowCancelDialog(false)
    setSelectedAppointment(null)
  }

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowViewDialog(true)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setShowEditModal(true)
  }

  const handleAppointmentUpdated = () => {
    setShowEditModal(false)
    setEditingAppointment(null)
    onRefresh?.()
  }

  // Handle schedule appointment
  const handleScheduleAppointment = () => {
    router.push(routes.privateroute.APPOINTMENTCREATE)
  }

  // Handle appointment created successfully
  const handleAppointmentCreated = () => {
    // Refresh the appointment list by calling onRefresh
    onRefresh?.()
  }

  // Define columns based on mode
  const getColumns = () => {
    const baseColumns = [
      {
        key: "appointmentId",
        header: "Appointment",
        render: (appointment: Appointment) => (
          <div className="space-y-1">
            <div className="font-medium">{appointment.appointmentId}</div>
            <div className="text-xs text-blue-600 font-mono">ID: {appointment._id.slice(-8)}</div>
          </div>
        ),
      },
      {
        key: "visitorName",
        header: "Visitor",
        render: (appointment: Appointment) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={appointment.visitor?.photo} alt={appointment.visitor?.name || "Visitor"} />
              <AvatarFallback>
                {(appointment.visitor?.name || "V").split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{appointment.visitor?.name || "N/A"}</div>
              <div className="text-sm text-gray-500">{appointment.visitor?.designation || "N/A"}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="h-3 w-3" />
                {appointment.visitor?.phone || "N/A"}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "employeeName",
        header: "Meeting With",
        render: (appointment: Appointment) => {
          // Handle case where employeeId might be an object or string
          let employeeName = "N/A"
          if (typeof appointment.employeeId === 'string') {
            employeeName = appointment.employeeId
          } else if (typeof appointment.employeeId === 'object' && appointment.employeeId !== null) {
            employeeName = (appointment.employeeId as any).name || (appointment.employeeId as any).employeeId || "N/A"
          }
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3 w-3" />
                {employeeName}
              </div>
            </div>
          )
        },
      },
      {
        key: "purpose",
        header: "Purpose",
        render: (appointment: Appointment) => (
          <div className="space-y-1">
            <div className="text-sm max-w-[200px] truncate" title={appointment.appointmentDetails?.purpose || "N/A"}>
              {appointment.appointmentDetails?.purpose || "N/A"}
            </div>
            {appointment.visitor?.company && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Building className="h-3 w-3" />
                {appointment.visitor.company}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "appointmentDate",
        header: "Date & Time",
        render: (appointment: Appointment) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3" />
              {appointment.appointmentDetails?.scheduledDate ? format(new Date(appointment.appointmentDetails.scheduledDate), "MMM dd, yyyy") : "N/A"}
            </div>
            <div className="text-xs text-gray-500">{appointment.appointmentDetails?.scheduledTime || "N/A"}</div>
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
                  <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {appointment.status === 'pending' && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => handleApprove(appointment._id)}
                        disabled={isApprovingMutation}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleReject(appointment._id)}
                        disabled={isRejectingMutation}
                        className="text-destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  {(appointment.status === 'pending' || appointment.status === 'approved') && onCancel && (
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowCancelDialog(true)
                      }}
                      disabled={isCancelling}
                      className="text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  )}
                  {appointment.status === 'approved' && onCheckOut && (
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
      <div className="space-y-6">
        <Card className="card-hostinger p-4">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load appointments</p>
              <Button onClick={onRefresh} className="btn-hostinger btn-hostinger-primary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="card-hostinger p-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Calendar className="h-5 w-5" />
                {title || (mode === 'active' ? 'Appointment Management' : 'Deleted Appointments')}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'active' ? 'Manage and view all scheduled appointments' : 'View and restore deleted appointments'}
                {pagination && ` (${pagination.totalAppointments} total appointments)`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {mode === 'active' && (
                <NewAppointmentModal 
                  onSuccess={handleAppointmentCreated}
                  trigger={
                    <Button className="btn-hostinger btn-hostinger-primary flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Schedule Appointment
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Table */}
      <Card className="card-hostinger p-4 ">
        <CardHeader className="pb-4">
            <SearchInput
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={onSearchChange}
              debounceDelay={500}
            />
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={appointments}
            columns={getColumns()}
            emptyMessage={`No ${mode === 'active' ? 'appointments' : 'deleted appointments'} found. Try adjusting your search criteria.`}
            emptyData={{
              title: mode === 'active' ? 'No appointments yet' : 'No deleted appointments',
              description: mode === 'active'
                ? 'Get started by scheduling your first appointment.'
                : 'Trash is empty.',
              primaryActionLabel: mode === 'active' ? 'Schedule Appointment' : undefined,
            }}
            onPrimaryAction={mode === 'active' ? () => {
              // This will be handled by the modal trigger
            } : undefined}
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
            totalItems={pagination.totalAppointments}
            pageSize={pageSize}
            onPageChange={onPageChange}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
          />
        </div>
      )}

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


      {mode === 'active' && onApprove && (
        <ConfirmationDialog
          open={showApproveDialog}
          onOpenChange={setShowApproveDialog}
          title="Approve Appointment"
          description={`Are you sure you want to approve appointment ${selectedAppointment?.appointmentId}? This will change the status to approved.`}
          onConfirm={() => selectedAppointment && handleApprove(selectedAppointment._id)}
          confirmText={isApproving ? "Approving..." : "Approve"}
          variant="default"
        />
      )}

      {mode === 'active' && onCancel && (
        <ConfirmationDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          title="Cancel Appointment"
          description={`Are you sure you want to cancel appointment ${selectedAppointment?.appointmentId}? This will change the status to cancelled and cannot be undone.`}
          onConfirm={handleCancel}
          confirmText={isCancelling ? "Cancelling..." : "Cancel"}
          variant="destructive"
        />
      )}

      {mode === 'active' && onCheckOut && (
        <CheckOutDialog
          appointment={selectedAppointment}
          open={showCheckOutDialog}
          onClose={() => setShowCheckOutDialog(false)}
          onConfirm={handleCheckOut}
          isLoading={isCheckingOut}
        />
      )}

      {/* View Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        mode={mode}
        open={showViewDialog}
        on_close={() => setShowViewDialog(false)}
      />

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <NewAppointmentModal
          appointmentId={editingAppointment._id}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleAppointmentUpdated}
        />
      )}
    </div>
  )
}