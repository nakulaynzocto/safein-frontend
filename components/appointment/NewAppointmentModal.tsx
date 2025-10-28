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
import { useGetVisitorsQuery, Visitor } from "@/store/api/visitorApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { Calendar, User } from "lucide-react"

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
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }),
  appointmentTime: yup.string().required("Appointment time is required").test('future-time', 'Scheduled time cannot be in the past', function(value) {
    if (!value) return false
    const appointmentDate = this.parent.appointmentDate
    if (!appointmentDate) return true
    
    const selectedDateTime = new Date(`${appointmentDate} ${value}`)
    const now = new Date()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(appointmentDate)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate.getTime() === today.getTime()) {
      return selectedDateTime > now
    }
    
    return true
  }),
  notes: yup.string().optional().default(""),
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
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation()
  const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation()
  const { data: employeesData } = useGetEmployeesQuery()
  const employees = employeesData?.employees || []
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  
  const isEditMode = !!appointmentId
  const isLoading = isCreating || isUpdating
  
  const { data: existingAppointment, isLoading: isLoadingAppointment } = useGetAppointmentQuery(
    appointmentId || '',
    { skip: !appointmentId }
  )

  const employeeOptions = React.useMemo(() => 
    employees.map((emp) => ({
      value: emp._id,
      label: `${emp.name} - ${emp.department}`,
    })),
    [employees]
  )

  const { data: visitorsData } = useGetVisitorsQuery({ page: 1, limit: 100 })
  const visitors: Visitor[] = visitorsData?.visitors || []
  
  const visitorOptions = React.useMemo(() => 
    visitors.map((visitor) => ({
      value: visitor._id,
      label: `${visitor.name} - ${visitor.email}`,
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
    },
  })

  React.useEffect(() => {
    if (!open) {
      reset()
      setGeneralError(null)
      clearErrors()
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
      })
    }
  }, [isEditMode, existingAppointment, open, reset])

  const handleVisitorSelect = React.useCallback((visitorId: string) => {
    if (visitorId) {
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
      if (isEditMode && appointmentId) {
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
        const newAppointmentData = {
          appointmentId: `APT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          employeeId: data.employeeId,
          visitorId: data.visitorId,
          appointmentDetails: {
            purpose: data.purpose,
            scheduledDate: data.appointmentDate,
            scheduledTime: data.appointmentTime,
            duration: 60,
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
      if (onSuccess) onSuccess()
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? "Edit Appointment" : "Schedule New Appointment"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the appointment information."
              : "Fill in the details to schedule a new appointment."}
          </DialogDescription>
        </DialogHeader>

        {isEditMode && isLoadingAppointment ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-sm text-gray-600">Loading appointment details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {generalError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {generalError}
                </AlertDescription>
              </Alert>
            )}

            {/* Visitor Selection */}
            <div className="space-y-2">
              <Label className="font-medium">Visitor</Label>
              <Controller
                name="visitorId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    placeholder="Select visitor"
                    options={visitorOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                      handleVisitorSelect(val)
                    }}
                    error={errors.visitorId?.message}
                  />
                )}
              />
            </div>

            {/* Employee Selection */}
            <div className="space-y-2">
              <Label className="font-medium">Employee to Meet</Label>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    placeholder="Select employee"
                    options={employeeOptions}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    error={errors.employeeId?.message}
                  />
                )}
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose" className="font-medium">Purpose of Visit</Label>
              <Textarea
                id="purpose"
                {...register("purpose")}
                placeholder="Brief description of the visit purpose"
                className={errors.purpose ? "border-destructive" : ""}
              />
              {errors.purpose && (
                <span className="text-sm text-destructive">{errors.purpose.message}</span>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium">Appointment Date</Label>
                <Controller
                  control={control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.appointmentDate?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Appointment Time</Label>
                <Controller
                  control={control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <TimePicker
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.appointmentTime?.message}
                      minTime={(() => {
                        const selectedDate = watch("appointmentDate")
                        if (selectedDate) {
                          const today = new Date().toISOString().split('T')[0]
                          if (selectedDate === today) {
                            const now = new Date()
                            now.setHours(now.getHours() + 1)
                            return now.toTimeString().slice(0, 5)
                          }
                        }
                        return undefined
                      })()}
                    />
                  )}
                />
              </div>
            </div>


            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className={isLoading ? 'pointer-events-none opacity-70' : ''}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>{isEditMode ? "Updating..." : "Scheduling..."}</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update" : "Schedule"} Appointment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default NewAppointmentModal