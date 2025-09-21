"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/inputField"
import { Badge } from "@/components/ui/badge"
import { Search, User, Phone, Mail, Building, MapPin, CheckCircle } from "lucide-react"
import { VisitorDetails } from "@/store/api/appointmentApi"

// ✅ Custom validation: at least one of phone or email required
const searchSchema = yup.object({
  phone: yup.string().nullable(),
  email: yup.string().email("Invalid email address").nullable(),
}).test("at-least-one", "Either phone or email is required", (value) => {
  return !!(value.phone || value.email)
})

type SearchFormData = yup.InferType<typeof searchSchema>

interface VisitorSearchStepProps {
  onVisitorFound: (visitor: VisitorDetails) => void
  onNewVisitor: () => void
}

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
  }
]

export function VisitorSearchStep({ onVisitorFound, onNewVisitor }: VisitorSearchStepProps) {
  const [searchResults, setSearchResults] = useState<VisitorDetails[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: yupResolver(searchSchema),
  })

  const phoneValue = watch("phone")
  const emailValue = watch("email")

  const handleSearch = async (data: SearchFormData) => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // ✅ OR condition search
      const results = mockVisitors.filter(visitor =>
        (data.phone && visitor.phone === data.phone) ||
        (data.email && visitor.email === data.email)
      )

      setSearchResults(results)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectVisitor = (visitor: VisitorDetails) => {
    onVisitorFound(visitor)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="card-hostinger">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Search className="h-5 w-5" />
            Search Existing Visitor
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enter visitor's phone number <b>or</b> email to search
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Phone Number"
                placeholder="Enter phone number"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <InputField
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            {errors?.root?.message && (
              <p className="text-sm text-red-500">{errors.root.message}</p>
            )}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSearching || (!phoneValue && !emailValue)}
                className="btn-hostinger btn-hostinger-primary flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "Searching..." : "Search Visitor"}
              </Button>
              <Button
                type="button"
                onClick={onNewVisitor}
                className="btn-hostinger btn-hostinger-secondary flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Register New Visitor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results (same as before) */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Found {searchResults.length} visitor record(s)
                </p>
                {searchResults.map((visitor, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleSelectVisitor(visitor)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={visitor.photo}
                          alt={visitor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-user.jpg"
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{visitor.name}</h3>
                          <Badge variant="secondary">{visitor.designation}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {visitor.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {visitor.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {visitor.company}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {visitor.address.city}, {visitor.address.state}
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectVisitor(visitor)
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Select This Visitor
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Visitor Found</h3>
                <p className="text-gray-600 mb-4">
                  No visitor record found with the provided phone or email.
                </p>
                <Button
                  onClick={onNewVisitor}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Register New Visitor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
