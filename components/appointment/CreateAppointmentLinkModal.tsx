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

const createLinkSchema = yup.object().shape({
  visitorEmail: yup
    .string()
    .required("Visitor email is required")
    .email("Please enter a valid email address"),
  employeeId: yup.string().required("Employee is required"),
  expiresInDays: yup
    .number()
    .min(1, "Expiry must be at least 1 day")
    .max(90, "Expiry cannot exceed 90 days")
    .default(30)
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
      expiresInDays: 30,
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
      try {
        setGeneralError(null)
        const result = await createAppointmentLink({
          visitorEmail: data.visitorEmail.trim().toLowerCase(),
          employeeId: data.employeeId,
          expiresInDays: data.expiresInDays || 30,
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
                          Visitor exists in database
                        </span>
                      ) : (
                        <span className="text-blue-600 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          New visitor - will be created during booking
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
            <Label htmlFor="expiresInDays">Link Expires In (Days)</Label>
            <Controller
              name="expiresInDays"
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Input
                    {...field}
                    id="expiresInDays"
                    type="number"
                    min={1}
                    max={90}
                    placeholder="30"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 30)}
                  />
                  {errors.expiresInDays && (
                    <p className="text-sm text-red-500">{errors.expiresInDays.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Default: 30 days</p>
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
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
    </Dialog>
  )
}

