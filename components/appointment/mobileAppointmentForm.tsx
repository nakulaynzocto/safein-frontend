"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MobileForm, MobileInput, MobileTextarea, MobileSelect, MobileFormActions } from "@/components/common/mobileForm"
import { useGetEmployeesQuery, useCreateAppointmentMutation } from "@/store/api"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { routes } from "@/utils/routes"

const appointmentSchema = z.object({
  visitorName: z.string().min(1, "Visitor name is required"),
  visitorEmail: z.string().email("Invalid email address"),
  visitorPhone: z.string().min(1, "Phone number is required"),
  employeeId: z.string().min(1, "Please select an employee"),
  purpose: z.string().min(1, "Purpose is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
]

export function MobileAppointmentForm() {
  const router = useRouter()
  const { data: employeesData } = useGetEmployeesQuery()
  const employees = Array.isArray(employeesData) ? employeesData : []
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Convert simple form data to CreateAppointmentRequest format
      const appointmentData: any = {
        appointmentId: `APT-${Date.now()}`,
        employeeId: data.employeeId,
        visitorId: '', // Will be created by backend if not provided
        appointmentDetails: {
          purpose: data.purpose,
          scheduledDate: data.appointmentDate,
          scheduledTime: data.appointmentTime,
          duration: 60, // Default 60 minutes
          meetingRoom: '',
          notes: data.notes || '',
        },
        securityDetails: {
          badgeIssued: false,
          badgeNumber: '',
          securityClearance: false,
          securityNotes: '',
        },
        notifications: {
          email: true,
          sms: true,
        },
        checkInTime: new Date().toISOString(),
        // Legacy fields for backward compatibility
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail,
        visitorPhone: data.visitorPhone,
      }
      await createAppointment(appointmentData).unwrap()
      showSuccessToast("Appointment created successfully!")
      router.push(routes.privateroute.APPOINTMENTLIST)
    } catch (error: any) {
      showErrorToast(error?.data?.message || error?.message || "Failed to create appointment")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <MobileForm
      title="New Appointment"
      description="Schedule a new visitor appointment"
      onSubmit={handleSubmit(onSubmit)}
    >
      <MobileInput
        label="Visitor Name"
        placeholder="Enter visitor's full name"
        error={errors.visitorName?.message}
        required
        {...register("visitorName")}
      />

      <MobileInput
        label="Email Address"
        type="email"
        placeholder="visitor@example.com"
        error={errors.visitorEmail?.message}
        required
        {...register("visitorEmail")}
      />

      <MobileInput
        label="Phone Number"
        type="tel"
        placeholder="+91 86999 66076"
        error={errors.visitorPhone?.message}
        required
        {...register("visitorPhone")}
      />

      <MobileSelect
        label="Meeting With"
        placeholder="Select employee"
        error={errors.employeeId?.message}
        required
        value={watch("employeeId")}
        onValueChange={(value) => setValue("employeeId", value)}
      >
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.name} - {employee.department}
          </option>
        ))}
      </MobileSelect>

      <MobileInput
        label="Purpose"
        placeholder="Meeting purpose"
        error={errors.purpose?.message}
        required
        {...register("purpose")}
      />

      <MobileInput
        label="Appointment Date"
        type="date"
        error={errors.appointmentDate?.message}
        required
        {...register("appointmentDate")}
      />

      <MobileSelect
        label="Appointment Time"
        placeholder="Select time"
        error={errors.appointmentTime?.message}
        required
        value={watch("appointmentTime")}
        onValueChange={(value) => setValue("appointmentTime", value)}
      >
        {timeSlots.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </MobileSelect>

      <MobileTextarea
        label="Notes (Optional)"
        placeholder="Additional notes or special requirements"
        error={errors.notes?.message}
        {...register("notes")}
      />

      <MobileFormActions
        submitLabel={isLoading ? "Creating..." : "Create Appointment"}
        cancelLabel="Cancel"
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </MobileForm>
  )
}

