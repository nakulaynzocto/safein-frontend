"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/inputField"
import { Badge } from "@/components/ui/badge"
import { Search, User, Phone, Mail, Building, MapPin, CheckCircle } from "lucide-react"
import { VisitorDetails } from "@/store/api/appointmentApi"
import { useSearchVisitorsMutation, Visitor } from "@/store/api/visitorApi"
import { showSuccessToast, showErrorToast, showInfoToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { NewVisitorModal } from "@/components/visitor/NewVisitorModal"

// ✅ Custom validation: at least one of phone or email required
const searchSchema = yup.object({
  phone: yup.string().optional(),
  email: yup.string().email("Invalid email address").optional(),
}).test("at-least-one", "Either phone or email is required", (value) => {
  return !!(value.phone || value.email)
})

type SearchFormData = yup.InferType<typeof searchSchema>

interface VisitorSearchStepProps {
  onVisitorFound: (visitorId: string, visitorDetails: VisitorDetails) => void
}

export function VisitorSearchStep({ onVisitorFound }: VisitorSearchStepProps) {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<Visitor[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showVisitorModal, setShowVisitorModal] = useState(false)

  const [searchVisitors, { isLoading: isSearching }] = useSearchVisitorsMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    defaultValues: {
      phone: "",
      email: "",
    },
  })

  const phoneValue = watch("phone")
  const emailValue = watch("email")

  const handleSearch = async (data: SearchFormData) => {
    setHasSearched(true)

    // Manual validation
    if (!data.phone && !data.email) {
      return
    }

    try {
      const searchData = {
        phone: data.phone || undefined,
        email: data.email || undefined,
      }

      const result = await searchVisitors(searchData).unwrap()
      
      if (result.found) {
        setSearchResults(result.visitors)
        showSuccessToast(result.message)
      } else {
        setSearchResults([])
        showInfoToast(result.message)
      }
    } catch (error: any) {
      console.error("Search failed:", error)
      setSearchResults([])
      showErrorToast(error?.data?.message || "Failed to search visitors")
    }
  }

  const handleSelectVisitor = (visitor: Visitor) => {
    // Convert Visitor to VisitorDetails format
    const visitorDetails: VisitorDetails = {
      name: visitor.name,
      email: visitor.email,
      phone: visitor.phone,
      company: "", // Visitor interface doesn't have company field
      purposeOfVisit: "", // Default purpose
    }
    onVisitorFound(visitor._id, visitorDetails)
  }

  const handleNewVisitor = () => {
    setShowVisitorModal(true)
  }

  const handleVisitorCreated = () => {
    setShowVisitorModal(false)
    // Optionally refresh search results or show success message
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="card-hostinger p-4">
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
                required
              />
              <InputField
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                error={errors.email?.message}
                {...register("email")}
                required
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
                onClick={handleNewVisitor}
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
                  onClick={handleNewVisitor}
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

      {/* New Visitor Modal */}
      <NewVisitorModal
        open={showVisitorModal}
        onOpenChange={setShowVisitorModal}
        onSuccess={handleVisitorCreated}
        trigger={<div />} // Hidden trigger since we control the modal programmatically
      />
    </div>
  )
}

