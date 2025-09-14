"use client"

import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InputField } from "@/components/common/input-field"
import { SelectField } from "@/components/common/select-field"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import { useCreateEmployeeMutation } from "@/store/api/employeeApi"
import { showSuccess, showError } from "@/utils/toaster"

// ✅ Validation schema
const employeeSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  department: yup.string().required("Department is required"),
  position: yup.string().required("Position is required"),
})

type EmployeeFormData = yup.InferType<typeof employeeSchema>

// ✅ Department options
const departments = [
  { value: "hr", label: "Human Resources" },
  { value: "it", label: "Information Technology" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations" },
  { value: "legal", label: "Legal" },
  { value: "executive", label: "Executive" },
]

export function EmployeeForm() {
  const router = useRouter()
  const [createEmployee, { isLoading }] = useCreateEmployeeMutation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(employeeSchema),
  })

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee({ ...data, isActive: true }).unwrap()
      showSuccess("Employee created successfully")
      reset()
      router.push("/employee/list")
    } catch (error: any) {
      showError(error?.data?.message || error?.message || "Failed to create employee")
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Add New Employee</h2>
              <p className="text-sm text-muted-foreground">
                Enter the personal and professional details of your new team member.
              </p>
            </div>
          </div>

          {/* Optional stats */}
          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold text-primary">Total Employees: 42</span>
            <span className="text-sm text-muted-foreground">Manage your team efficiently</span>
          </div>
        </CardContent>
      </Card>

      {/* Employee Form Card */}
      <Card className="w-full hover:shadow-xl transition-all duration-300">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
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
                  label="Full Name"
                  placeholder="Enter employee's full name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="Phone Number"
                  placeholder="Enter phone number"
                  error={errors.phone?.message}
                  {...register("phone")}
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
                    />
                  )}
                />

                <InputField
                  label="Position/Title"
                  placeholder="Enter job position or title"
                  error={errors.position?.message}
                  {...register("position")}
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
                Create Employee
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
