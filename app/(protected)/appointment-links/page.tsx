"use client"

import { useState, useMemo, useCallback } from "react"

import { DataTable } from "@/components/common/dataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SelectField } from "@/components/common/selectField"
import { SearchInput } from "@/components/common/searchInput"
import { ConfirmationDialog } from "@/components/common/confirmationDialog"
import { Pagination } from "@/components/common/pagination"
import { useGetAllAppointmentLinksQuery, useDeleteAppointmentLinkMutation } from "@/store/api/appointmentLinkApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { formatDate, formatDateTime } from "@/utils/helpers"
import { Link2, Trash2, CheckCircle, XCircle, Copy, Mail, Phone, Calendar, Maximize2 } from "lucide-react"
import { AppointmentLink } from "@/store/api/appointmentLinkApi"
import { getInitials, formatName } from "@/utils/helpers"
import { CreateAppointmentLinkModal } from "@/components/appointment/CreateAppointmentLinkModal"
import { PageSkeleton } from "@/components/common/pageSkeleton"

export default function AppointmentLinksPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isBooked, setIsBooked] = useState<boolean | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data, isLoading, error, refetch } = useGetAllAppointmentLinksQuery({
    page,
    limit,
    isBooked,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const [deleteAppointmentLink, { isLoading: isDeleting }] = useDeleteAppointmentLinkMutation()


  const handleDelete = useCallback(async () => {
    if (!deleteLinkId) return

    try {
      await deleteAppointmentLink(deleteLinkId).unwrap()
      showSuccessToast("Appointment link deleted successfully")
      setDeleteLinkId(null)
      refetch()
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Failed to delete appointment link"
      showErrorToast(message)
    }
  }, [deleteLinkId, deleteAppointmentLink, refetch])

  const handleCopyLink = useCallback((link: AppointmentLink) => {
    // Generate booking URL if not provided by backend
    const bookingUrl = link.bookingUrl || `${window.location.origin}/book-appointment/${link.secureToken}`

    if (!bookingUrl) {
      showErrorToast("Unable to generate booking link")
      return
    }

    navigator.clipboard.writeText(bookingUrl)
    showSuccessToast("Link copied to clipboard!")
  }, [])

  const columns = useMemo(
    () => [
      {
        key: "visitorEmail",
        header: "Visitor",
        render: (link: AppointmentLink) => {
          // Check if visitorId is populated (object) or use visitor field
          const visitorId = (link as any).visitorId
          const visitor = link.visitor || (typeof visitorId === 'object' && visitorId !== null ? visitorId : null)

          const visitorName = visitor?.name || "Unknown Visitor"
          const formattedName = formatName(visitorName) || visitorName
          const visitorEmail = link.visitorEmail
          const visitorPhone = visitor?.phone || "N/A"
          const visitorPhoto = visitor?.photo || ""

          return (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="relative group shrink-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage
                    src={visitorPhoto}
                    alt={formattedName}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <AvatarFallback>
                    {getInitials(formattedName, 2)}
                  </AvatarFallback>
                </Avatar>
                {visitorPhoto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(visitorPhoto, '_blank');
                    }}
                    className="absolute -bottom-1 -right-1 bg-[#3882a5] text-white rounded-full p-1 shadow-md hover:bg-[#2d6a87] transition-colors opacity-0 group-hover:opacity-100"
                    title="View full image"
                  >
                    <Maximize2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate text-sm sm:text-base">{formattedName}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{visitorEmail}</span>
                </div>
                {visitorPhone !== "N/A" && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{visitorPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        key: "employee",
        header: "Meeting With",
        className: "hidden lg:table-cell",
        render: (link: AppointmentLink) => {
          // Check if employeeId is populated (object) or use employee field
          const employeeId = (link as any).employeeId
          const employee = link.employee || (typeof employeeId === 'object' && employeeId !== null ? employeeId : null)

          if (!employee || typeof employee === 'string') {
            return <span className="text-gray-400">N/A</span>
          }

          const employeeNameRaw = employee.name || "Unknown Employee"
          const employeeName = formatName(employeeNameRaw) || employeeNameRaw
          const employeeEmail = employee.email || "N/A"

          return (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                <AvatarFallback className="bg-accent/10 text-accent">
                  {getInitials(employeeName, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate text-sm sm:text-base">{employeeName}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{employeeEmail}</span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        key: "status",
        header: "Status",
        className: "hidden sm:table-cell",
        render: (link: AppointmentLink) => (
          <Badge
            variant={link.isBooked ? "default" : "secondary"}
            className={`text-xs sm:text-sm border ${link.isBooked ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
          >
            {link.isBooked ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1 shrink-0" />
                <span className="whitespace-nowrap">Booked</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1 shrink-0" />
                <span className="whitespace-nowrap">Pending</span>
              </>
            )}
          </Badge>
        ),
      },
      {
        key: "expiresAt",
        header: "Expires At",
        className: "hidden md:table-cell",
        render: (link: AppointmentLink) => (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="whitespace-nowrap">{formatDate(link.expiresAt)}</span>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Created At",
        className: "hidden xl:table-cell",
        render: (link: AppointmentLink) => (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="whitespace-nowrap">{formatDateTime(link.createdAt)}</span>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (link: AppointmentLink) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyLink(link)}
              title="Copy link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteLinkId(link._id)}
              className="text-red-600 hover:text-red-700"
              title="Delete link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleCopyLink]
  )

  const filterOptions = [
    { value: "all", label: "All Links" },
    { value: "true", label: "Booked" },
    { value: "false", label: "Pending" },
  ]

  const handleFilterChange = useCallback((value: string) => {
    if (value === "all") {
      setIsBooked(undefined)
    } else {
      setIsBooked(value === "true")
    }
    setPage(1)
  }, [])

  if (isLoading) {
    return <PageSkeleton />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <Card className="card-hostinger p-3 sm:p-4">
        <CardHeader className="pb-3 sm:pb-4 px-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold flex-1 min-w-0">
              <Link2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="truncate">Appointment Links</span>
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <CreateAppointmentLinkModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                triggerButton={
                  <Button variant="outline" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9 whitespace-nowrap w-full sm:w-auto">
                    <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden min-[375px]:inline">Create Link</span>
                    <span className="min-[375px]:hidden">Create</span>
                  </Button>
                }
                onSuccess={() => {
                  refetch()
                  setShowCreateModal(false)
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="card-hostinger">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Links</p>
                  <p className="text-xl sm:text-2xl font-bold text-accent">{data.stats.totalBooked + data.stats.totalNotBooked}</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hostinger">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Booked</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">{data.stats.totalBooked}</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hostinger">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-800">{data.stats.totalNotBooked}</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-800" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table Card */}
      <Card className="card-hostinger p-4 overflow-hidden">
        <CardHeader className="pb-4 px-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <SearchInput
                placeholder="Search by visitor email or name..."
                value={search}
                onChange={setSearch}
                debounceDelay={500}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48 shrink-0">
              <SelectField
                value={isBooked === undefined ? "all" : isBooked ? "true" : "false"}
                onChange={handleFilterChange}
                options={filterOptions}
                placeholder="Filter by status"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={data?.links || []}
            columns={columns}
            isLoading={isLoading}
            showCard={false}
            emptyData={{
              title: "No appointment links found",
              description: "Create your first appointment link to get started.",
              primaryActionLabel: "Create Appointment Link",
            }}
            onPrimaryAction={() => setShowCreateModal(true)}
          />
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalItems={data.pagination.total}
            pageSize={data.pagination.limit}
            onPageChange={setPage}
            hasNextPage={data.pagination.page < data.pagination.totalPages}
            hasPrevPage={data.pagination.page > 1}
          />
        </div>
      )}

      <ConfirmationDialog
        open={!!deleteLinkId}
        onOpenChange={(open) => !open && setDeleteLinkId(null)}
        onConfirm={handleDelete}
        title="Delete Appointment Link"
        description="Are you sure you want to delete this appointment link? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}


