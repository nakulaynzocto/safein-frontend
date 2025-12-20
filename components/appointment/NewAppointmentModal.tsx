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
import { ImageUploadField } from "@/components/common/imageUploadField"
import { useCreateAppointmentMutation, useGetAppointmentQuery, useUpdateAppointmentMutation } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { useGetVisitorsQuery, Visitor } from "@/store/api/visitorApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { Calendar, User, Car } from "lucide-react"
import { ApprovalLinkModal } from "./ApprovalLinkModal"
import { useDebounce } from "@/hooks/useDebounce"

// Validation schema
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
    
    try {
      // Handle different date formats (YYYY-MM-DD or DD/MM/YYYY)
      let dateStr = value
      if (dateStr.includes('/')) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      
      const selectedDate = new Date(dateStr + 'T00:00:00')
      if (isNaN(selectedDate.getTime())) {
        return false
      }
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)
      
      return selectedDate >= today
    } catch (error) {
      return false
    }
  }),
  appointmentTime: yup.string().required("Appointment time is required").test('future-time', 'Scheduled time cannot be in the past', function(value) {
    if (!value) return false
    const appointmentDate = this.parent.appointmentDate
    if (!appointmentDate) return true
    
    try {
      // Handle different date formats
      let dateStr = appointmentDate
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      
      const selectedDateTime = new Date(`${dateStr}T${value}`)
      if (isNaN(selectedDateTime.getTime())) {
        return true // If date parsing fails, skip time validation
      }
      
      const now = new Date()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(dateStr + 'T00:00:00')
      selectedDate.setHours(0, 0, 0, 0)
      
      // Only validate time if the date is today
      if (selectedDate.getTime() === today.getTime()) {
        return selectedDateTime > now
      }
      
      return true
    } catch (error) {
      return true // If validation fails, allow it (date validation will catch it)
    }
  }),
  accompanyingCount: yup
    .number()
    .typeError("Please enter a valid number")
    .min(0, "Accompanying people cannot be negative")
    .max(20, "Accompanying people cannot exceed 20")
    .default(0),
  notes: yup.string().optional().default(""),
  vehicleNumber: yup.string().optional().default(""),
  vehiclePhoto: yup.string().optional().default(""),
})

type AppointmentFormData = yup.InferType<typeof appointmentSchema>

interface NewAppointmentModalProps {
  appointmentId?: string
  triggerButton?: React.ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewAppointmentModal({ appointmentId, triggerButton, onSuccess, open: controlledOpen, onOpenChange }: NewAppointmentModalProps) {
  const router = useRouter()
  
  // ========== State Declarations ==========
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [approvalLink, setApprovalLink] = React.useState<string | null>(null)
  const [showApprovalLinkModal, setShowApprovalLinkModal] = React.useState(false)
  const [employeeSearchInput, setEmployeeSearchInput] = React.useState("")
  const [visitorSearchInput, setVisitorSearchInput] = React.useState("")
  
  // ========== Debounced Search Values ==========
  const debouncedEmployeeSearch = useDebounce(employeeSearchInput, 500)
  const debouncedVisitorSearch = useDebounce(visitorSearchInput, 500)
  
  // ========== Modal State ==========
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const isEditMode = !!appointmentId
  
  // ========== API Mutations ==========
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation()
  const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation()
  const isLoading = isCreating || isUpdating
  
  // ========== API Queries ==========
  // Fetch employees with search - default limit 10, search when user types
  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useGetEmployeesQuery({ 
    page: 1, 
    limit: 10, // Default limit 10
    search: debouncedEmployeeSearch || undefined, // Search in database when user types
    status: "Active" as const, // Filter active employees on the backend
  })
  const employees = employeesData?.employees || []
  
  // Fetch visitors with search - default limit 10, search when user types
  const { data: visitorsData, isLoading: isLoadingVisitors, error: visitorsError } = useGetVisitorsQuery({ 
    page: 1, 
    limit: 10, // Default limit 10
    search: debouncedVisitorSearch || undefined, // Search in database when user types
  })
  const visitors: Visitor[] = visitorsData?.visitors || []
  
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useGetAppointmentQuery(
    appointmentId || '',
    { skip: !appointmentId }
  )

  // ========== Computed Values ==========
  const employeeOptions = React.useMemo(() => {
    // Backend already filters by status, but double-check to be safe
    const activeEmployees = employees?.filter(emp => emp.status === "Active") || []
    return activeEmployees.map(emp => ({
      value: emp._id,
      label: `${emp.name} (${emp.status}) - ${emp.department}`,
      searchKeywords: `${emp.name} ${emp.email ?? ""} ${emp.phone ?? ""} ${emp.department ?? ""} ${emp.designation ?? ""}`.trim(),
    }))
  }, [employees])
  
  const visitorOptions = React.useMemo(() => 
    visitors.map((visitor) => ({
      value: visitor._id,
      label: `${visitor.name} - ${visitor.email}`,
      searchKeywords: `${visitor.name} ${visitor.email ?? ""} ${visitor.phone ?? ""}`.trim(),
    })),
    [visitors]
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
    trigger,
  } = useForm<AppointmentFormData>({
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
      vehicleNumber: "",
      vehiclePhoto: "",
      accompanyingCount: 0,
    },
  })

  // ========== Effects ==========
  React.useEffect(() => {
    if (!open) {
      reset()
      setGeneralError(null)
      setApprovalLink(null)
      clearErrors()
      setEmployeeSearchInput("") // Reset search when modal closes
      setVisitorSearchInput("") // Reset search when modal closes
    }
  }, [open, reset, clearErrors])

  React.useEffect(() => {
    if (isEditMode && existingAppointment && open) {
      const appointmentDetails = existingAppointment.appointmentDetails
      const visitorDetails = existingAppointment.visitor
      
      reset({
        visitorId: existingAppointment.visitorId || "",
        visitorName: visitorDetails?.name || "",
        visitorEmail: visitorDetails?.email || "",
        visitorPhone: visitorDetails?.phone || "",
        aadhaarNumber: "",
        employeeId: existingAppointment.employeeId || "",
        purpose: appointmentDetails?.purpose || "",
        appointmentDate: appointmentDetails?.scheduledDate ? 
          new Date(appointmentDetails.scheduledDate).toISOString().split('T')[0] : "",
        appointmentTime: appointmentDetails?.scheduledTime || "",
        notes: appointmentDetails?.notes || "",
        vehicleNumber: appointmentDetails?.vehicleNumber || "",
        vehiclePhoto: appointmentDetails?.vehiclePhoto || "",
        accompanyingCount: existingAppointment.accompanyingCount ?? 0,
      })
    }
  }, [isEditMode, existingAppointment, open, reset])

  const handleVisitorSelect = React.useCallback((visitorId: string | null) => {
    const id = visitorId ?? ""
    if (id) {
      const selectedVisitor = visitors.find(v => v._id === visitorId)
      if (selectedVisitor) {
        setValue("visitorName", selectedVisitor.name)
        setValue("visitorEmail", selectedVisitor.email)
        setValue("visitorPhone", selectedVisitor.phone)
        setValue("aadhaarNumber", selectedVisitor.idProof?.number || "")
        clearErrors("visitorId")
      }
    } else {
      setValue("visitorName", "")
      setValue("visitorEmail", "")
      setValue("visitorPhone", "")
      setValue("aadhaarNumber", "")
    }
  }, [visitors, setValue, clearErrors])

  const onSubmit = async (data: AppointmentFormData) => {
    if (isLoading) return
    setGeneralError(null)
    
    try {
      const selectedEmp = employees.find(e => e._id === data.employeeId)
      if (selectedEmp && selectedEmp.status === 'Inactive') {
        setGeneralError('Selected employee is inactive. Please choose an active employee.')
        return
      }
      if (isEditMode && appointmentId) {
        const updateData = {
          accompanyingCount: data.accompanyingCount ?? 0,
          appointmentDetails: {
            purpose: data.purpose,
            scheduledDate: data.appointmentDate,
            scheduledTime: data.appointmentTime,
            duration: existingAppointment?.appointmentDetails?.duration || 60,
            meetingRoom: existingAppointment?.appointmentDetails?.meetingRoom || "Main Conference Room",
            notes: data.notes || "",
            vehicleNumber: data.vehicleNumber || "",
            vehiclePhoto: data.vehiclePhoto || ""
          }
        }
        await updateAppointment({ id: appointmentId, ...updateData }).unwrap()
        showSuccessToast("Appointment updated successfully!")
        // For edit mode, close modal after update
        setOpen(false)
        if (onSuccess) onSuccess()
      } else {
        const newAppointmentData = {
          appointmentId: `APT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          employeeId: data.employeeId,
          visitorId: data.visitorId,
          checkInTime: new Date().toISOString(), // Auto-set check-in time on creation
          accompanyingCount: data.accompanyingCount ?? 0,
          appointmentDetails: {
            purpose: data.purpose,
            scheduledDate: data.appointmentDate,
            scheduledTime: data.appointmentTime,
            duration: 60,
            meetingRoom: "Main Conference Room",
            notes: data.notes || "",
            vehicleNumber: data.vehicleNumber || "",
            vehiclePhoto: data.vehiclePhoto || ""
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
        const result = await createAppointment(newAppointmentData).unwrap()
        showSuccessToast("Appointment created successfully")
        
        // Close the appointment creation modal
        setOpen(false)
        
        // Store approval link if provided and open approval link modal
        if (result.approvalLink) {
          setApprovalLink(result.approvalLink)
          setShowApprovalLinkModal(true)
        } else {
          if (onSuccess) onSuccess()
        }
      }
    } catch (error: any) {
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        // Handle field-specific errors if needed
      } else if (error?.data?.message) {
        setGeneralError(error.data.message)
      } else {
        setGeneralError(error?.message || "Failed to create appointment")
      }
    }
  }

  const defaultTrigger = (
    <Button variant="default">
      {isEditMode ? "Edit Appointment" : "New Appointment"}
    </Button>
  )

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-white dark:bg-gray-900 p-4 sm:p-6 max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {isEditMode ? "Edit Appointment" : "Schedule New Appointment"}
          </DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingAppointment ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-xs sm:text-sm text-gray-600">Loading appointment details...</span>
          </div>
        ) : (
          <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {generalError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {generalError}
                </AlertDescription>
              </Alert>
            )}

            {/* Visitor and Employee Selection - One Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Visitor Selection */}
              <div className="space-y-2">
                <Label className="font-medium">
                  Visitor <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="visitorId"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      placeholder="Select visitor (type to search)"
                      options={visitorOptions}
                      value={field.value}
                      onChange={(val) => {
                        console.log("Visitor select change", { val })
                        field.onChange(val ?? "")
                        handleVisitorSelect(val)
                      }}
                      onInputChange={(inputValue) => {
                        setVisitorSearchInput(inputValue)
                      }}
                      error={errors.visitorId?.message || (visitorsError ? "Failed to load visitors" : undefined)}
                      isLoading={isLoadingVisitors}
                    />
                  )}
                />
              </div>

              {/* Employee Selection */}
              <div className="space-y-2">
                <Label className="font-medium">
                  Employee to Meet <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      placeholder="Select employee (type to search)"
                      options={employeeOptions}
                      value={field.value}
                      onChange={(val) => {
                        console.log("Employee select change", { val })
                        field.onChange(val ?? "")
                      }}
                      onInputChange={(inputValue) => {
                        setEmployeeSearchInput(inputValue)
                      }}
                      error={errors.employeeId?.message || (employeesError ? "Failed to load employees" : undefined)}
                      isLoading={isLoadingEmployees}
                    />
                  )}
                />
              </div>
            </div>



            {/* Appointment Date, Time, and Accompanying People - One Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-medium">
                  Appointment Date <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value
                        // Validate date is not in the past
                        if (value) {
                          const selectedDate = new Date(value + 'T00:00:00')
                          selectedDate.setHours(0, 0, 0, 0)
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          
                          if (selectedDate < today) {
                            // If past date, don't update and trigger validation
                            trigger('appointmentDate')
                            return
                          }
                        }
                        // Ensure date is in YYYY-MM-DD format
                        field.onChange(value)
                        // Clear time validation error when date changes
                        if (errors.appointmentTime) {
                          clearErrors('appointmentTime')
                        }
                        // Trigger validation to show error if any
                        trigger('appointmentDate')
                      }}
                      error={errors.appointmentDate?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">
                  Appointment Time <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="appointmentTime"
                  render={({ field }) => {
                    // Normalize date format for TimePicker
                    let normalizedDate = watch("appointmentDate")
                    if (normalizedDate && normalizedDate.includes('/')) {
                      const parts = normalizedDate.split('/')
                      if (parts.length === 3) {
                        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
                      }
                    }
                    return (
                      <TimePicker
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e)
                          // Clear date validation error when time changes
                          if (errors.appointmentDate) {
                            clearErrors('appointmentDate')
                          }
                        }}
                        error={errors.appointmentTime?.message}
                        selectedDate={normalizedDate}
                      />
                    )
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Accompanying People</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step={1}
                  placeholder="Number of people (e.g., 0, 1, 2)"
                  {...register("accompanyingCount")}
                  className={errors.accompanyingCount ? "border-destructive" : ""}
                />
                {errors.accompanyingCount && (
                  <span className="text-sm text-destructive">{errors.accompanyingCount.message}</span>
                )}
              </div>
            </div>

            {/* Purpose of Visit & Notes - One Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purpose" className="font-medium">
                  Purpose of Visit <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="purpose"
                  {...register("purpose")}
                  placeholder="Brief description of the visit purpose"
                  className={errors.purpose ? "border-destructive" : ""}
                  rows={4}
                />
                {errors.purpose && (
                  <span className="text-sm text-destructive">{errors.purpose.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Any additional information or special requirements"
                  className={errors.notes ? "border-destructive" : ""}
                  rows={4}
                />
                {errors.notes && (
                  <span className="text-sm text-destructive">{errors.notes.message}</span>
                )}
              </div>
            </div>

            {/* Vehicle Information (Optional) */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-5 w-5" />
                <h3 className="font-semibold">Vehicle Information (Optional)</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Vehicle Number */}
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber" className="font-medium">
                    Vehicle Number
                    <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
                  </Label>
                  <Input
                    id="vehicleNumber"
                    {...register("vehicleNumber")}
                    placeholder="e.g., DL01AB1234"
                    className={errors.vehicleNumber ? "border-destructive" : ""}
                  />
                  {errors.vehicleNumber && (
                    <span className="text-sm text-destructive">{errors.vehicleNumber.message}</span>
                  )}
                </div>

                {/* Vehicle Photo */}
                <div className="flex items-start justify-center md:justify-start">
                  <ImageUploadField
                    name="vehiclePhoto"
                    label="Vehicle Photo (Optional)"
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    initialUrl={watch("vehiclePhoto")}
                    enableImageCapture={true}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className={`w-full sm:w-auto ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span className="text-xs sm:text-sm">{isEditMode ? "Updating..." : "Scheduling..."}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">{isEditMode ? "Update" : "Schedule"} Appointment</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Approval Link Modal - Separate Modal */}
    {approvalLink && (
      <ApprovalLinkModal
        open={showApprovalLinkModal}
        onOpenChange={(open) => {
          setShowApprovalLinkModal(open)
          if (!open) {
            setApprovalLink(null)
            if (onSuccess) onSuccess()
          }
        }}
        approvalLink={approvalLink || ''}
        onCancel={() => {
          if (onSuccess) onSuccess()
        }}
      />
    )}
    </>
  )
}

export default NewAppointmentModal