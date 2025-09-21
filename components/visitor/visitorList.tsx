"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { DataTable } from "@/components/common/dataTable"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Filter, 
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
  MoreVertical
} from "lucide-react"
import { VisitorDetails } from "@/store/api/appointmentApi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"

// Mock visitor data - replace with actual API call
const mockVisitors: VisitorDetails[] = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    company: "Tech Corp",
    designation: "Software Engineer",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001"
    },
    idProof: {
      type: "passport",
      number: "P123456789",
      image: "/placeholder.jpg"
    },
    photo: "/placeholder-user.jpg"
  },
  {
    name: "Jane Smith",
    email: "jane.smith@company.com",
    phone: "+1987654321",
    company: "Design Studio",
    designation: "UI/UX Designer",
    address: {
      street: "456 Oak Ave",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      zipCode: "94102"
    },
    idProof: {
      type: "driving_license",
      number: "DL987654321",
      image: "/placeholder.jpg"
    },
    photo: "/placeholder-user.jpg"
  },
  {
    name: "Mike Johnson",
    email: "mike.johnson@business.com",
    phone: "+1555123456",
    company: "Business Solutions",
    designation: "Project Manager",
    address: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      country: "USA",
      zipCode: "60601"
    },
    idProof: {
      type: "aadhaar",
      number: "123456789012",
      image: "/placeholder.jpg"
    },
    photo: "/placeholder-user.jpg"
  }
]

const columns = [
  {
    key: "visitor",
    header: "Visitor",
    render: (visitor: VisitorDetails) => (
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
        </div>
      </div>
    )
  },
  {
    key: "contact",
    header: "Contact",
    render: (visitor: VisitorDetails) => (
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
    render: (visitor: VisitorDetails) => (
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
    render: (visitor: VisitorDetails) => (
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
    key: "actions",
    header: "Actions",
    render: (visitor: VisitorDetails) => (
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
            <DropdownMenuItem className="text-destructive">
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
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCompany, setFilterCompany] = useState("")
  const [visitors] = useState<VisitorDetails[]>(mockVisitors)

  // Get unique companies for filter
  const companies = Array.from(new Set(visitors.map(v => v.company)))

  // Filter visitors based on search and filter
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = 
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.phone.includes(searchTerm) ||
      visitor.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCompany = !filterCompany || visitor.company === filterCompany
    
    return matchesSearch && matchesCompany
  })

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="card-hostinger">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <User className="h-5 w-5" />
                Visitor Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage and view all registered visitors ({filteredVisitors.length} visitors)
              </p>
            </div>
            <Button className="btn-hostinger btn-hostinger-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Visitor
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card className="card-hostinger">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Search Visitors"
              placeholder="Search by name, email, phone, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SelectField
              label="Filter by Company"
              placeholder="All Companies"
              options={[
                { value: "", label: "All Companies" },
                ...companies.map(company => ({ value: company, label: company }))
              ]}
              value={filterCompany}
              onChange={setFilterCompany}
            />
            <div className="flex items-end">
              <Button 
                className="btn-hostinger btn-hostinger-secondary w-full"
                onClick={() => {
                  setSearchTerm("")
                  setFilterCompany("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card className="card-hostinger">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Registered Visitors</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={filteredVisitors}
            columns={columns}
            emptyMessage="No visitors found. Try adjusting your search criteria."
            showCard={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
