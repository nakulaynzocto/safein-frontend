"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { TextareaField } from "@/components/common/textareaField"
import { DatePicker } from "@/components/common/datePicker"
import { TimePicker } from "@/components/common/timePicker"
import { AppointmentDetails } from "@/store/api/appointmentApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { Calendar, Clock, MapPin, FileText, User } from "lucide-react"

const appointmentDetailsSchema = yup.object({
  employeeId: yup.string().required("Please select an employee"),
  purpose: yup.string().required("Purpose of visit is required"),
  scheduledDate: yup.string().required("Scheduled date is required").test(
    'not-past-date',
    'Scheduled date cannot be in the past',
    function (value) {
      if (!value) return false
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      return selectedDate >= today
    }
  ),
  scheduledTime: yup.string().required("Scheduled time is required"),
  duration: yup.number().min(15, "Duration must be at least 15 minutes").required("Duration is required"),
  meetingRoom: yup.string().required("Meeting room is required"),
  notes: yup.string().notRequired().default(""),
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
      employeeId: selectedEmployee || "",
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

  const employeeOptions = employees
    .filter((emp) => emp.status === "Active")
    .map((emp) => ({
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
    setValue("employeeId", employeeId)   // update form value
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
            value={watch("employeeId") || selectedEmployee}
            onChange={handleEmployeeChange}
            error={errors?.employeeId?.message}
            name="employeeId"
            required
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
              <DatePicker
                label="Scheduled Date"
                value={watch("scheduledDate") || ""}
                onChange={(e) => setValue("scheduledDate", e.target.value)}
                placeholder="Select date"
                error={errors.scheduledDate?.message}
                required
              />
            </div>
            <div>
              <TimePicker
                label="Scheduled Time"
                value={watch("scheduledTime") || ""}
                onChange={(e) => setValue("scheduledTime", e.target.value)}
                placeholder="Select time"
                error={errors.scheduledTime?.message}
                required
              />
            </div>
            <SelectField
              label="Duration"
              placeholder="Select duration"
              options={durationOptions}
              error={errors.duration?.message}
              value={watch("duration")?.toString() || ""}
              onChange={(value) => setValue("duration", parseInt(value))}
              required
            />
            <SelectField
              label="Meeting Room"
              placeholder="Select meeting room"
              options={meetingRoomOptions}
              error={errors.meetingRoom?.message}
              value={watch("meetingRoom") || ""}
              onChange={(value) => setValue("meetingRoom", value)}
              required
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
          <div>
            <TextareaField
              label="Purpose of Visit"
              placeholder="Describe the purpose of the visit in detail..."
              className="min-h-[100px]"
              {...register("purpose")}
              error={errors.purpose?.message}
              required
            />
          </div>

          <div>
            <TextareaField
              label="Additional Notes (Optional)"
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
