"use client"

import { useState, useMemo, useCallback } from "react"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { PageHeader } from "@/components/common/pageHeader"
import { DataTable } from "@/components/common/dataTable"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SelectField } from "@/components/common/selectField"
import { SearchInput } from "@/components/common/searchInput"
import { ConfirmationDialog } from "@/components/common/confirmationDialog"
import { Pagination } from "@/components/common/pagination"
import { useGetAllAppointmentLinksQuery, useDeleteAppointmentLinkMutation } from "@/store/api/appointmentLinkApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { format } from "date-fns"
import { Link2, Trash2, CheckCircle, XCircle, Copy, Mail, Phone, Calendar, Building } from "lucide-react"
import { AppointmentLink } from "@/store/api/appointmentLinkApi"
import { getInitials, formatName } from "@/utils/helpers"

export default function AppointmentLinksPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isBooked, setIsBooked] = useState<boolean | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null)

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
    navigator.clipboard.writeText(link.bookingUrl)
    showSuccessToast("Link copied to clipboard!")
  }, [])

  const columns = useMemo(
    () => [
      {
        key: "visitorEmail",
        header: "Visitor",
        render: (link: AppointmentLink) => {
          const visitorName = link.visitor?.name || "Unknown Visitor"
          const formattedName = formatName(visitorName) || visitorName
          const visitorEmail = link.visitorEmail
          const visitorPhone = link.visitor?.phone || "N/A"
          const visitorPhoto = link.visitor?.photo || ""
          
          return (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 shrink-0">
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
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{formattedName}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{visitorEmail}</span>
                </div>
                {visitorPhone !== "N/A" && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{visitorPhone}</span>
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
        render: (link: AppointmentLink) => {
          if (!link.employee) {
            return <span className="text-gray-400">N/A</span>
          }
          
          const employeeNameRaw = link.employee.name || "Unknown Employee"
          const employeeName = formatName(employeeNameRaw) || employeeNameRaw
          const employeeEmail = link.employee.email || "N/A"
          
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(employeeName, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{employeeName}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="h-3 w-3" />
                  {employeeEmail}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        key: "status",
        header: "Status",
        render: (link: AppointmentLink) => (
          <Badge
            variant={link.isBooked ? "default" : "secondary"}
            className={link.isBooked ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
          >
            {link.isBooked ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Booked
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Not Booked
              </>
            )}
          </Badge>
        ),
      },
      {
        key: "expiresAt",
        header: "Expires At",
        render: (link: AppointmentLink) => (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{format(new Date(link.expiresAt), "MMM dd, yyyy")}</span>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Created At",
        render: (link: AppointmentLink) => (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
            <span>{format(new Date(link.createdAt), "MMM dd, yyyy HH:mm")}</span>
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
    { value: "false", label: "Not Booked" },
  ]

  const handleFilterChange = useCallback((value: string) => {
    if (value === "all") {
      setIsBooked(undefined)
    } else {
      setIsBooked(value === "true")
    }
    setPage(1)
  }, [])

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-hostinger">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Total Links</p>
                <p className="text-2xl font-bold">{data.stats.totalBooked + data.stats.totalNotBooked}</p>
              </CardContent>
            </Card>
            <Card className="card-hostinger">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.totalBooked}</p>
              </CardContent>
            </Card>
            <Card className="card-hostinger">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Not Booked</p>
                <p className="text-2xl font-bold text-yellow-600">{data.stats.totalNotBooked}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="card-hostinger p-3 sm:p-4 overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 px-0">
            <div className="flex items-center justify-between gap-3">
              <SearchInput
                placeholder="Search appointments..."
                value={search}
                onChange={setSearch}
                debounceDelay={500}
                className="w-full"
              />
              <div className="w-full sm:w-48">
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
                description: "Create your first appointment link from the appointments page.",
              }}
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
    </ProtectedLayout>
  )
}


