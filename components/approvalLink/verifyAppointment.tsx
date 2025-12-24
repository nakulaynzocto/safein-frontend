"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useVerifyTokenQuery, useUpdateStatusMutation } from "@/store/api/approvalLinkApi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Calendar, Clock, User, Building2, FileText, Mail, Phone, MapPin, CreditCard, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function VerifyAppointment() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [isProcessing, setIsProcessing] = useState(false)
  const [actionCompleted, setActionCompleted] = useState(false)
  const [completedStatus, setCompletedStatus] = useState<'approved' | 'rejected' | null>(null)

  const { data, isLoading, error, refetch } = useVerifyTokenQuery(token, {
    skip: !token,
  })

  const [updateStatus] = useUpdateStatusMutation()

  useEffect(() => {
    if (error || (data && !data.success)) {
      // Error will be handled in the render
    }
  }, [error, data])

  // Handle case when token is missing
  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription className="mt-2">
              The verification link is missing or invalid. Please check the link and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!token || isProcessing) return

    setIsProcessing(true)
    try {
      const result = await updateStatus({ token, status }).unwrap()
      
      if (result.success) {
        setActionCompleted(true)
        setCompletedStatus(status)
        toast.success(
          status === 'approved' 
            ? 'Appointment approved successfully!' 
            : 'Appointment rejected successfully!'
        )
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Failed to update appointment status'
      toast.error(errorMessage)
      
      // If link is expired or already used, refetch to show the error state
      if (errorMessage.includes('expired') || errorMessage.includes('already used')) {
        refetch()
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle error cases
  if (error || (data && !data.success)) {
    const errorMessage = (error as any)?.data?.message || data?.message || 'Invalid or expired link'
    const isExpired = errorMessage.includes('expired') || errorMessage.includes('already used')

    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Link Expired or Invalid</CardTitle>
            <CardDescription className="mt-2">
              {isExpired ? 'Link expired or already used' : errorMessage}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const appointment = data?.data?.appointment

  if (!appointment) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-8 w-8 text-destructive mb-4" />
            <p className="text-muted-foreground">Appointment not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format date
  const scheduledDate = new Date(appointment.appointmentDetails.scheduledDate)
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (actionCompleted) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              completedStatus === 'approved' 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {completedStatus === 'approved' ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <CardTitle className="text-2xl">
              Appointment {completedStatus === 'approved' ? 'Approved' : 'Rejected'}
            </CardTitle>
            <CardDescription className="mt-2">
              The appointment has been {completedStatus === 'approved' ? 'approved' : 'rejected'} successfully.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-4 sm:py-12 px-2 sm:px-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xl sm:text-2xl">Appointment Approval</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Review the appointment and visitor details, then approve or reject the request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Visitor Details Section */}
          <div className="space-y-3 sm:space-y-4 rounded-lg border bg-muted/50 p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Visitor Information
            </h3>
            
            {/* Visitor Header with Photo */}
            <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-background rounded-lg border">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                <AvatarImage src={appointment.visitor.photo} alt={appointment.visitor.name} />
                <AvatarFallback className="text-lg sm:text-2xl">
                  {appointment.visitor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-xl font-semibold truncate">{appointment.visitor.name}</h4>
                {appointment.visitor._id && (
                  <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
                    Visitor ID: {appointment.visitor._id}
                  </p>
                )}
                {appointment.visitor.company && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{appointment.visitor.company}</p>
                )}
                {appointment.visitor.designation && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{appointment.visitor.designation}</p>
                )}
              </div>
            </div>

            {/* Visitor Contact Details */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">Email</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{appointment.visitor.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <Phone className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">Phone</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{appointment.visitor.phone}</p>
                </div>
              </div>

              {/* Address */}
              {appointment.visitor.address && (
                <div className="flex items-start gap-2 sm:gap-3 md:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium">Address</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {[
                        appointment.visitor.address.street,
                        appointment.visitor.address.city,
                        appointment.visitor.address.state,
                        appointment.visitor.address.country
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* ID Proof */}
              {appointment.visitor.idProof && (
                <>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">ID Proof Type</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {appointment.visitor.idProof.type 
                          ? appointment.visitor.idProof.type.replace('_', ' ').toUpperCase()
                          : 'N/A'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">ID Proof Number</p>
                      {appointment.visitor.idProof.image ? (
                        <button
                          onClick={() => window.open(appointment.visitor.idProof?.image, '_blank')}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-mono text-xs sm:text-sm mt-1 break-all"
                        >
                          <span>{appointment.visitor.idProof.number || 'N/A'}</span>
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        </button>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1 break-all">{appointment.visitor.idProof.number || 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  {/* ID Proof Image */}
                  {appointment.visitor.idProof.image && (
                    <div className="md:col-span-2">
                      <p className="text-xs sm:text-sm font-medium mb-2">ID Proof Image</p>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={appointment.visitor.idProof.image} 
                          alt="ID Proof" 
                          className="w-full h-auto max-h-48 sm:max-h-64 object-contain cursor-pointer"
                          onClick={() => window.open(appointment.visitor.idProof?.image, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Appointment Details Section */}
          <div className="space-y-3 sm:space-y-4 rounded-lg border bg-muted/50 p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Appointment Details
            </h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              <div className="flex items-start gap-2 sm:gap-3">
                <Building2 className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">Employee</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{appointment.employee.name}</p>
                  {appointment.employee.department && (
                    <p className="text-xs text-muted-foreground break-words">{appointment.employee.department}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <Calendar className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">Date</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">Time</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    {appointment.appointmentDetails.scheduledTime} ({appointment.appointmentDetails.duration} min)
                  </p>
                </div>
              </div>

              {appointment.appointmentDetails.meetingRoom && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium">Meeting Room</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">{appointment.appointmentDetails.meetingRoom}</p>
                  </div>
                </div>
              )}

              {appointment.appointmentDetails.purpose && (
                <div className="flex items-start gap-2 sm:gap-3 md:col-span-2">
                  <FileText className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium">Purpose</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {appointment.appointmentDetails.purpose}
                    </p>
                  </div>
                </div>
              )}

              {appointment.appointmentDetails.notes && (
                <div className="flex items-start gap-2 sm:gap-3 md:col-span-2">
                  <FileText className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium">Notes</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {appointment.appointmentDetails.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
            <Button
              size="lg"
              onClick={() => handleStatusUpdate('approved')}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

