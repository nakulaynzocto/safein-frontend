"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SelectField } from "@/components/common/selectField"
import { DatePicker } from "@/components/common/datePicker"
import { TimePicker } from "@/components/common/timePicker"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useCreateAppointmentMutation, useGetAppointmentQuery, useUpdateAppointmentMutation } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { useGetVisitorsQuery } from "@/store/api/visitorApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { Calendar, User, CheckCircle, ChevronRight, ChevronLeft, Clock, FileText } from "lucide-react"

// ✅ Validation schema
const appointmentSchema = yup.object({
  visitorId: yup.string().required("Please select a visitor"),
  visitorName: yup.string().optional().default(""),
  visitorEmail: yup.string().optional().default(""),
  visitorPhone: yup.string().optional().default(""),
  aadhaarNumber: yup.string().optional().default(""),
  employeeId: yup.string().required("Please select an employee"),
  purpose: yup.string().required("Purpose of visit is required").min(5, "Purpose must be at least 5 characters"),
  appointmentDate: yup.string().required("Appointment date is required").test('future-date', 'Scheduled date cannot be in the past', function(value) {
    if (!value) return false
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of today
    return selectedDate >= today
  }),
  appointmentTime: yup.string().required("Appointment time is required").test('future-time', 'Scheduled time cannot be in the past', function(value) {
    if (!value) return false
    const appointmentDate = this.parent.appointmentDate
    if (!appointmentDate) return true // Let date validation handle this
    
    const selectedDateTime = new Date(`${appointmentDate} ${value}`)
    const now = new Date()
    
    // If the date is today, check if time is in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(appointmentDate)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate.getTime() === today.getTime()) {
      // Same day, check if time is in the future
      return selectedDateTime > now
    }
    
    // Different day, time is valid
    return true
  }),
  notes: yup.string().optional().default(""),
})

type AppointmentFormData = yup.InferType<typeof appointmentSchema>

interface NewAppointmentModalProps {
  appointmentId?: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewAppointmentModal({ appointmentId, trigger, onSuccess, open: controlledOpen, onOpenChange }: NewAppointmentModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation()
  const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation()
  const { data: employeesData } = useGetEmployeesQuery()
  const employees = employeesData?.employees || []
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [currentStep, setCurrentStep] = React.useState(1)
  const totalSteps = 3
  
  const isEditMode = !!appointmentId
  const isLoading = isCreating || isUpdating
  
  // Fetch appointment data for editing
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useGetAppointmentQuery(
    appointmentId || '',
    { skip: !appointmentId }
  )

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} - ${emp.department}`,
  }))

  // Fetch visitors for search
  const { data: visitorsData } = useGetVisitorsQuery({ page: 1, limit: 100 })
  const visitors = visitorsData?.visitors || []
  
  const visitorOptions = visitors.map((visitor) => ({
    value: visitor._id,
    label: `${visitor.name} - ${visitor.email}`,
  }))

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      visitorId: "",
      visitorName: "",
      visitorEmail: "",
      visitorPhone: "",
      aadhaarNumber: "",
      employeeId: "",
      purpose: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
    },
  })

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      reset()
      setGeneralError(null)
      clearErrors()
      setCurrentStep(1)
    }
  }, [open, reset, clearErrors])

  // Populate form with appointment data when in edit mode
  React.useEffect(() => {
    if (isEditMode && existingAppointment && open) {
      const appointmentDetails = existingAppointment.appointmentDetails
      const visitorDetails = existingAppointment.visitor
      
      reset({
        visitorId: existingAppointment.visitorId || "",
        visitorName: visitorDetails?.name || "",
        visitorEmail: visitorDetails?.email || "",
        visitorPhone: visitorDetails?.phone || "",
        aadhaarNumber: visitorDetails?.idProof?.number || "",
        employeeId: existingAppointment.employeeId || "",
        purpose: appointmentDetails?.purpose || "",
        appointmentDate: appointmentDetails?.scheduledDate ? 
          new Date(appointmentDetails.scheduledDate).toISOString().split('T')[0] : "",
        appointmentTime: appointmentDetails?.scheduledTime || "",
        notes: appointmentDetails?.notes || "",
      })
    }
  }, [isEditMode, existingAppointment, open, reset])

  // Clear general error when user starts typing
  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validate current step before moving to next
      const currentStepData = watch()
      let isValid = true
      
      if (currentStep === 1) {
        // Validate step 1 - only check if visitor is selected
        if (!currentStepData.visitorId) {
          isValid = false
        }
      } else if (currentStep === 2) {
        // Validate step 2 fields
        if (!currentStepData.employeeId || !currentStepData.purpose || !currentStepData.appointmentDate || !currentStepData.appointmentTime) {
          isValid = false
        } else {
          // Additional validation for date and time
          const selectedDate = new Date(currentStepData.appointmentDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          if (selectedDate < today) {
            isValid = false
          } else if (selectedDate.getTime() === today.getTime()) {
            // Same day, check if time is in the future
            const selectedDateTime = new Date(`${currentStepData.appointmentDate} ${currentStepData.appointmentTime}`)
            if (selectedDateTime <= new Date()) {
              isValid = false
            }
          }
        }
      }
      
      if (isValid) {
        setCurrentStep(currentStep + 1)
      } else {
        // Trigger validation for current step
        if (currentStep === 1) {
          if (!currentStepData.visitorId) {
            setValue("visitorId", "", { shouldValidate: true })
          }
        } else if (currentStep === 2) {
          if (!currentStepData.employeeId) setValue("employeeId", "", { shouldValidate: true })
          if (!currentStepData.purpose) setValue("purpose", "", { shouldValidate: true })
          if (!currentStepData.appointmentDate) setValue("appointmentDate", "", { shouldValidate: true })
          if (!currentStepData.appointmentTime) setValue("appointmentTime", "", { shouldValidate: true })
          
          // Trigger date and time validation
          if (currentStepData.appointmentDate) setValue("appointmentDate", currentStepData.appointmentDate, { shouldValidate: true })
          if (currentStepData.appointmentTime) setValue("appointmentTime", currentStepData.appointmentTime, { shouldValidate: true })
        }
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle visitor selection
  const handleVisitorSelect = (visitorId: string) => {
    if (visitorId) {
      const selectedVisitor = visitors.find(v => v._id === visitorId)
      if (selectedVisitor) {
        setValue("visitorName", selectedVisitor.name)
        setValue("visitorEmail", selectedVisitor.email)
        setValue("visitorPhone", selectedVisitor.phone)
        setValue("aadhaarNumber", selectedVisitor.idProof?.number || "")
        
        // Clear any validation errors for visitor selection
        clearErrors(["visitorId"])
      }
    } else {
      // Clear fields if no visitor selected
      setValue("visitorName", "")
      setValue("visitorEmail", "")
      setValue("visitorPhone", "")
      setValue("aadhaarNumber", "")
    }
  }

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Clear any previous general errors
      setGeneralError(null)
      
      const selectedEmployee = employees.find((emp) => emp._id === data.employeeId)
      
      if (isEditMode && appointmentId) {
        // Update existing appointment
        const updateData = {
          appointmentDetails: {
            purpose: data.purpose,
            scheduledDate: data.appointmentDate,
            scheduledTime: data.appointmentTime,
            duration: existingAppointment?.appointmentDetails?.duration || 60,
            meetingRoom: existingAppointment?.appointmentDetails?.meetingRoom || "Main Conference Room",
            notes: data.notes || ""
          }
        }
        
        await updateAppointment({ id: appointmentId, ...updateData }).unwrap()
        showSuccessToast("Appointment updated successfully!")
      } else {
        // Create new appointment
        const newAppointmentData = {
          appointmentId: `APT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          employeeId: data.employeeId,
          visitorId: data.visitorId || "temp-visitor-id", // Use selected visitor ID or create new one
          appointmentDetails: {
            purpose: data.purpose,
            scheduledDate: data.appointmentDate,
            scheduledTime: data.appointmentTime,
            duration: 60, // Default 1 hour
            meetingRoom: "Main Conference Room",
            notes: data.notes || ""
          },
          visitorDetails: {
            name: data.visitorName,
            email: data.visitorEmail,
            phone: data.visitorPhone,
            aadhaarNumber: data.aadhaarNumber || ""
          },
          securityDetails: {
            badgeIssued: false,
            badgeNumber: "",
            securityClearance: false,
            securityNotes: ""
          },
          notifications: {
            smsSent: false,
            emailSent: false,
            whatsappSent: false,
            reminderSent: false
          }
        }
        
        await createAppointment(newAppointmentData).unwrap()
        showSuccessToast("Appointment created successfully")
      }
      
      setOpen(false)
      reset()
      setCurrentStep(1)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Default behavior - navigate to appointment list
        router.push(routes.privateroute.APPOINTMENTLIST)
      }
    } catch (error: any) {
      // Handle field-specific validation errors from backend
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        // Set field-specific errors
        error.data.errors.forEach((fieldError: any) => {
          if (fieldError.field && fieldError.message) {
            // Handle nested field errors
            const fieldPath = fieldError.field.includes('.') ? fieldError.field : fieldError.field
            // You might need to implement nested field error handling here
          }
        })
      } else if (error?.data?.message) {
        // Handle specific field errors from backend
        const message = error.data.message.toLowerCase()
        if (message.includes('employee') && message.includes('not found')) {
          setGeneralError('Selected employee not found')
        } else if (message.includes('time slot') && message.includes('unavailable')) {
          setGeneralError('Selected time slot is not available')
        } else {
          // Set general error for other errors
          setGeneralError(error.data.message)
        }
      } else {
        // Set general error for network or other errors
        const errorMessage = error?.message || "Failed to create appointment"
        setGeneralError(errorMessage)
      }
    }
  }

  const defaultTrigger = (
    <Button variant="default">
      {isEditMode ? "Edit Appointment" : "New Appointment"}
    </Button>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            
            {/* Visitor Search Option */}
            <div className="mb-6">
              <Controller
                name="visitorId"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium">
                      Search Existing Visitor
                    </Label>
                    <SelectField
                      placeholder={visitors.length === 0 ? "No visitors found" : "Search and select existing visitor"}
                      options={visitorOptions}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val)
                        handleVisitorSelect(val)
                      }}
                      error={errors.visitorId?.message}
                    />
                    {visitors.length === 0 ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>No visitors found.</strong> Please create a visitor first using the visitor registration feature, then return to schedule an appointment.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Select an existing visitor to proceed with the appointment scheduling.
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            
            {/* Visitor Selection Indicator */}
            {watch("visitorId") && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Visitor Found & Selected</span>
                </div>
                <div className="space-y-1 text-xs text-green-700">
                  <p><strong>Name:</strong> {watch("visitorName")}</p>
                  <p><strong>Email:</strong> {watch("visitorEmail")}</p>
                  <p><strong>Phone:</strong> {watch("visitorPhone")}</p>
                  {watch("aadhaarNumber") && <p><strong>ID Proof:</strong> {watch("aadhaarNumber")}</p>}
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ All visitor information has been auto-filled. You can proceed to the next step.
                </p>
              </div>
            )}
            
            {/* No Visitor Selected Message */}
            {!watch("visitorId") && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Visitor Required</span>
                </div>
                <p className="text-xs text-red-700">
                  <strong>Please select an existing visitor first.</strong> You cannot proceed to the next step without selecting a visitor. If no visitors exist, please create a visitor first using the visitor registration feature.
                </p>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Appointment Details</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Controller
                name="employeeId"
                control={control}
                rules={{ required: "Please select an employee" }}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium">
                      Employee to Meet <span className="text-destructive">*</span>
                    </Label>
                    <SelectField
                      placeholder="Select employee"
                      options={employeeOptions}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      error={errors.employeeId?.message}
                    />
                  </div>
                )}
              />

              <div className="flex flex-col gap-2">
                <Label htmlFor="purpose" className="font-medium">
                  Purpose of Visit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="purpose"
                  {...register("purpose")}
                  placeholder="Brief description of the visit purpose"
                  aria-required="true"
                  className={errors.purpose ? "border-destructive" : ""}
                />
                {errors.purpose && (
                  <span className="text-sm text-destructive">{errors.purpose.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="appointmentDate" className="font-medium">
                  Appointment Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  {...register("appointmentDate")}
                  error={errors.appointmentDate?.message}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="appointmentTime" className="font-medium">
                  Appointment Time <span className="text-destructive">*</span>
                </Label>
                <TimePicker
                  {...register("appointmentTime")}
                  error={errors.appointmentTime?.message}
                  minTime={(() => {
                    const selectedDate = watch("appointmentDate")
                    if (selectedDate) {
                      const today = new Date().toISOString().split('T')[0]
                      if (selectedDate === today) {
                        // If today is selected, set min time to current time + 1 hour
                        const now = new Date()
                        now.setHours(now.getHours() + 1)
                        return now.toTimeString().slice(0, 5)
                      }
                    }
                    return undefined
                  })()}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Additional Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes" className="font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Any additional information or special requirements"
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Summary Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Appointment Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visitor:</span>
                    <span className="font-medium">{watch("visitorName") || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{watch("visitorEmail") || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{watch("visitorPhone") || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee:</span>
                    <span className="font-medium">
                      {employeeOptions.find(emp => emp.value === watch("employeeId"))?.label || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose:</span>
                    <span className="font-medium">{watch("purpose") || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {watch("appointmentDate") && watch("appointmentTime") 
                        ? `${watch("appointmentDate")} at ${watch("appointmentTime")}`
                        : "Not specified"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {isEditMode ? "Edit Appointment" : "Schedule New Appointment"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isEditMode 
                  ? "Update the appointment information and details."
                  : "Schedule a new appointment step by step. Fields marked with"
                }
                {!isEditMode && <span className="px-1 text-destructive">*</span>}
                {!isEditMode && " are required."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Loading state for appointment data */}
        {isEditMode && isLoadingAppointment && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-sm text-gray-600">Loading appointment details...</span>
          </div>
        )}

        {!isEditMode || !isLoadingAppointment ? (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
            {/* General Error Display */}
            {generalError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {generalError}
                </AlertDescription>
              </Alert>
            )}

          {/* Progress Indicator */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
              <div 
                className="absolute h-2 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="ml-4 text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          <DialogFooter className="mt-6">
            <div className="flex justify-between w-full">
              <div>
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="px-6"
                >
                  Cancel
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={isLoading || (currentStep === 1 && !watch("visitorId"))}
                    className="px-6"
                  >
                    {currentStep === 1 && watch("visitorId") ? "Continue with Selected Visitor" : "Next"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6"
                  >
                    {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default NewAppointmentModal
