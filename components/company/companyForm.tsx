"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { FileUpload } from "@/components/common/fileUpload"
import { useCreateCompanyMutation } from "@/store/api/companyApi"
import { showSuccess, showError } from "@/utils/toaster"
import { Building2, MapPin, User, Settings, CreditCard, CheckCircle } from "lucide-react"
import { routes } from "@/utils/routes"

const companySchema = yup.object({
  companyName: yup.string().required("Company name is required"),
  companyCode: yup.string().required("Company code is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup.object({
    street: yup.string().required("Street address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
    zipCode: yup.string().required("ZIP code is required"),
  }),
  contactPerson: yup.object({
    name: yup.string().required("Contact person name is required"),
    email: yup.string().email("Invalid email address").required("Contact person email is required"),
    phone: yup.string().required("Contact person phone is required"),
    designation: yup.string().required("Designation is required"),
  }),
  subscription: yup.object({
    plan: yup.string().oneOf(['basic', 'premium', 'enterprise']).required("Plan is required"),
    maxEmployees: yup.number().min(1).required("Max employees is required"),
    maxVisitorsPerMonth: yup.number().min(1).required("Max visitors per month is required"),
    endDate: yup.string().required("End date is required"),
  }),
  settings: yup.object({
    allowAadhaarVerification: yup.boolean(),
    requireAadhaarPhoto: yup.boolean(),
    allowWhatsAppNotifications: yup.boolean(),
    allowEmailNotifications: yup.boolean(),
    workingHours: yup.object({
      start: yup.string().required("Start time is required"),
      end: yup.string().required("End time is required"),
      workingDays: yup.array().of(yup.number()).min(1, "At least one working day is required"),
    }),
    timezone: yup.string().required("Timezone is required"),
    primaryColor: yup.string().required("Primary color is required"),
    secondaryColor: yup.string().required("Secondary color is required"),
  }),
})

type CompanyFormData = yup.InferType<typeof companySchema>

const subscriptionPlans = [
  { value: 'basic', label: 'Basic Plan' },
  { value: 'premium', label: 'Premium Plan' },
  { value: 'enterprise', label: 'Enterprise Plan' },
]

const timezones = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
]

const workingDays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
]

export function CompanyForm() {
  const router = useRouter()
  const [createCompany, { isLoading }] = useCreateCompanyMutation()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CompanyFormData>({
    resolver: yupResolver(companySchema),
    defaultValues: {
      companyName: "",
      companyCode: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "India",
        zipCode: "",
      },
      contactPerson: {
        name: "",
        email: "",
        phone: "",
        designation: "",
      },
      subscription: {
        plan: "basic",
        maxEmployees: 10,
        maxVisitorsPerMonth: 100,
        endDate: "",
      },
      settings: {
        allowAadhaarVerification: true,
        requireAadhaarPhoto: false,
        allowWhatsAppNotifications: true,
        allowEmailNotifications: true,
        workingHours: {
          start: "09:00",
          end: "18:00",
          workingDays: [1, 2, 3, 4, 5],
        },
        timezone: "Asia/Kolkata",
        primaryColor: "#3B82F6",
        secondaryColor: "#1E40AF",
      },
    },
  })

  // Clear general error when user starts typing
  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const onSubmit = async (data: CompanyFormData) => {
    setGeneralError(null)
    
    try {
      const companyData = {
        ...data,
        settings: {
          ...data.settings,
          logo: logoFile ? await convertFileToBase64(logoFile) : undefined,
        } as any, // Type assertion to handle the logo field
      }

      await createCompany(companyData).unwrap()
      showSuccess("Company created successfully!")
      router.push(routes.privateroute.DASHBOARD)
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create company. Please try again."
      setGeneralError(errorMessage)
      showError(errorMessage)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
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
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Company Setup</h2>
              <p className="text-sm text-muted-foreground">
                Complete your company profile to get started with SafeIn
              </p>
            </div>
          </div>

          {/* Optional stats */}
          <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">1</div>
              <div>Step</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">5</div>
              <div>Sections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Company Form Card */}
      <Card className="w-full hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" onChange={clearGeneralError}>
            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Building2 className="h-5 w-5" />
                Company Information
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Company Name"
                  placeholder="Enter company name"
                  error={errors.companyName?.message}
                  {...register("companyName")}
                />
                <InputField
                  label="Company Code"
                  placeholder="Enter company code"
                  error={errors.companyCode?.message}
                  {...register("companyCode")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Email"
                  type="email"
                  placeholder="company@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <InputField
                  label="Phone"
                  placeholder="+91 9876543210"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MapPin className="h-5 w-5" />
                Address Information
              </div>
              <InputField
                label="Street Address"
                placeholder="Enter street address"
                error={errors.address?.street?.message}
                {...register("address.street")}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="City"
                  placeholder="Enter city"
                  error={errors.address?.city?.message}
                  {...register("address.city")}
                />
                <InputField
                  label="State"
                  placeholder="Enter state"
                  error={errors.address?.state?.message}
                  {...register("address.state")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Country"
                  placeholder="Enter country"
                  error={errors.address?.country?.message}
                  {...register("address.country")}
                />
                <InputField
                  label="ZIP Code"
                  placeholder="Enter ZIP code"
                  error={errors.address?.zipCode?.message}
                  {...register("address.zipCode")}
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <User className="h-5 w-5" />
                Contact Person
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Name"
                  placeholder="Enter contact person name"
                  error={errors.contactPerson?.name?.message}
                  {...register("contactPerson.name")}
                />
                <InputField
                  label="Designation"
                  placeholder="Enter designation"
                  error={errors.contactPerson?.designation?.message}
                  {...register("contactPerson.designation")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Email"
                  type="email"
                  placeholder="contact@example.com"
                  error={errors.contactPerson?.email?.message}
                  {...register("contactPerson.email")}
                />
                <InputField
                  label="Phone"
                  placeholder="+91 9876543210"
                  error={errors.contactPerson?.phone?.message}
                  {...register("contactPerson.phone")}
                />
              </div>
            </div>

            {/* Subscription */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <CreditCard className="h-5 w-5" />
                Subscription Plan
              </div>
              <SelectField
                label="Plan"
                placeholder="Select subscription plan"
                options={subscriptionPlans}
                error={errors.subscription?.plan?.message}
                value={watch("subscription.plan") || ""}
                onChange={(value) => setValue("subscription.plan", value as any)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Max Employees"
                  type="number"
                  placeholder="10"
                  error={errors.subscription?.maxEmployees?.message}
                  {...register("subscription.maxEmployees", { valueAsNumber: true })}
                />
                <InputField
                  label="Max Visitors Per Month"
                  type="number"
                  placeholder="100"
                  error={errors.subscription?.maxVisitorsPerMonth?.message}
                  {...register("subscription.maxVisitorsPerMonth", { valueAsNumber: true })}
                />
              </div>
              <InputField
                label="End Date"
                type="date"
                error={errors.subscription?.endDate?.message}
                {...register("subscription.endDate")}
              />
            </div>

            {/* Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Settings className="h-5 w-5" />
                Company Settings
              </div>
              
              {/* Working Hours */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Working Hours</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Start Time"
                    type="time"
                    error={errors.settings?.workingHours?.start?.message}
                    {...register("settings.workingHours.start")}
                  />
                  <InputField
                    label="End Time"
                    type="time"
                    error={errors.settings?.workingHours?.end?.message}
                    {...register("settings.workingHours.end")}
                  />
                </div>
              </div>

              {/* Timezone */}
              <SelectField
                label="Timezone"
                placeholder="Select timezone"
                options={timezones}
                error={errors.settings?.timezone?.message}
                value={watch("settings.timezone") || ""}
                onChange={(value) => setValue("settings.timezone", value)}
              />

              {/* Colors */}
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Primary Color"
                  type="color"
                  error={errors.settings?.primaryColor?.message}
                  {...register("settings.primaryColor")}
                />
                <InputField
                  label="Secondary Color"
                  type="color"
                  error={errors.settings?.secondaryColor?.message}
                  {...register("settings.secondaryColor")}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Logo</label>
                <FileUpload
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="btn-hostinger btn-hostinger-primary px-6 py-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Company...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Create Company
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
