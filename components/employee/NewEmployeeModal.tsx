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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SelectField } from "@/components/common/selectField"
import { PhoneInputField } from "@/components/common/phoneInputField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, useGetEmployeeQuery } from "@/store/api/employeeApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"

const employeeSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone: yup.string()
    .required("Phone number is required")
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  department: yup.string().required("Department is required").min(2, "Department must be at least 2 characters").max(50, "Department cannot exceed 50 characters"),
  status: yup.string().oneOf(['Active', 'Inactive']).default('Active'),
})

type EmployeeFormData = {
  name: string
  email: string
  phone: string
  department: string
  status: 'Active' | 'Inactive'
}

const departments = [
  { value: "Engineering", label: "Engineering" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Finance", label: "Finance" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "Operations", label: "Operations" },
  { value: "Legal", label: "Legal" },
  { value: "Executive", label: "Executive" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Product Management", label: "Product Management" },
]

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

interface NewEmployeeModalProps {
  employeeId?: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewEmployeeModal({ employeeId, trigger, onSuccess, open: controlledOpen, onOpenChange }: NewEmployeeModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation()
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  
  const isEditMode = !!employeeId
  const isLoading = isCreating || isUpdating
  
  const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(employeeId!, {
    skip: !isEditMode
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
      status: "Active",
    },
  })

  React.useEffect(() => {
    if (isEditMode && employeeData) {
      reset({
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        department: employeeData.department,
        status: employeeData.status,
      })
    }
  }, [isEditMode, employeeData, reset])

  React.useEffect(() => {
    if (!open) {
      reset()
      setGeneralError(null)
      clearErrors()
    }
  }, [open, reset, clearErrors])

  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setGeneralError(null)
      
      const employeeData = {
        ...data
      }
      
      if (isEditMode) {
        await updateEmployee({ id: employeeId!, ...employeeData }).unwrap()
        showSuccessToast("Employee updated successfully")
      } else {
        await createEmployee(employeeData).unwrap()
        showSuccessToast("Employee created successfully")
      }
      
      setOpen(false)
      reset()
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(routes.privateroute.EMPLOYEELIST)
      }
    } catch (error: any) {
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        error.data.errors.forEach((fieldError: any) => {
          if (fieldError.field && fieldError.message) {
            setError(fieldError.field, {
              type: 'server',
              message: fieldError.message
            })
          }
        })
      } else if (error?.data?.message) {
        const message = error.data.message.toLowerCase()
        if (message.includes('email') && message.includes('already exists')) {
          setError('email', {
            type: 'server',
            message: 'Email address is already registered'
          })
        } else if (message.includes('phone') && message.includes('already exists')) {
          setError('phone', {
            type: 'server',
            message: 'Phone number is already registered'
          })
        } else {
          setGeneralError(error.data.message)
        }
      } else {
        const errorMessage = error?.message || "Failed to create employee"
        setGeneralError(errorMessage)
      }
    }
  }

  const defaultTrigger = (
    <Button variant="default">
      {isEditMode ? "Edit Employee" : "New Employee"}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center gap-3">

            <div>
              <DialogTitle className="text-xl">
                {isEditMode ? "Edit Employee" : "Personal Information"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {isEditMode && isLoadingEmployee ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
            {generalError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {generalError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter employee's full name"
                    aria-required="true"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <span className="text-sm text-destructive">{errors.name.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { onChange: clearGeneralError })}
                    placeholder="Enter email address"
                    aria-required="true"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <span className="text-sm text-destructive">{errors.email.message}</span>
                  )}
                </div>
              </div>

              <div className="mb-64 sm:mb-0">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInputField
                      id="phone"
                      label="Phone Number"
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        clearGeneralError();
                      }}
                      error={errors.phone?.message}
                      required
                      placeholder="Enter phone number"
                      defaultCountry="in"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Professional Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium">
                        Department <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="department"
                        placeholder="Enter department"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        aria-required="true"
                        className={errors.department ? "border-destructive" : ""}
                      />
                      {errors.department && (
                        <span className="text-sm text-destructive">{errors.department.message}</span>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium">Status</Label>
                      <SelectField
                        placeholder="Select status"
                        options={statusOptions}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        error={errors.status?.message}
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isLoadingEmployee}
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {isEditMode ? "Update Employee" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default NewEmployeeModal
