"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/common/searchInput"
import DateRangePicker from "@/components/common/dateRangePicker"
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
  RefreshCw
} from "lucide-react"
import { 
  useGetVisitorsQuery, 
  useDeleteVisitorMutation,
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
import { routes } from "@/utils/routes"
import { NewVisitorModal } from "./NewVisitorModal"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useGetTrialLimitsStatusQuery } from "@/store/api/userSubscriptionApi"
import { VisitorDetailsDialog } from "./visitorDetailsDialog"
import { formatName, getInitials } from "@/utils/helpers"

const createColumns = (
  handleDeleteClick: (visitor: Visitor) => void, 
  handleEditVisitor: (visitor: Visitor) => void,
  handleViewVisitor: (visitor: Visitor) => void
) => [
  {
    key: "visitor",
    header: "Visitor",
    render: (visitor: Visitor) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={visitor.photo} alt={visitor.name} />
          <AvatarFallback>
            {getInitials(formatName(visitor.name) || visitor.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{formatName(visitor.name)}</div>
          {visitor.visitorId && (
            <div className="text-xs text-blue-600 font-mono">ID: {visitor.visitorId}</div>
          )}
        </div>
      </div>
    )
  },
  {
    key: "contact",
    header: "Contact",
    render: (visitor: Visitor) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3 w-3" />
          {visitor.phone}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Mail className="h-3 w-3" />
          {visitor.email}
        </div>
      </div>
    )
  },
  {
    key: "address",
    header: "Address",
    render: (visitor: Visitor) => (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MapPin className="h-3 w-3" />
        {visitor.address.city}, {visitor.address.state}
      </div>
    )
  },
  {
    key: "idProof",
    header: "ID Proof",
    render: (visitor: Visitor) => (
      <div className="space-y-1">
        <Badge variant="outline" className="text-xs">
          {visitor.idProof.type.replace('_', ' ').toUpperCase()}
        </Badge>
        <div className="text-xs text-gray-500">
          {visitor.idProof.number}
        </div>
      </div>
    )
  },
  {
    key: "createdAt",
    header: "Registered",
    render: (visitor: Visitor) => (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar className="h-3 w-3" />
        {new Date(visitor.createdAt).toLocaleDateString()}
      </div>
    )
  },
  {
    key: "actions",
    header: "Actions",
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
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('dateRange')
      return raw ? JSON.parse(raw) : { startDate: null, endDate: null }
    }
    return { startDate: null, endDate: null }
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null)
  const [showVisitorModal, setShowVisitorModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const { data: trialStatus, refetch: refetchTrialLimits } = useGetTrialLimitsStatusQuery()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])
  
  const queryParams: GetVisitorsQuery = {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm || undefined,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  }

  const { 
    data: visitorsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetVisitorsQuery(queryParams)
  
  const [deleteVisitor, { isLoading: isDeleting }] = useDeleteVisitorMutation()

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
      refetchTrialLimits()
    } catch (error: any) {
      showErrorToast(error?.data?.message || "Failed to delete visitor")
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleVisitorCreated = () => {
    setShowVisitorModal(false)
    refetch()
    refetchTrialLimits()
  }

  const handleOpenVisitorModal = () => {
    setShowVisitorModal(true)
  }

  const handleEditVisitor = (visitor: Visitor) => {
    setEditingVisitor(visitor)
  }

  const handleViewVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor)
    setShowViewDialog(true)
  }

  const handleVisitorUpdated = () => {
    setEditingVisitor(null)
    refetch()
  }

  const visitors = visitorsData?.visitors || []
  const pagination = visitorsData?.pagination
  const columns = createColumns(handleDeleteClick, handleEditVisitor, handleViewVisitor)
  const hasReachedVisitorLimit = trialStatus?.data?.isTrial && trialStatus.data.limits.visitors.reached
  const emptyPrimaryLabel = hasReachedVisitorLimit ? 'Upgrade Plan' : 'Register Visitor'
  const handlePrimaryAction = () => {
    if (hasReachedVisitorLimit) {
      setShowUpgradeModal(true)
    } else {
      handleOpenVisitorModal()
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
              <Button onClick={handleRefresh} className="btn-hostinger btn-hostinger-primary">
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
      <Card className="card-hostinger   p-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <User className="h-5 w-5" />
                Visitor Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage and view all registered visitors 
                {pagination && ` (${pagination.totalVisitors} total visitors)`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {hasReachedVisitorLimit ? (
                <>
                  <Button 
                    className="btn-hostinger btn-hostinger-primary flex items-center gap-2"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Upgrade to Add More
                  </Button>
                  <UpgradePlanModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                  />
                </>
              ) : (
                <NewVisitorModal 
                  onSuccess={handleVisitorCreated}
                  trigger={
                    <Button className="btn-hostinger btn-hostinger-primary flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Visitor
                    </Button>
                  }
                />
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
            <DateRangePicker onDateRangeChange={(r) => { setDateRange(r); setCurrentPage(1); }} />
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

      {/* Edit Visitor Modal */}
      <NewVisitorModal
        visitorId={editingVisitor?._id}
        open={!!editingVisitor}
        onOpenChange={(open) => !open && setEditingVisitor(null)}
        onSuccess={handleVisitorUpdated}
        trigger={<div />} // Hidden trigger since we control the modal programmatically
      />

      {/* Add Visitor Modal */}
      <NewVisitorModal
        open={showVisitorModal}
        onOpenChange={setShowVisitorModal}
        onSuccess={handleVisitorCreated}
        trigger={<div />} // Hidden trigger since we control the modal programmatically
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Visitor"
        description={`Are you sure you want to delete ${selectedVisitor?.name}? This will move the visitor to trash.`}
        onConfirm={handleDeleteVisitor}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="destructive"
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
