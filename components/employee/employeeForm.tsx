"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useCreateEmployeeMutation, useUpdateEmployeeMutation, useGetEmployeeQuery, useGetEmployeeStatsQuery } from "@/store/api/employeeApi"
import { showSuccess, showError } from "@/utils/toaster"
import { routes } from "@/utils/routes"

// ✅ Validation schema
const employeeSchema = yup.object({
  employeeId: yup.string()
    .required("Employee ID is required")
    .matches(/^[A-Z0-9]+$/, "Employee ID must contain only uppercase letters and numbers")
    .min(2, "Employee ID must be at least 2 characters")
    .max(20, "Employee ID cannot exceed 20 characters"),
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone: yup.string()
    .required("Phone number is required")
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  whatsapp: yup.string()
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid WhatsApp number")
    .nullable(),
  department: yup.string().required("Department is required").min(2, "Department must be at least 2 characters").max(50, "Department cannot exceed 50 characters"),
  designation: yup.string().required("Designation is required").min(2, "Designation must be at least 2 characters").max(50, "Designation cannot exceed 50 characters"),
  role: yup.string().required("Role is required").min(2, "Role must be at least 2 characters").max(100, "Role cannot exceed 100 characters"),
  officeLocation: yup.string().required("Office location is required").min(2, "Office location must be at least 2 characters").max(100, "Office location cannot exceed 100 characters"),
  status: yup.string().oneOf(['Active', 'Inactive']).default('Active'),
})

type EmployeeFormData = {
  employeeId: string
  name: string
  email: string
  phone: string
  whatsapp?: string | null
  department: string
  designation: string
  role: string
  officeLocation: string
  status: 'Active' | 'Inactive'
}

// ✅ Department options
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

// ✅ Status options
const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

interface EmployeeFormProps {
  employeeId?: string
}

export function EmployeeForm({ employeeId }: EmployeeFormProps) {
  const router = useRouter()
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation()
  const [generalError, setGeneralError] = useState<string | null>(null)
  
  const isEditMode = !!employeeId
  const isLoading = isCreating || isUpdating
  
  // Fetch employee data for editing
  const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(employeeId!, {
    skip: !isEditMode
  })

  // Fetch employee stats for dynamic count
  const { data: employeeStats, isLoading: isLoadingStats } = useGetEmployeeStatsQuery()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      department: "",
      designation: "",
      role: "",
      officeLocation: "",
      status: "Active",
    },
  })

  // Update form when employee data is loaded
  useEffect(() => {
    if (isEditMode && employeeData) {
      reset({
        employeeId: employeeData.employeeId,
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        whatsapp: employeeData.whatsapp || "",
        department: employeeData.department,
        designation: employeeData.designation,
        role: employeeData.role,
        officeLocation: employeeData.officeLocation,
        status: employeeData.status,
      })
    }
  }, [isEditMode, employeeData, reset])

  // Clear general error when user starts typing
  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      // Clear any previous general errors
      setGeneralError(null)
      
      const employeeData = {
        ...data,
        whatsapp: data.whatsapp || undefined
      }
      
      if (isEditMode) {
        await updateEmployee({ id: employeeId!, ...employeeData }).unwrap()
        showSuccess("Employee updated successfully")
      } else {
        await createEmployee(employeeData).unwrap()
        showSuccess("Employee created successfully")
      }
      
      reset()
      router.push(routes.privateroute.EMPLOYEELIST)
    } catch (error: any) {
      // Handle field-specific validation errors from backend
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        // Set field-specific errors
        error.data.errors.forEach((fieldError: any) => {
          if (fieldError.field && fieldError.message) {
            setError(fieldError.field, {
              type: 'server',
              message: fieldError.message
            })
          }
        })
      } else if (error?.data?.message) {
        // Handle specific field errors from backend (e.g., duplicate email)
        const message = error.data.message.toLowerCase()
        if (message.includes('email') && message.includes('already exists')) {
          setError('email', {
            type: 'server',
            message: 'Email address is already registered'
          })
        } else if (message.includes('employee id') && message.includes('already exists')) {
          setError('employeeId', {
            type: 'server',
            message: 'Employee ID is already taken'
          })
        } else if (message.includes('phone') && message.includes('already exists')) {
          setError('phone', {
            type: 'server',
            message: 'Phone number is already registered'
          })
        } else {
          // Set general error for other errors
          setGeneralError(error.data.message)
        }
      } else {
        // Set general error for network or other errors
        const errorMessage = error?.message || "Failed to create employee"
        setGeneralError(errorMessage)
      }
    }
  }

  // Show loading state when fetching employee data for editing
  if (isEditMode && isLoadingEmployee) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
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
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isEditMode ? "Edit Employee" : "Add New Employee"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode 
                  ? "Update the personal and professional details of this team member."
                  : "Enter the personal and professional details of your new team member."
                }
              </p>
            </div>
          </div>

          {/* Optional stats */}
          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold text-primary">
              Total Employees: {isLoadingStats ? "..." : employeeStats?.totalEmployees || 0}
            </span>
            <span className="text-sm text-muted-foreground">Manage your team efficiently</span>
          </div>
        </CardContent>
      </Card>

      {/* Employee Form Card */}
      <Card className="w-full hover:shadow-xl transition-all duration-300">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* General Error Display */}
            {generalError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {generalError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Progress Indicator */}
            <div className="flex items-center mb-6">
              <div className="flex-1 h-1 bg-gray-200 rounded-full relative">
                <div className="absolute h-1 bg-primary rounded-full w-1/2"></div>
              </div>
              <div className="flex justify-between w-full text-sm mt-1">
                <span>Personal Info</span>
                <span>Professional Info</span>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="Employee ID"
                  placeholder="Enter employee ID (e.g., EMP001)"
                  error={errors.employeeId?.message}
                  {...register("employeeId", { onChange: clearGeneralError })}
                  required
                />
                <InputField
                  label="Full Name"
                  placeholder="Enter employee's full name"
                  error={errors.name?.message}
                  {...register("name")}
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  error={errors.email?.message}
                  {...register("email", { onChange: clearGeneralError })}
                  required
                />
                <InputField
                  label="Phone Number"
                  placeholder="Enter phone number"
                  error={errors.phone?.message}
                  {...register("phone", { onChange: clearGeneralError })}
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="WhatsApp Number"
                  placeholder="Enter WhatsApp number (optional)"
                  error={errors.whatsapp?.message}
                  {...register("whatsapp")}
                />
                <div /> {/* Empty column for alignment */}
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Professional Information
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <SelectField
                      label="Department"
                      placeholder="Select department"
                      options={departments}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      error={errors.department?.message}
                      required
                    />
                  )}
                />

                <InputField
                  label="Designation"
                  placeholder="Enter job designation"
                  error={errors.designation?.message}
                  {...register("designation")}
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="Role"
                  placeholder="Enter job role"
                  error={errors.role?.message}
                  {...register("role")}
                  required
                />

                <InputField
                  label="Office Location"
                  placeholder="Enter office location"
                  error={errors.officeLocation?.message}
                  {...register("officeLocation")}
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Status"
                      placeholder="Select status"
                      options={statusOptions}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      error={errors.status?.message}
                    />
                  )}
                />
                <div /> {/* Empty column for alignment */}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button 
                type="submit" 
                disabled={isLoading || isLoadingEmployee}
                className="w-full sm:w-auto sm:min-w-[160px]"
                size="lg"
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {isEditMode ? "Update Employee" : "Create Employee"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
