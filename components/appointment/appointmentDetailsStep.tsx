"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/common/datePicker"
import { TimePicker } from "@/components/common/timePicker"
import { AppointmentDetails } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { Calendar, Clock, MapPin, FileText, User } from "lucide-react"

const appointmentDetailsSchema = yup.object({
  purpose: yup.string().required("Purpose of visit is required"),
  scheduledDate: yup.string().required("Scheduled date is required"),
  scheduledTime: yup.string().required("Scheduled time is required"),
  duration: yup.number().min(15, "Duration must be at least 15 minutes").required("Duration is required"),
  meetingRoom: yup.string().required("Meeting room is required"),
  notes: yup.string().optional().default(""),
})

type AppointmentDetailsFormData = yup.InferType<typeof appointmentDetailsSchema>

interface AppointmentDetailsStepProps {
  onComplete: (data: AppointmentDetails) => void
  initialData?: AppointmentDetails | null
  onEmployeeSelect: (employeeId: string) => void
  disabled?: boolean
}

export function AppointmentDetailsStep({ 
  onComplete, 
  initialData, 
  onEmployeeSelect, 
  disabled = false 
}: AppointmentDetailsStepProps) {
  const { data: employeesData } = useGetEmployeesQuery()
  const employees = employeesData?.employees || []
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AppointmentDetailsFormData>({
    resolver: yupResolver(appointmentDetailsSchema),
    defaultValues: {
      purpose: initialData?.purpose || "",
      scheduledDate: initialData?.scheduledDate || "",
      scheduledTime: initialData?.scheduledTime || "",
      duration: initialData?.duration || 60,
      meetingRoom: initialData?.meetingRoom || "",
      notes: initialData?.notes || "",
    }
  })

  const durationOptions = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" },
    { value: "240", label: "4 hours" },
  ]

  const meetingRoomOptions = [
    { value: "Conference Room A", label: "Conference Room A" },
    { value: "Conference Room B", label: "Conference Room B" },
    { value: "Meeting Room 1", label: "Meeting Room 1" },
    { value: "Meeting Room 2", label: "Meeting Room 2" },
    { value: "Board Room", label: "Board Room" },
    { value: "Training Room", label: "Training Room" },
    { value: "Video Conference Room", label: "Video Conference Room" },
    { value: "Other", label: "Other" },
  ]

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} - ${emp.department}`,
  }))

  const onSubmit = (data: AppointmentDetailsFormData) => {
    const appointmentDetails: AppointmentDetails = {
      purpose: data.purpose,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      duration: data.duration,
      meetingRoom: data.meetingRoom,
      notes: data.notes,
    }
    onComplete(appointmentDetails)
  }

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId)      // keep local state
    onEmployeeSelect(employeeId)
  }

  if (disabled) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Please complete Step 1 (Visitor Details) first</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee to Meet
          </CardTitle>
        </CardHeader>
        <CardContent>
        <SelectField
  label="Select Employee"
  placeholder="Choose employee to meet"
  options={employeeOptions}
  value={selectedEmployee}              // ✅ controlled value
  onChange={handleEmployeeChange}
  error={errors?.employeeId?.message}   // optional validation
/>
        </CardContent>
      </Card>

      {/* Appointment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Scheduled Date</label>
              <DatePicker
                value={watch("scheduledDate") || ""}
                onChange={(e) => setValue("scheduledDate", e.target.value)}
                placeholder="Select date"
                error={errors.scheduledDate?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Scheduled Time</label>
              <TimePicker
                value={watch("scheduledTime") || ""}
                onChange={(e) => setValue("scheduledTime", e.target.value)}
                placeholder="Select time"
                error={errors.scheduledTime?.message}
              />
            </div>
            <SelectField
              label="Duration"
              placeholder="Select duration"
              options={durationOptions}
              error={errors.duration?.message}
              value={watch("duration")?.toString() || ""}
              onChange={(value) => setValue("duration", parseInt(value))}
            />
            <SelectField
              label="Meeting Room"
              placeholder="Select meeting room"
              options={meetingRoomOptions}
              error={errors.meetingRoom?.message}
              value={watch("meetingRoom") || ""}
              onChange={(value) => setValue("meetingRoom", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Purpose and Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purpose & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the purpose of the visit in detail..."
            className="min-h-[100px]"
            {...register("purpose")}
          />
          {errors.purpose && (
            <p className="text-sm text-red-500">{errors.purpose.message}</p>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
            <Textarea
              placeholder="Any additional notes or special requirements..."
              className="min-h-[80px]"
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Complete Step 2 - Proceed to Security Details
        </Button>
      </div>
    </form>
  )
}
