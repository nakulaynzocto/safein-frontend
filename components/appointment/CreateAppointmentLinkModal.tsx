"use client"

import { useState, useCallback, useEffect, type ReactNode } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SelectField } from "@/components/common/selectField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useCreateAppointmentLinkMutation, useCheckVisitorExistsQuery } from "@/store/api/appointmentLinkApi"
import { useGetEmployeesQuery } from "@/store/api/employeeApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { isValidEmail } from "@/utils/helpers"
import { Link2, Mail, User } from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"

const EXPIRATION_CONFIG = {
  "30m": { days: 0.0208, label: "30 minutes" },
  "1h": { days: 0.0417, label: "1 hour" },
  "2h": { days: 0.0833, label: "2 hours" },
  "4h": { days: 0.1667, label: "4 hours" },
  "8h": { days: 0.3333, label: "8 hours" },
  "1day": { days: 1, label: "1 day" },
  "2day": { days: 2, label: "2 days" },
  "3day": { days: 3, label: "3 days" },
  "4day": { days: 4, label: "4 days" },
  "5day": { days: 5, label: "5 days" },
} as const

const EXPIRATION_OPTIONS = Object.entries(EXPIRATION_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))

const DAYS_TO_DISPLAY_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(EXPIRATION_CONFIG).map(([display, config]) => [config.days, display])
) as Record<number, string>

const DISPLAY_TO_DAYS_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(EXPIRATION_CONFIG).map(([display, config]) => [display, config.days])
) as Record<string, number>

const getDisplayValue = (days: number): string => {
  return DAYS_TO_DISPLAY_MAP[days] || "1day"
}

const convertToDays = (value: string): number => {
  return DISPLAY_TO_DAYS_MAP[value] || 1
}

const createLinkSchema = yup.object().shape({
  visitorEmail: yup
    .string()
    .required("Visitor email is required")
    .email("Please enter a valid email address"),
  employeeId: yup.string().required("Employee is required"),
  expiresInDays: yup
    .number()
    .min(0.0208, "Expiry must be at least 30 minutes")
    .max(5, "Expiry cannot exceed 5 days")
    .default(1)
    .required(),
})

interface CreateAppointmentLinkFormData {
  visitorEmail: string
  employeeId: string
  expiresInDays: number
}

interface CreateAppointmentLinkModalProps {
  triggerButton?: ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateAppointmentLinkModal({
  triggerButton,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: CreateAppointmentLinkModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [visitorExists, setVisitorExists] = useState<boolean | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const { hasReachedAppointmentLimit } = useSubscriptionStatus()

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [createAppointmentLink, { isLoading: isCreating }] = useCreateAppointmentLinkMutation()

  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useGetEmployeesQuery({
    page: 1,
    limit: 100,
    status: "Active" as const,
  })

  const employees = employeesData?.employees || []

  const employeeOptions = employees
    .filter((emp) => emp.status === "Active" && !emp.isDeleted)
    .map((emp) => ({
      value: emp._id,
      label: `${emp.name} (${emp.email})`,
    }))

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CreateAppointmentLinkFormData>({
    resolver: yupResolver(createLinkSchema),
    defaultValues: {
      visitorEmail: "",
      employeeId: "",
      expiresInDays: 1,
    },
  })

  const visitorEmail = watch("visitorEmail")
  const [debouncedEmail, setDebouncedEmail] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (visitorEmail && isValidEmail(visitorEmail)) {
        setDebouncedEmail(visitorEmail.trim().toLowerCase())
      } else {
        setDebouncedEmail("")
        setVisitorExists(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [visitorEmail])

  const { data: visitorCheckData, isLoading: isCheckingVisitor } = useCheckVisitorExistsQuery(
    debouncedEmail,
    {
      skip: !debouncedEmail || !isValidEmail(debouncedEmail),
    }
  )

  useEffect(() => {
    if (debouncedEmail && visitorCheckData !== undefined) {
      setVisitorExists(visitorCheckData.exists)
    } else if (!debouncedEmail) {
      setVisitorExists(null)
    }
  }, [debouncedEmail, visitorCheckData])

  const onSubmit = useCallback(
    async (data: CreateAppointmentLinkFormData) => {
      if (hasReachedAppointmentLimit) {
        setShowUpgradeModal(true)
        return
      }
      try {
        setGeneralError(null)
        const result = await createAppointmentLink({
          visitorEmail: data.visitorEmail.trim().toLowerCase(),
          employeeId: data.employeeId,
          expiresInDays: data.expiresInDays || 1,
        }).unwrap()

        showSuccessToast("Appointment link created and email sent successfully!")
        reset()
        setOpen(false)
        setVisitorExists(null)
        onSuccess?.()
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || error?.message || "Failed to create appointment link"
        setGeneralError(errorMessage)
        showErrorToast(errorMessage)
      }
    },
    [createAppointmentLink, reset, setOpen, onSuccess]
  )

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      reset()
      setGeneralError(null)
      setVisitorExists(null)
    }
  }, [setOpen, reset])

  const handleClose = useCallback(() => {
    setOpen(false)
    reset()
    setGeneralError(null)
    setVisitorExists(null)
  }, [setOpen, reset])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-500" />
            Create Appointment Link
          </DialogTitle>
          <DialogDescription>
            Generate a secure booking link that visitors can use to schedule appointments. The link will be sent via email and expires based on your selected duration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {generalError && (
            <Alert variant="destructive">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="visitorEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Visitor Email <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="visitorEmail"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Input
                    {...field}
                    id="visitorEmail"
                    type="email"
                    placeholder="visitor@example.com"
                    className={errors.visitorEmail ? "border-red-500" : ""}
                  />
                  {errors.visitorEmail && (
                    <p className="text-sm text-red-500">{errors.visitorEmail.message}</p>
                  )}
                  {isCheckingVisitor && (
                    <p className="text-sm text-gray-500">Checking visitor...</p>
                  )}
                  {visitorExists !== null && !isCheckingVisitor && (
                    <div className="flex items-center gap-2 text-sm">
                      {visitorExists ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          This visitor is already registered
                        </span>
                      ) : (
                        <span className="text-blue-600 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          New visitor - will be registered during booking
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">
              Employee <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <SelectField
                    value={field.value}
                    onChange={field.onChange}
                    options={employeeOptions}
                    placeholder={isLoadingEmployees ? "Loading employees..." : employeeOptions.length === 0 ? "No active employees found" : "Select employee"}
                    isLoading={isLoadingEmployees}
                    className={errors.employeeId ? "border-red-500" : ""}
                  />
                  {employeesError && (
                    <p className="text-sm text-red-500">Failed to load employees. Please try again.</p>
                  )}
                  {errors.employeeId && (
                    <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                  )}
                  {!isLoadingEmployees && employeeOptions.length === 0 && !employeesError && (
                    <p className="text-sm text-yellow-600">No active employees available. Please add employees first.</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresInDays">Link Expires In</Label>
            <Controller
              name="expiresInDays"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <SelectField
                    value={getDisplayValue(field.value || 1)}
                    onChange={(value) => field.onChange(convertToDays(value))}
                    options={EXPIRATION_OPTIONS}
                    placeholder="Select expiration time"
                    className={errors.expiresInDays ? "border-red-500" : ""}
                  />
                  {errors.expiresInDays && (
                    <p className="text-sm text-red-500">{errors.expiresInDays.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Default: 1 day</p>
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" disabled={isCreating}>
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </Dialog>
  )
}

