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
  formatDateTime, 
  formatName, 
  getInitials, 
  getAppointmentStatus, 
  getAppointmentDateTime, 
  isAppointmentTimedOut 
} from "@/utils/helpers"
import { 
  Trash2, 
  Eye,
  RotateCcw,
  Clock,
  LogOut,
  Calendar,
  MoreVertical,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  Building,
  CheckCircle,
  X,
  Edit
} from "lucide-react"
import { Appointment } from "@/store/api/appointmentApi"
import { 
  useApproveAppointmentMutation, 
  useRejectAppointmentMutation 
} from "@/store/api/appointmentApi"
import { SearchInput } from "@/components/common/searchInput"
import DateRangePicker from "@/components/common/dateRangePicker"
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
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useGetTrialLimitsStatusQuery } from "@/store/api/userSubscriptionApi"

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
  isDeleting?: boolean
  isRestoring?: boolean
  isCheckingOut?: boolean
  isApproving?: boolean
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
  isDeleting = false,
  isRestoring = false,
  isCheckingOut = false,
  isApproving = false,
  onRefresh,
  showHeader = true,
  title,
  onDateFromChange,
  onDateToChange,
}: AppointmentTableProps) {
  const router = useRouter()
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const { data: trialStatus, refetch: refetchTrialLimits } = useGetTrialLimitsStatusQuery()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  const [approveAppointment, { isLoading: isApprovingMutation }] = useApproveAppointmentMutation()
  const [rejectAppointment, { isLoading: isRejectingMutation }] = useRejectAppointmentMutation()
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  const [loadingAppointments, setLoadingAppointments] = useState<Set<string>>(new Set())

  const setAppointmentLoading = (appointmentId: string, isLoading: boolean) => {
    setLoadingAppointments(prev => {
      const newSet = new Set(prev)
      if (isLoading) {
        newSet.add(appointmentId)
      } else {
        newSet.delete(appointmentId)
      }
      return newSet
    })
  }

  const isAppointmentLoading = (appointmentId: string) => {
    return loadingAppointments.has(appointmentId)
  }

  const hasReachedAppointmentLimit = trialStatus?.data?.isTrial && trialStatus.data.limits.appointments.reached
  const emptyPrimaryLabel = mode === 'active'
    ? hasReachedAppointmentLimit ? 'Upgrade Plan' : 'Schedule Appointment'
    : undefined

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
    setAppointmentLoading(appointmentId, true)
    try {
      await onCheckOut(appointmentId, notes)
      setShowCheckOutDialog(false)
      setSelectedAppointment(null)
    } finally {
      setAppointmentLoading(appointmentId, false)
    }
  }

  const handleApprove = async (appointmentId: string) => {
    setAppointmentLoading(appointmentId, true)
    try {
      await approveAppointment(appointmentId).unwrap()
      showSuccessToast('Appointment approved successfully!')
      onApprove?.(appointmentId)
      onRefresh?.() // Refresh the list after approval
    } catch (error) {
      showErrorToast('Failed to approve appointment')
    } finally {
      setAppointmentLoading(appointmentId, false)
    }
  }

  const handleReject = async (appointmentId: string) => {
    setAppointmentLoading(appointmentId, true)
    try {
      await rejectAppointment(appointmentId).unwrap()
      showSuccessToast('Appointment rejected successfully!')
      onRefresh?.() // Refresh the list after rejection
    } catch (error) {
      showErrorToast('Failed to reject appointment')
    } finally {
      setAppointmentLoading(appointmentId, false)
    }
  }

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowViewDialog(true)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointmentId(appointment._id)
    setShowNewAppointmentModal(true)
  }


  // Using common functions from utils/helpers
  const isAppointmentDatePast = (appointment: Appointment): boolean => {
    const scheduledDateTime = getAppointmentDateTime(appointment)
    if (!scheduledDateTime) return false
    const now = new Date()
    return scheduledDateTime < now
  }

  const handleAppointmentCreated = () => {
    setEditingAppointmentId(null)
    setShowNewAppointmentModal(false)
    onRefresh?.()
    refetchTrialLimits()
  }

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
        render: (appointment: Appointment) => {
          const visitor = (appointment as any).visitorId || appointment.visitor;
          const visitorNameRaw = visitor?.name || "Unknown Visitor";
          const visitorName = formatName(visitorNameRaw) || visitorNameRaw;
          const visitorPhone = visitor?.phone || "N/A";
          const visitorEmail = visitor?.email || "N/A";
          const visitorCompany = visitor?.company || "";
          // Get photo from visitor object, handle both populated and non-populated cases
          const visitorPhoto = visitor?.photo || (visitor as any)?.profilePicture || "";
          
          return (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage 
                  src={visitorPhoto} 
                  alt={visitorName}
                  onError={(e) => {
                    // Hide image on error, fallback will show
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback>
                  {getInitials(visitorName, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{visitorName}</div>
                {visitorEmail !== "N/A" && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{visitorEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{visitorPhone}</span>
                </div>
                {visitorCompany && (
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{visitorCompany}</div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "employeeName",
        header: "Meeting With",
        render: (appointment: Appointment) => {
          const employee = (appointment as any).employeeId || appointment.employee;
          const employeeNameRaw = employee?.name || "Unknown Employee";
          const employeeName = formatName(employeeNameRaw) || employeeNameRaw;
          const employeeEmail = employee?.email || "N/A";
          const employeeDepartment = employee?.department || "";
          
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(employeeName, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{employeeName}</div>
                <div className="text-sm text-gray-500">{employeeDepartment || "N/A"}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="h-3 w-3" />
                  {employeeEmail}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "purpose",
        header: "Purpose",
        render: (appointment: Appointment) => {
          const visitor = (appointment as any).visitorId || appointment.visitor;
          return (
            <div className="space-y-1">
              <div className="text-sm max-w-[200px] truncate" title={appointment.appointmentDetails?.purpose || "N/A"}>
                {appointment.appointmentDetails?.purpose || "N/A"}
              </div>
              {appointment.appointmentDetails?.meetingRoom && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Building className="h-3 w-3" />
                  {appointment.appointmentDetails.meetingRoom}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "appointmentDate",
        header: "Date & Time",
        render: (appointment: Appointment) => {
          const dateTime = formatDateTime(
            appointment.appointmentDetails?.scheduledDate || "",
            appointment.appointmentDetails?.scheduledTime
          )
          return (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span>{dateTime || "N/A"}</span>
            </div>
          )
        },
      },
      {
        key: "status",
        header: "Status",
        render: (appointment: Appointment) => {
          if (isAppointmentLoading(appointment._id)) {
            return (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Processing...</span>
              </div>
            )
          }
          
          const effectiveStatus = getAppointmentStatus(appointment) as "pending" | "approved" | "rejected" | "completed" | "time_out"
          return <StatusBadge status={effectiveStatus} />
        },
      },
    ]

    if (mode === 'trash') {
      baseColumns.push({
        key: "deletedAt",
        header: "Deleted At",
        render: (appointment: Appointment) => (
          <div className="text-sm">
            <div>{(() => {
              const date = new Date(appointment.deletedAt!);
              return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM dd, yyyy");
            })()}</div>
            <div className="text-muted-foreground">
              {(() => {
                const date = new Date(appointment.deletedAt!);
                return isNaN(date.getTime()) ? "Invalid Time" : format(date, "HH:mm");
              })()}
            </div>
          </div>
        ),
      })
    }

    baseColumns.push({
      key: "actions",
      header: "Actions",
      render: (appointment: Appointment) => {
        const status = typeof appointment.status === 'string' ? appointment.status : 'pending'
        const isTimedOut = isAppointmentTimedOut(appointment)
        const isPending = status === 'pending' && !isTimedOut
        const isApproved = status === 'approved'
        const isRejected = status === 'rejected'
        const isCompleted = status === 'completed'
        
        const showOnlyView = isRejected || isCompleted
        
        return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {mode === 'active' && (
                <>
                  {onView && (
                    <DropdownMenuItem onClick={() => handleView(appointment)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  )}
                    
                  {isPending && (
                    <>
                      <DropdownMenuSeparator />
                      {onApprove && (
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowApproveDialog(true)
                          }}
                          disabled={isAppointmentLoading(appointment._id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowRejectDialog(true)
                        }}
                        disabled={isAppointmentLoading(appointment._id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {isApproved && onCheckOut && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowCheckOutDialog(true)
                        }}
                        disabled={isAppointmentLoading(appointment._id)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Check Out
                      </DropdownMenuItem>
                    </>
                  )}
                    
                  {showOnlyView && (
                    null
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
        )
      },
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
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-hostinger p-3 sm:p-4">
        <CardHeader className="pb-3 sm:pb-4 px-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{title || (mode === 'active' ? 'Appointment Management' : 'Deleted Appointments')}</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                {mode === 'active' ? 'Manage and view all scheduled appointments' : 'View and restore deleted appointments'}
                {pagination && ` (${pagination.totalAppointments} total)`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button 
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {mode === 'active' && (
                <>
                  {hasReachedAppointmentLimit ? (
                    <>
                      <Button 
                        className="btn-hostinger btn-hostinger-primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        onClick={() => setShowUpgradeModal(true)}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Upgrade to Schedule More</span>
                        <span className="sm:hidden">Upgrade</span>
                      </Button>
                      <UpgradePlanModal 
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                      />
                    </>
                  ) : (
                    <NewAppointmentModal 
                      onSuccess={handleAppointmentCreated}
                      triggerButton={
                        <Button className="btn-hostinger btn-hostinger-primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Schedule Appointment</span>
                          <span className="sm:hidden">Schedule</span>
                        </Button>
                      }
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="card-hostinger p-3 sm:p-4 overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4 px-0">
            <div className="flex items-center justify-between gap-3">
              <SearchInput
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={onSearchChange}
                debounceDelay={500}
                className="w-full"
              />
              <DateRangePicker onDateRangeChange={(r) => { onDateFromChange?.(r.startDate || ""); onDateToChange?.(r.endDate || ""); onPageChange?.(1); }} />
            </div>
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
              primaryActionLabel: emptyPrimaryLabel,
            }}
            onPrimaryAction={mode === 'active' ? () => {
              if (hasReachedAppointmentLimit) {
                setShowUpgradeModal(true)
              } else {
                setShowNewAppointmentModal(true)
              }
            } : undefined}
            showCard={false}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

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
          onConfirm={() => {
            if (selectedAppointment) {
              handleApprove(selectedAppointment._id)
              setShowApproveDialog(false)
            }
          }}
          confirmText={isApprovingMutation || isAppointmentLoading(selectedAppointment?._id || '') ? "Approving..." : "Approve"}
          variant="default"
        />
      )}

      {mode === 'active' && (
        <ConfirmationDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          title="Reject Appointment"
          description={`Are you sure you want to reject appointment ${selectedAppointment?.appointmentId}? This will change the status to rejected.`}
          onConfirm={() => {
            if (selectedAppointment) {
              handleReject(selectedAppointment._id)
              setShowRejectDialog(false)
            }
          }}
          confirmText={isRejectingMutation || isAppointmentLoading(selectedAppointment?._id || '') ? "Rejecting..." : "Reject"}
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

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        mode={mode}
        open={showViewDialog}
        on_close={() => setShowViewDialog(false)}
      />

      {mode === 'active' && (
        <NewAppointmentModal
          appointmentId={editingAppointmentId || undefined}
          open={showNewAppointmentModal}
          onOpenChange={(open) => {
            setShowNewAppointmentModal(open)
            if (!open) {
              setEditingAppointmentId(null)
            }
          }}
          onSuccess={handleAppointmentCreated}
          triggerButton={<div />}
        />
      )}
    </div>
  )
}