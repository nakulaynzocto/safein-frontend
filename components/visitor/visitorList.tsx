"use client"

import { useState, useEffect, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { routes } from "@/utils/routes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/common/searchInput"
import { DataTable } from "@/components/common/dataTable"
import { Pagination } from "@/components/common/pagination"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmationDialog } from "@/components/common/confirmationDialog"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  MoreVertical,
  RefreshCw,
  Maximize2
} from "lucide-react"
import {
  useGetVisitorsQuery,
  useDeleteVisitorMutation,
  useCheckVisitorHasAppointmentsQuery,
  Visitor,
  GetVisitorsQuery
} from "@/store/api/visitorApi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { useRouter } from "next/navigation"
import { NewVisitorModal } from "./VisitorForm"
import { formatDate } from "@/utils/helpers"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus"
import { VisitorDetailsDialog } from "./visitorDetailsDialog"

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

const createColumns = (
  handleDeleteClick: (visitor: Visitor) => void,
  handleEditVisitor: (visitor: Visitor) => void,
  handleViewVisitor: (visitor: Visitor) => void
) => [
    {
      key: "visitor",
      header: "Visitor",
      render: (visitor: Visitor) => (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative group shrink-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={visitor.photo} alt={visitor.name} />
              <AvatarFallback className="text-xs sm:text-sm">
                {visitor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {visitor.photo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(visitor.photo, '_blank');
                }}
                className="absolute -bottom-1 -right-1 bg-[#3882a5] text-white rounded-full p-1 shadow-md hover:bg-[#2d6a87] transition-colors opacity-0 group-hover:opacity-100"
                title="View full image"
              >
                <Maximize2 className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-[150px]">
              {visitor.name}
            </div>
            {visitor.email && (
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-[120px]" title={visitor.email}>
                {truncateText(visitor.email, 20)}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: "contact",
      header: "Contact",
      render: (visitor: Visitor) => (
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{visitor.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-[150px]" title={visitor.email}>
              {truncateText(visitor.email, 12)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "address",
      header: "Address",
      className: "hidden lg:table-cell",
      render: (visitor: Visitor) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{visitor.address.city}, {visitor.address.state}</span>
        </div>
      )
    },
    {
      key: "idProof",
      header: "ID Proof",
      className: "hidden md:table-cell",
      render: (visitor: Visitor) => (
        visitor.idProof?.type || visitor.idProof?.number ? (
          <div className="space-y-1">
            {visitor.idProof.type && (
              <Badge variant="outline" className="text-xs">
                {visitor.idProof.type.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
            {visitor.idProof.number && (
              <div className="text-xs text-gray-500 truncate max-w-[100px]">
                {visitor.idProof.number}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      )
    },
    {
      key: "createdAt",
      header: "Registered",
      className: "hidden xl:table-cell",
      render: (visitor: Visitor) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-3 w-3 shrink-0" />
          {formatDate(visitor.createdAt)}
        </div>
      )
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      render: (visitor: Visitor) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleViewVisitor(visitor)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditVisitor(visitor)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteClick(visitor)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

export function VisitorList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const { hasReachedVisitorLimit, refetch: refetchSubscriptionStatus } = useSubscriptionStatus()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const queryParams: GetVisitorsQuery = {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm || undefined,
  }

  const {
    data: visitorsData,
    isLoading,
    error,
    refetch
  } = useGetVisitorsQuery(queryParams)

  const [deleteVisitor, { isLoading: isDeleting }] = useDeleteVisitorMutation()

  const visitorId = selectedVisitor?._id || ''
  const shouldCheckAppointments = Boolean(selectedVisitor && showDeleteDialog)

  const { data: appointmentCheck } = useCheckVisitorHasAppointmentsQuery(visitorId, {
    skip: !shouldCheckAppointments,
  })

  const disabledMessage = useMemo(() => {
    if (!appointmentCheck?.hasAppointments) return undefined
    return `Cannot delete visitor. ${appointmentCheck.count} appointment(s) have been created with this visitor. Please delete or reassign the appointments first.`
  }, [appointmentCheck])

  const handleDeleteClick = (visitor: Visitor) => {
    setSelectedVisitor(visitor)
    setShowDeleteDialog(true)
  }

  const handleDeleteVisitor = async () => {
    if (!selectedVisitor) return

    try {
      await deleteVisitor(selectedVisitor._id).unwrap()
      showSuccessToast("Visitor deleted successfully!")
      setShowDeleteDialog(false)
      setSelectedVisitor(null)
      refetch()
      refetchSubscriptionStatus()
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to delete visitor")
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleEditVisitor = (visitor: Visitor) => {
    router.push(routes.privateroute.VISITOREDIT.replace("[id]", visitor._id))
  }

  const handleViewVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor)
    setShowViewDialog(true)
  }


  const visitors = visitorsData?.visitors || []
  const pagination = visitorsData?.pagination
  const columns = createColumns(handleDeleteClick, handleEditVisitor, handleViewVisitor)
  const emptyPrimaryLabel = hasReachedVisitorLimit ? 'Upgrade Plan' : 'Register Visitor'
  const handlePrimaryAction = () => {
    if (hasReachedVisitorLimit) {
      setShowUpgradeModal(true)
    } else {
      router.push(routes.privateroute.VISITORREGISTRATION)
    }
  }

  if (error) {
    const errorMessage = (error as any)?.data?.message ||
      (error as any)?.error ||
      'Failed to load visitors'

    return (
      <div className="space-y-6">
        <Card className="card-hostinger p-4">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load visitors</p>
              <p className="text-sm text-gray-500 mb-4">{errorMessage}</p>
              <Button onClick={handleRefresh} variant="outline">
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
      <Card className="card-hostinger p-3 sm:p-4">
        <CardHeader className="pb-3 sm:pb-4 px-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold flex-1 min-w-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="truncate">Visitors</span>
            </CardTitle>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {hasReachedVisitorLimit ? (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 h-8 sm:h-9 whitespace-nowrap shrink-0"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden min-[375px]:inline sm:hidden">Upgrade</span>
                    <span className="hidden sm:inline">Upgrade to Add More</span>
                  </Button>
                  <UpgradePlanModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                  />
                </>
              ) : (
                <Button
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 h-8 sm:h-9 whitespace-nowrap shrink-0"
                  onClick={() => router.push(routes.privateroute.VISITORREGISTRATION)}
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="hidden min-[375px]:inline">Add Visitor</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visitors Table */}
      <Card className="card-hostinger p-4">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 justify-between">
            <SearchInput
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={setSearchTerm}
              debounceDelay={500}
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={visitors}
            columns={columns}
            emptyMessage="No visitors found. Try adjusting your search criteria."
            emptyData={{
              title: 'No visitors yet',
              description: 'Register your first visitor to get started.',
              primaryActionLabel: emptyPrimaryLabel,
            }}
            onPrimaryAction={handlePrimaryAction}
            showCard={false}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalVisitors}
            pageSize={10}
            onPageChange={setCurrentPage}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
          />
        </div>
      )}


      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Visitor"
        description={`Are you sure you want to delete ${selectedVisitor?.name}?`}
        onConfirm={handleDeleteVisitor}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="destructive"
        disabled={appointmentCheck?.hasAppointments || false}
        disabledMessage={disabledMessage}
      />

      {/* View Visitor Details Dialog */}
      <VisitorDetailsDialog
        visitor={selectedVisitor}
        open={showViewDialog}
        onClose={() => {
          setShowViewDialog(false)
          setSelectedVisitor(null)
        }}
      />
    </div>
  )
}
