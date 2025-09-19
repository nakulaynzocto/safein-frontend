"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { DatePicker } from "@/components/common/datePicker"
import { TimePicker } from "@/components/common/timePicker"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { FileUpload } from "@/components/common/fileUpload"
import { useCreateAppointmentMutation } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { showSuccess, showError } from "@/utils/toaster"
import { routes } from "@/utils/routes"

const appointmentSchema = yup.object({
  visitorName: yup.string().required("Visitor name is required"),
  visitorEmail: yup.string().email("Invalid email address").required("Visitor email is required"),
  visitorPhone: yup.string().required("Visitor phone is required"),
  aadhaarNumber: yup.string().optional().matches(/^\d{12}$/, "Aadhaar number must be 12 digits").default(""),
  // aadhaarPhoto: yup.mixed().optional().default(null),
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
  // const [aadhaarPhoto, setAadhaarPhoto] = useState<File | null>(null)

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
      // aadhaarPhoto: undefined,
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
  }))

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const selectedEmployee = employees.find((emp) => emp._id === data.employeeId)
      const appointmentData = {
        ...data,
        employeeName: selectedEmployee?.name || "",
        // aadhaarPhoto,
      }
      await createAppointment(appointmentData).unwrap()
      showSuccess("Appointment created successfully")
      reset()
      // setAadhaarPhoto(null)
      router.push(routes.privateroute.APPOINTMENTLIST)
    } catch (error: any) {
      showError(error?.data?.message || error?.message || "Failed to create appointment")
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-none shadow-lg">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/50">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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

      {/* Appointment Form Card */}
      <Card className="w-full hover:shadow-xl transition-all duration-300">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Progress Indicator */}
            <div className="flex items-center mb-6">
              <div className="flex-1 h-1 bg-gray-200 rounded-full relative">
                <div className="absolute h-1 bg-primary rounded-full w-1/2"></div>
              </div>
              <div className="flex justify-between w-full text-sm mt-1">
                <span>Visitor Info</span>
                <span>Appointment Details</span>
              </div>
            </div>

            {/* Visitor Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Visitor Information
              </h3>

              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                <InputField
                  label="Visitor Name"
                  placeholder="Enter visitor's full name"
                  error={errors.visitorName?.message}
                  {...register("visitorName")}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="Enter visitor's email"
                  error={errors.visitorEmail?.message}
                  {...register("visitorEmail")}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                <InputField
                  label="Phone Number"
                  placeholder="Enter visitor's phone number"
                  error={errors.visitorPhone?.message}
                  {...register("visitorPhone")}
                />
                <InputField
                  label="Aadhaar Number (Optional)"
                  placeholder="Enter 12-digit Aadhaar number"
                  error={errors.aadhaarNumber?.message}
                  {...register("aadhaarNumber")}
                />
              </div>

              {/* <FileUpload
                label="Aadhaar Photo (Optional)"
                accept="image/*"
                maxSize={5}
                value={aadhaarPhoto}
                onChange={setAadhaarPhoto}
                placeholder="Upload Aadhaar card photo"
                error={errors.aadhaarPhoto?.message}
              /> */}
            </div>

            {/* Appointment Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appointment Details
              </h3>

              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                <SelectField
                  label="Employee to Meet"
                  placeholder="Select employee"
                  options={employeeOptions}
                  error={errors.employeeId?.message}
                  value={watch("employeeId") || ""}
                  onChange={(value) => setValue("employeeId", value)}
                />
                <InputField
                  label="Purpose of Visit"
                  placeholder="Brief description of the visit purpose"
                  error={errors.purpose?.message}
                  {...register("purpose")}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                <DatePicker
                  label="Appointment Date"
                  error={errors.appointmentDate?.message}
                  {...register("appointmentDate")}
                />
                <TimePicker
                  label="Appointment Time"
                  error={errors.appointmentTime?.message}
                  {...register("appointmentTime")}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto sm:min-w-[160px]"
                size="lg"
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Create Appointment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
