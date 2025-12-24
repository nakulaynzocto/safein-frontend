"use client"

import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { appointmentSchema, type AppointmentFormData } from "./helpers/appointmentValidation"
import { createAppointmentPayload } from "./helpers/appointmentFormHelpers"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/common/datePicker"
import { TimePicker } from "@/components/common/timePicker"
import { ImageUploadField } from "@/components/common/imageUploadField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Calendar, Clock, FileText, Car } from "lucide-react"
import { extractIdString, isValidId } from "@/utils/idExtractor"
import { showErrorToast } from "@/utils/toast"

interface AppointmentBookingFormProps {
  visitorId: string
  employeeId: string
  employeeName: string
  visitorEmail: string
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AppointmentBookingForm({
  visitorId,
  employeeId,
  employeeName,
  visitorEmail,
  onSubmit,
  isLoading = false,
}: AppointmentBookingFormProps) {
  const normalizedVisitorId = extractIdString(visitorId)
  const normalizedEmployeeId = extractIdString(employeeId)

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      visitorId: normalizedVisitorId,
      employeeId: normalizedEmployeeId,
      purpose: "",
      appointmentDate: "",
      appointmentTime: "",
      accompanyingCount: 0,
      notes: "",
      vehicleNumber: "",
      vehiclePhoto: "",
    },
  })

  const handleFormSubmit = (data: AppointmentFormData) => {
    if (!isValidId(normalizedVisitorId)) {
      showErrorToast('Invalid visitor ID. Please refresh the page and try again.')
      return
    }

    if (!isValidId(normalizedEmployeeId)) {
      showErrorToast('Invalid employee ID. Please refresh the page and try again.')
      return
    }

    const payload = {
      employeeId: normalizedEmployeeId,
      visitorId: normalizedVisitorId,
      accompanyingCount: data.accompanyingCount ?? 0,
      appointmentDetails: {
        purpose: data.purpose,
        scheduledDate: data.appointmentDate,
        scheduledTime: data.appointmentTime,
        duration: 60,
        meetingRoom: "Main Conference Room",
        notes: data.notes || "",
        vehicleNumber: data.vehicleNumber || "",
        vehiclePhoto: data.vehiclePhoto || "",
      },
      securityDetails: {
        badgeIssued: false,
        badgeNumber: "",
        securityClearance: false,
        securityNotes: "",
      },
      notifications: {
        smsSent: false,
        emailSent: false,
        whatsappSent: false,
        reminderSent: false,
      },
    }
    onSubmit(payload)
  }

        return (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      <div className="space-y-2">
        <Label htmlFor="purpose" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Purpose of Visit <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="purpose"
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <Textarea
                {...field}
                id="purpose"
                placeholder="Enter the purpose of your visit"
                rows={3}
                className={errors.purpose ? "border-red-500" : ""}
              />
              {errors.purpose && (
                <p className="text-sm text-red-500">{errors.purpose.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointmentDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointment Date <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="appointmentDate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <DatePicker
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className={errors.appointmentDate ? "border-red-500" : ""}
                />
                {errors.appointmentDate && (
                  <p className="text-sm text-red-500">{errors.appointmentDate.message}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointmentTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Appointment Time <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="appointmentTime"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <TimePicker
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className={errors.appointmentTime ? "border-red-500" : ""}
                />
                {errors.appointmentTime && (
                  <p className="text-sm text-red-500">{errors.appointmentTime.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accompanyingCount">Accompanying People</Label>
        <Controller
          name="accompanyingCount"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="accompanyingCount"
              type="number"
              min={0}
              max={20}
              placeholder="0"
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="notes"
              placeholder="Any additional information..."
              rows={3}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleNumber" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Number (Optional)
          </Label>
          <Controller
            name="vehicleNumber"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="vehicleNumber"
                placeholder="Enter vehicle number"
              />
            )}
          />
        </div>

               <div className="space-y-2">
                 <Label htmlFor="vehiclePhoto">Vehicle Photo (Optional)</Label>
                 <ImageUploadField
                   name="vehiclePhoto"
                   register={register}
                   setValue={setValue}
                   errors={errors.vehiclePhoto}
                   label="Upload Vehicle Photo"
                 />
               </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Booking Appointment...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </div>
    </form>
  )
}

