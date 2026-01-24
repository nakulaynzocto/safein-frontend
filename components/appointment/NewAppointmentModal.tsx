"use client"

import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { useGetEmployeesQuery, useGetEmployeeQuery } from "@/store/api/employeeApi"
import { useGetVisitorsQuery, useGetVisitorQuery, Visitor } from "@/store/api/visitorApi"
import { showSuccessToast } from "@/utils/toast"
import { Calendar, Car } from "lucide-react"
import { ApprovalLinkModal } from "./ApprovalLinkModal"
import { useDebounce } from "@/hooks/useDebounce"
import { appointmentSchema, type AppointmentFormData } from "./helpers/appointmentValidation"
import { createSelectOptions } from "./helpers/selectOptionsHelper"
import {
  createAppointmentPayload,
  createUpdateAppointmentPayload,
  formatEmployeeLabel,
  formatEmployeeSearchKeywords,
  formatVisitorLabel,
  formatVisitorSearchKeywords,
} from "./helpers/appointmentFormHelpers"
import {
  getDefaultFormValues,
  appointmentToFormValues,
} from "./helpers/formResetHelpers"

interface NewAppointmentModalProps {
  appointmentId?: string
  triggerButton?: ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewAppointmentModal({ appointmentId, triggerButton, onSuccess, open: controlledOpen, onOpenChange }: NewAppointmentModalProps) {
  const router = useRouter()
  
  // ========== All Hooks at Top ==========
  // State hooks
  const [internalOpen, setInternalOpen] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [approvalLink, setApprovalLink] = useState<string | null>(null)
  const [showApprovalLinkModal, setShowApprovalLinkModal] = useState(false)
  const [employeeSearchInput, setEmployeeSearchInput] = useState("")
  const [visitorSearchInput, setVisitorSearchInput] = useState("")
  
  // Debounced search values
  const debouncedEmployeeSearch = useDebounce(employeeSearchInput, 500)
  const debouncedVisitorSearch = useDebounce(visitorSearchInput, 500)
  
  // Modal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const isEditMode = !!appointmentId
  
  // API mutations
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation()
  const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation()
  const isLoading = isCreating || isUpdating
  
  // API queries
  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useGetEmployeesQuery({ 
    page: 1, 
    limit: 10,
    search: debouncedEmployeeSearch || undefined,
    status: "Active" as const,
  })
  const employees = employeesData?.employees || []
  
  const { data: visitorsData, isLoading: isLoadingVisitors, error: visitorsError } = useGetVisitorsQuery({ 
    page: 1, 
    limit: 10,
    search: debouncedVisitorSearch || undefined,
  })
  const visitors: Visitor[] = visitorsData?.visitors || []
  
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useGetAppointmentQuery(
    appointmentId || '',
    { skip: !appointmentId }
  )

  // Form hook
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
    defaultValues: getDefaultFormValues(),
  })

  // Watch form values
  const selectedEmployeeId = watch("employeeId")
  const selectedVisitorId = watch("visitorId")
  
  // Fetch selected items if not in current options
  const { data: selectedEmployeeData } = useGetEmployeeQuery(selectedEmployeeId || '', {
    skip: !selectedEmployeeId || employees.some(emp => emp._id === selectedEmployeeId)
  })
  const selectedEmployee = selectedEmployeeData
  
  const isSelectedVisitorInList = visitors.some(v => v._id === selectedVisitorId)
  const { data: selectedVisitorData } = useGetVisitorQuery(selectedVisitorId || '', {
    skip: !selectedVisitorId || isSelectedVisitorInList
  })
  const selectedVisitor = selectedVisitorData
  
  // Computed values
  const employeeOptions = useMemo(
    () => createSelectOptions({
      items: employees,
      selectedId: selectedEmployeeId,
      selectedItem: selectedEmployee,
      formatLabel: formatEmployeeLabel,
      formatSearchKeywords: formatEmployeeSearchKeywords,
      filterFn: (emp) => emp.status === "Active"
    }),
    [employees, selectedEmployeeId, selectedEmployee]
  )
  
  const visitorOptions = useMemo(
    () => createSelectOptions({
      items: visitors,
      selectedId: selectedVisitorId,
      selectedItem: selectedVisitor,
      formatLabel: formatVisitorLabel,
      formatSearchKeywords: formatVisitorSearchKeywords
    }),
    [visitors, selectedVisitorId, selectedVisitor]
  )

  // Callback handlers
  const handleEmployeeSearchChange = useCallback((inputValue: string) => {
    setEmployeeSearchInput(inputValue)
  }, [])
  
  const handleVisitorSearchChange = useCallback((inputValue: string) => {
    setVisitorSearchInput(inputValue)
  }, [])

  const handleVisitorSelect = useCallback((visitorId: string | null) => {
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

  // Effects
  useEffect(() => {
    if (!open) {
      reset()
      setGeneralError(null)
      setApprovalLink(null)
      clearErrors()
      setEmployeeSearchInput("")
      setVisitorSearchInput("")
    }
  }, [open, reset, clearErrors])

  useEffect(() => {
    if (isEditMode && existingAppointment && open) {
      reset(appointmentToFormValues(existingAppointment))
    }
  }, [isEditMode, existingAppointment, open, reset])

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
        const updateData = createUpdateAppointmentPayload(data, existingAppointment)
        await updateAppointment({ id: appointmentId, ...updateData }).unwrap()
        showSuccessToast("Appointment updated successfully!")
        setOpen(false)
        if (onSuccess) onSuccess()
      } else {
        const newAppointmentData = createAppointmentPayload(data)
        const result = await createAppointment(newAppointmentData).unwrap()
        showSuccessToast("Appointment created successfully")
        setOpen(false)
        
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
              <Alert data-testid="appointment-error-alert" variant="destructive">
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
                      testId="appointment-visitor-select"
                      value={field.value}
                      onChange={(val) => {
                        console.log("Visitor select change", { val })
                        field.onChange(val ?? "")
                        handleVisitorSelect(val)
                      }}
                      onInputChange={handleVisitorSearchChange}
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
                      testId="appointment-employee-select"
                      options={employeeOptions}
                      value={field.value}
                      onChange={(val) => {
                        console.log("Employee select change", { val })
                        field.onChange(val ?? "")
                      }}
                      onInputChange={handleEmployeeSearchChange}
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
                      testId="appointment-date"
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
                        testId="appointment-time"
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
                  data-testid="appointment-accompanying-count"
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
                  data-testid="appointment-purpose"
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
                  data-testid="appointment-notes"
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
                    data-testid="appointment-vehicle-number"
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
                    testId="appointment-vehicle-photo-upload"
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
                data-testid="appointment-submit-btn"
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