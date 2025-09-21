"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VisitorDetailsStep } from "./visitorDetailsStep"
import { VisitorDetails } from "@/store/api/appointmentApi"
import { showSuccess, showError } from "@/utils/toaster"
import { routes } from "@/utils/routes"
import { User, ArrowLeft } from "lucide-react"

export function SimpleVisitorRegistration() {
  const router = useRouter()
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVisitorComplete = async (data: VisitorDetails, accompaniedBy?: any) => {
    try {
      setIsSubmitting(true)
      
      // Here you would typically save the visitor details to your database
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setVisitorDetails(data)
      showSuccess("Visitor registered successfully!")
      
      // Redirect to appointment booking or visitor list
      router.push(routes.privateroute.APPOINTMENTLIST)
    } catch (error: any) {
      showError(error?.message || "Failed to register visitor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Visitor Registration
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Register a new visitor to the system
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visitor Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Information</CardTitle>
          <p className="text-sm text-gray-600">
            Please provide complete visitor details including personal information, address, and identification documents.
          </p>
        </CardHeader>
        <CardContent>
          <VisitorDetailsStep
            onComplete={handleVisitorComplete}
            initialData={visitorDetails}
          />
        </CardContent>
      </Card>

      {/* Success Message */}
      {visitorDetails && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold">Visitor Registered Successfully!</h3>
                <p className="text-sm">
                  {visitorDetails.name} has been registered in the system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
