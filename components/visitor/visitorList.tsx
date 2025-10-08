"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/common/searchInput"
import { DataTable } from "@/components/common/dataTable"
import { Pagination } from "@/components/common/pagination"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Building,
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { routes } from "@/utils/routes"

// Define columns outside component to avoid recreation
const createColumns = (handleDeleteVisitor: (id: string) => void) => [
  {
    key: "visitor",
    header: "Visitor",
    render: (visitor: Visitor) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={visitor.photo} alt={visitor.name} />
          <AvatarFallback>
            {visitor.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{visitor.name}</div>
          <div className="text-sm text-gray-500">{visitor.designation}</div>
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
    key: "company",
    header: "Company",
    render: (visitor: Visitor) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Building className="h-3 w-3" />
          {visitor.company}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-3 w-3" />
          {visitor.address.city}, {visitor.address.state}
        </div>
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
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteVisitor(visitor._id)}
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // API query parameters
  const queryParams: GetVisitorsQuery = {
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm || undefined,
  }

  // API hooks
  const { 
    data: visitorsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetVisitorsQuery(queryParams)
  
  const [deleteVisitor] = useDeleteVisitorMutation()

  // Handle delete visitor
  const handleDeleteVisitor = async (visitorId: string) => {
    try {
      await deleteVisitor(visitorId).unwrap()
      toast.success("Visitor deleted successfully!")
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete visitor")
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    refetch()
  }

  // Handle add visitor
  const handleAddVisitor = () => {
    router.push(routes.privateroute.VISITORREGISTRATION)
  }

  const visitors = visitorsData?.visitors || []
  const pagination = visitorsData?.pagination
  
  // Create columns with delete handler
  const columns = createColumns(handleDeleteVisitor)

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="card-hostinger p-4">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load visitors</p>
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
              <Button 
                onClick={handleAddVisitor}
                className="btn-hostinger btn-hostinger-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Visitor
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visitors Table */}
      <Card className="card-hostinger p-4">
        <CardHeader className="pb-4">
            <SearchInput
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={setSearchTerm}
              onDebouncedChange={setDebouncedSearchTerm}
              debounceDelay={500}
            />
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={visitors}
            columns={columns}
            emptyMessage="No visitors found. Try adjusting your search criteria."
            emptyData={{
              title: 'No visitors yet',
              description: 'Register your first visitor to get started.',
              primaryActionLabel: 'Register Visitor',
            }}
            onPrimaryAction={handleAddVisitor}
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
    </div>
  )
}
