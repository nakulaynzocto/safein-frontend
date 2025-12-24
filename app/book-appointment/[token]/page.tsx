"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useGetAppointmentLinkByTokenQuery, useCreateVisitorThroughLinkMutation, useCreateAppointmentThroughLinkMutation } from "@/store/api/appointmentLinkApi"
import { AppointmentBookingForm } from "@/components/appointment/AppointmentBookingForm"
import { BookingVisitorForm } from "@/components/appointment/BookingVisitorForm"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { StatusPage } from "@/components/common/statusPage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { extractIdString, isValidId } from "@/utils/idExtractor"

export default function BookAppointmentPage() {
  const params = useParams()
  const rawToken = params?.token as string
  // Decode the token in case it's URL encoded
  const token = rawToken ? decodeURIComponent(rawToken) : ""

  const [step, setStep] = useState<"loading" | "visitor" | "appointment" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [appointmentLinkData, setAppointmentLinkData] = useState<any>(null)
  const [visitorData, setVisitorData] = useState<any>(null)

  const { data: linkData, isLoading: isLoadingLink, error: linkError } = useGetAppointmentLinkByTokenQuery(
    token || "",
    { skip: !token }
  )


  const [createVisitorThroughLink, { isLoading: isCreatingVisitor }] = useCreateVisitorThroughLinkMutation()
  const [createAppointmentThroughLink, { isLoading: isCreatingAppointment }] = useCreateAppointmentThroughLinkMutation()

  useEffect(() => {
    // Handle missing token
    if (!token) {
      setErrorMessage("Invalid appointment link - token is missing")
      setStep("error")
      return
    }

    // Handle API errors
    if (linkError) {
      const error = linkError as any
      const errorMessage = error?.data?.message || error?.message || "Invalid or expired appointment link"
      
      // Check if it's a 404 or not found error
      if (error?.status === 404 || error?.status === 'FETCH_ERROR' || errorMessage.includes('not found')) {
        setErrorMessage("Appointment link not found. Please check the link and try again.")
      } else {
        setErrorMessage(errorMessage)
      }
      setStep("error")
      return
    }

    // Handle successful data load
    if (linkData) {
      setAppointmentLinkData(linkData)
      if (linkData.visitor) setVisitorData(linkData.visitor)
      
      const extractedVisitorId = extractIdString(linkData.visitorId)
      if (isValidId(extractedVisitorId)) {
        setVisitorId(extractedVisitorId)
        setStep("appointment")
      } else {
        setStep("visitor")
      }
    }
  }, [linkData, linkError, token])

  const handleVisitorSubmit = async (visitorData: any) => {
    if (!token) return
    
    try {
      const response = await createVisitorThroughLink({ token, visitorData }).unwrap()
      const result = (response as any)?.data || response
      const extractedId = extractIdString(result?._id || result?.id)
      
      if (isValidId(extractedId)) {
        setVisitorId(extractedId)
        showSuccessToast("Visitor information saved successfully!")
        setStep("appointment")
      } else {
        showErrorToast("Failed to get visitor ID. Please try again.")
      }
    } catch (error: any) {
      showErrorToast(error?.data?.message || error?.message || "Failed to create visitor")
    }
  }

  const handleAppointmentSubmit = async (appointmentData: any) => {
    if (!visitorId || !appointmentLinkData || !token) return

    try {
      const { visitorId: _, employeeId: __, ...restData } = appointmentData
      const cleanData = {
        ...restData,
        visitorId: extractIdString(visitorId),
        employeeId: extractIdString(appointmentLinkData.employeeId),
      }

      await createAppointmentThroughLink({ token, appointmentData: cleanData }).unwrap()
      showSuccessToast("Appointment booked successfully!")
      setStep("success")
    } catch (error: any) {
      showErrorToast(error?.data?.message || error?.message || "Failed to create appointment")
    }
  }

  const errorConfig = useMemo(() => {
    const lowerMsg = errorMessage.toLowerCase()
    return {
      isExpired: lowerMsg.includes("expired"),
      isAlreadyUsed: lowerMsg.includes("already been used") || lowerMsg.includes("already created"),
      title: lowerMsg.includes("already been used") || lowerMsg.includes("already created") 
        ? "Link Already Used" 
        : lowerMsg.includes("expired") 
        ? "Link Expired" 
        : "Invalid Link",
      message: lowerMsg.includes("already been used") || lowerMsg.includes("already created")
        ? "This appointment link has already been used to create an appointment. Each link can only be used once."
        : lowerMsg.includes("expired")
        ? "This appointment link has expired. Please contact the person who sent you this link to get a new one."
        : "This appointment link is invalid. Please contact the person who sent you this link."
    }
  }, [errorMessage])

  if (step === "loading" || isLoadingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600">Loading appointment link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "error") {
    return (
      <StatusPage
        type="error"
        title={errorConfig.title}
        message={errorMessage}
        description={errorConfig.message}
        showHomeButton={true}
        showBackButton={true}
      />
    )
  }

  if (step === "success") {
    return (
      <StatusPage
        type="success"
        title="Appointment Booked Successfully!"
        message="Your appointment has been confirmed. You will receive a confirmation email shortly."
        description="Thank you for booking your appointment. We look forward to meeting you!"
        showHomeButton={true}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {(step === "visitor" || step === "appointment") && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <div className={`flex items-center gap-2 ${step === "visitor" || step === "appointment" ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                  step === "visitor" ? "bg-blue-600 border-blue-600 text-white" : 
                  step === "appointment" ? "bg-green-500 border-green-500 text-white" : 
                  "bg-gray-200 border-gray-300 text-gray-500"
                }`}>
                  {step === "visitor" ? "1" : step === "appointment" ? "✓" : "1"}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Visitor Info</span>
              </div>
              <div className={`h-0.5 sm:h-1 w-12 sm:w-20 ${step === "appointment" ? "bg-blue-600" : "bg-gray-300"}`}></div>
              <div className={`flex items-center gap-2 ${step === "appointment" ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                  step === "appointment" ? "bg-blue-600 border-blue-600 text-white" : 
                  "bg-gray-200 border-gray-300 text-gray-500"
                }`}>
                  {step === "appointment" ? "2" : "2"}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Appointment</span>
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              Book Your Appointment
            </CardTitle>
            {appointmentLinkData?.employee && (
              <div className="mt-2 sm:mt-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  Meeting with: <strong className="text-gray-900">{appointmentLinkData.employee.name}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">{appointmentLinkData.employee.email}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {step === "visitor" && (
              <BookingVisitorForm
                initialEmail={appointmentLinkData?.visitorEmail}
                initialValues={visitorData || undefined}
                onSubmit={handleVisitorSubmit}
                isLoading={isCreatingVisitor}
              />
            )}
            {step === "appointment" && appointmentLinkData && visitorId && (
              <AppointmentBookingForm
                visitorId={visitorId}
                employeeId={extractIdString(appointmentLinkData.employeeId)}
                employeeName={appointmentLinkData.employee?.name || ""}
                visitorEmail={appointmentLinkData.visitorEmail}
                onSubmit={handleAppointmentSubmit}
                isLoading={isCreatingAppointment}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

