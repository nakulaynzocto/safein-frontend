"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { DatePicker } from "@/components/common/datePicker"
import { TimePicker } from "@/components/common/timePicker"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { FileUpload } from "@/components/common/fileUpload"
import { useCreateAppointmentMutation } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { Calendar, User, CheckCircle } from "lucide-react"

const appointmentSchema = yup.object({
  visitorName: yup.string().required("Visitor name is required"),
  visitorEmail: yup.string().email("Invalid email address").required("Visitor email is required"),
  visitorPhone: yup.string().required("Visitor phone is required"),
  aadhaarNumber: yup.string().optional().matches(/^\d{12}$/, "Aadhaar number must be 12 digits").default(""),
  employeeId: yup.string().required("Please select an employee"),
  purpose: yup.string().required("Purpose of visit is required"),
  appointmentDate: yup.string().required("Appointment date is required"),
  appointmentTime: yup.string().required("Appointment time is required"),
  notes: yup.string().optional().default(""),
})

type AppointmentFormData = yup.InferType<typeof appointmentSchema>

export function AppointmentForm() {
  const router = useRouter()
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation()
  const { data: employeesData } = useGetEmployeesQuery()
  const employees = employeesData?.employees || []
  const [generalError, setGeneralError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      visitorName: "",
      visitorEmail: "",
      visitorPhone: "",
      aadhaarNumber: "",
      employeeId: "",
      purpose: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
    }
  })

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} - ${emp.department}`,
    searchKeywords: `${emp.name} ${emp.email ?? ""} ${emp.phone ?? ""} ${emp.department ?? ""} ${emp.designation ?? ""}`.trim(),
  }))

  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const onSubmit = async (data: AppointmentFormData) => {
    setGeneralError(null)
    
    try {
      const selectedEmployee = employees.find((emp) => emp._id === data.employeeId)
      const appointmentData = {
        appointmentId: `APT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        employeeId: data.employeeId,
        visitorId: "temp-visitor-id", // This should be created first
        checkInTime: new Date().toISOString(), // Auto-set check-in time on creation
        appointmentDetails: {
          purpose: data.purpose,
          scheduledDate: data.appointmentDate,
          scheduledTime: data.appointmentTime,
          duration: 60, // Default 1 hour
          meetingRoom: "Main Conference Room",
          notes: data.notes || ""
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
      await createAppointment(appointmentData).unwrap()
      showSuccessToast("Appointment created successfully")
      reset()
      router.push(routes.privateroute.APPOINTMENTLIST)
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create appointment"
      setGeneralError(errorMessage)
      showErrorToast(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-none shadow-lg">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/50">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Schedule New Appointment</h2>
              <p className="text-sm text-muted-foreground">
                Fill out the details below to add a visitor appointment quickly and securely.
              </p>
            </div>
          </div>

          {/* Optional stats */}
          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold text-primary">3 Appointments Today</span>
            <span className="text-sm text-muted-foreground">Keep track of upcoming meetings</span>
          </div>
        </CardContent>
      </Card>

      {/* General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Appointment Form Card */}
      <Card className="w-full hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" onChange={clearGeneralError}>
            {/* Visitor Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <User className="h-5 w-5" />
                Visitor Information
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Visitor Name"
                  placeholder="Enter visitor's full name"
                  error={errors.visitorName?.message}
                  {...register("visitorName")}
                  required
                />
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="Enter visitor's email"
                  error={errors.visitorEmail?.message}
                  {...register("visitorEmail")}
                  required
                />
                <InputField
                  label="Phone Number"
                  placeholder="Enter visitor's phone number"
                  error={errors.visitorPhone?.message}
                  {...register("visitorPhone")}
                  required
                />
                <InputField
                  label="Aadhaar Number (Optional)"
                  placeholder="Enter 12-digit Aadhaar number"
                  error={errors.aadhaarNumber?.message}
                  {...register("aadhaarNumber")}
                />
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Employee to Meet"
                  placeholder="Select employee"
                  options={employeeOptions}
                  error={errors.employeeId?.message}
                  value={watch("employeeId") || ""}
                  onChange={(value) => setValue("employeeId", value)}
                  name="employeeId"
                  required
                />
                <InputField
                  label="Purpose of Visit"
                  placeholder="Brief description of the visit purpose"
                  error={errors.purpose?.message}
                  {...register("purpose")}
                  required
                />
                <DatePicker
                  label="Appointment Date"
                  error={errors.appointmentDate?.message}
                  {...register("appointmentDate")}
                  required
                />
                <TimePicker
                  label="Appointment Time"
                  error={errors.appointmentTime?.message}
                  {...register("appointmentTime")}
                  selectedDate={watch("appointmentDate")}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Additional Notes (Optional)</label>
                <Textarea
                  placeholder="Any additional information or special requirements"
                  className="min-h-[120px] resize-none"
                  {...register("notes")}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="btn-hostinger btn-hostinger-primary px-6 py-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Appointment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Appointment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
