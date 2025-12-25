"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { appointmentSchema, type AppointmentFormData } from "./helpers/appointmentValidation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EnhancedDatePicker } from "@/components/common/enhancedDatePicker"
import { EnhancedTimePicker } from "@/components/common/enhancedTimePicker"
import { ImageUploadField } from "@/components/common/imageUploadField"
import { InputField } from "@/components/common/inputField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { Calendar, Clock, FileText, Car, User } from "lucide-react"
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
  appointmentToken,
}: AppointmentBookingFormProps & { appointmentToken?: string }) {
  const normalizedVisitorId = extractIdString(visitorId)
  const normalizedEmployeeId = extractIdString(employeeId)
  const [showVehicleFields, setShowVehicleFields] = useState(false)

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    clearErrors,
    trigger,
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pt-2">
      {/* Visitor and Employee Info Display */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-600">Visitor</Label>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{visitorEmail || "Visitor"}</span>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-600">Meeting With</Label>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">{employeeName || "Employee"}</span>
          </div>
        </div>
      </div>

      {/* First Row: Appointment Date and Appointment Time */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="appointmentDate"
            render={({ field }) => (
              <EnhancedDatePicker
                label="Appointment Date"
                value={field.value}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    const selectedDate = new Date(value + 'T00:00:00')
                    selectedDate.setHours(0, 0, 0, 0)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    if (selectedDate < today) {
                      trigger('appointmentDate')
                      return
                    }
                  }
                  field.onChange(value)
                  if (errors.appointmentTime) {
                    clearErrors('appointmentTime')
                  }
                  trigger('appointmentDate')
                }}
                error={errors.appointmentDate?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="appointmentTime"
            render={({ field }) => {
              let normalizedDate = watch("appointmentDate")
              if (normalizedDate && normalizedDate.includes('/')) {
                const parts = normalizedDate.split('/')
                if (parts.length === 3) {
                  normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
                }
              }
              return (
                <EnhancedTimePicker
                  label="Appointment Time"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e)
                    if (errors.appointmentDate) {
                      clearErrors('appointmentDate')
                    }
                  }}
                  error={errors.appointmentTime?.message}
                  selectedDate={normalizedDate}
                  required
                />
              )
            }}
          />
        </div>
      </div>

      {/* Second Row: Purpose of Visit and Accompanying People */}
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Purpose of Visit"
            placeholder="Brief description of the visit purpose"
            error={errors.purpose?.message}
            {...register("purpose")}
            required
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Accompanying People <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              type="number"
              min={0}
              max={20}
              step={1}
              placeholder="Number of people (e.g., 0, 1, 2)"
              {...register("accompanyingCount")}
              className={`h-9 ${errors.accompanyingCount ? "border-destructive" : ""}`}
            />
            {errors.accompanyingCount && (
              <span className="text-xs text-destructive">{errors.accompanyingCount.message}</span>
            )}
          </div>
        </div>
      </div>

      {/* Visit Information Section */}
      <div className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Any additional information or special requirements"
            className={errors.notes ? "border-destructive" : ""}
            rows={4}
          />
          {errors.notes && (
            <span className="text-xs text-destructive">{errors.notes.message}</span>
          )}
        </div>
      </div>

      {/* Vehicle Fields Toggle */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-gray-600" />
            <div>
              <Label htmlFor="vehicle-toggle" className="text-sm font-medium cursor-pointer">
                Vehicle Information
              </Label>
              <p className="text-xs text-muted-foreground">Add vehicle details if applicable</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowVehicleFields(!showVehicleFields)}
            className="shrink-0"
          >
            {showVehicleFields ? "Hide" : "Add Vehicle"}
          </Button>
        </div>

        {showVehicleFields && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Vehicle Photo */}
              <div className="flex items-start justify-center md:justify-start">
                <ImageUploadField
                  name="vehiclePhoto"
                  label="Vehicle Photo (optional)"
                  register={register}
                  setValue={setValue}
                  errors={errors.vehiclePhoto}
                  initialUrl={watch("vehiclePhoto")}
                  enableImageCapture={true}
                  appointmentToken={appointmentToken}
                />
              </div>

              {/* Vehicle Number */}
              <div className="space-y-1.5">
                <Label htmlFor="vehicleNumber" className="text-sm font-medium">
                  Vehicle Number <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="vehicleNumber"
                  {...register("vehicleNumber")}
                  placeholder="e.g., DL01AB1234"
                  className={`h-9 ${errors.vehicleNumber ? "border-destructive" : ""}`}
                />
                {errors.vehicleNumber && (
                  <span className="text-xs text-destructive">{errors.vehicleNumber.message}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="bg-[#3882a5] hover:bg-[#2d6a87] text-white"
          size="lg"
        >
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

