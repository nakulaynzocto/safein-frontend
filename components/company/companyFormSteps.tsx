"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { FileUpload } from "@/components/common/fileUpload"
import { Building2, MapPin, Settings, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { Country, State, City } from "country-state-city"
import { useCreateCompanyMutation } from "@/store/api/companyApi"

const companySchema = yup.object({
  companyName: yup.string().required("Company name is required"),
  companyCode: yup.string().required("Company code is required"),
  address: yup.object({
    street: yup.string().required("Street address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
    zipCode: yup.string().required("ZIP code is required"),
  }),
  settings: yup.object({
    allowAadhaarVerification: yup.boolean(),
    requireAadhaarPhoto: yup.boolean(),
    allowWhatsAppNotifications: yup.boolean(),
    allowEmailNotifications: yup.boolean(),
    timezone: yup.string().required("Timezone is required"),
  }),
})

type CompanyFormData = yup.InferType<typeof companySchema>

// Dynamic timezone list using country-state-city package
const getAllTimezones = () => {
  const countries = Country.getAllCountries()
  const timezoneSet = new Set<string>()

  // Extract timezones from all countries dynamically
  countries.forEach((country) => {
    if (country.timezones && country.timezones.length > 0) {
      country.timezones.forEach((tz) => {
        if (tz.zoneName) {
          timezoneSet.add(tz.zoneName)
        }
      })
    }
  })

  // Convert to array and sort alphabetically
  return Array.from(timezoneSet)
    .sort()
    .map((tz) => ({
      value: tz,
      label: `${tz}`,
    }))
}

const timezones = getAllTimezones()

const steps = [
  {
    id: 1,
    title: "Company Information",
    description: "Basic company details and identification",
    icon: Building2,
  },
  {
    id: 2,
    title: "Address Information",
    description: "Company location and address details",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Company Settings",
    description: "Preferences and configuration settings",
    icon: Settings,
  },
]

// Step 1: Company Information Component
function CompanyInfoStep({ register, errors, watch, setValue }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-base font-medium">
        <Building2 className="h-4 w-4" />
        Company Information
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <InputField
          label="Company Name"
          placeholder="Enter company name"
          error={errors.companyName?.message}
          required
          {...register("companyName")}
        />
        <InputField
          label="Company Code"
          placeholder="Enter company code"
          error={errors.companyCode?.message}
          required
          {...register("companyCode")}
        />
      </div>
    </div>
  )
}

// Step 2: Address Information Component
function AddressInfoStep({ register, errors, watch, setValue }: any) {
  const selectedCountry = watch("address.country")
  const selectedState = watch("address.state")

  // Get all countries
  const countries = Country.getAllCountries().map((country: any) => ({
    value: country.isoCode,
    label: country.name,
  }))

  // Get states for selected country
  const states = selectedCountry
    ? State.getStatesOfCountry(selectedCountry).map((state: any) => ({
        value: state.isoCode,
        label: state.name,
      }))
    : []

  // Get cities for selected state
  const cities =
    selectedCountry && selectedState
      ? City.getCitiesOfState(selectedCountry, selectedState).map((city: any) => ({
          value: city.name,
          label: city.name,
        }))
      : []

  const handleCountryChange = (countryCode: string) => {
    setValue("address.country", countryCode)
    // Reset state and city when country changes
    setValue("address.state", "")
    setValue("address.city", "")
  }

  const handleStateChange = (stateCode: string) => {
    setValue("address.state", stateCode)
    // Reset city when state changes
    setValue("address.city", "")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-base font-medium">
        <MapPin className="h-4 w-4" />
        Address Information
      </div>

      <InputField
        label="Street Address"
        placeholder="Enter street address"
        error={errors.address?.street?.message}
        required
        {...register("address.street")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-3">
          <SelectField
            label="Country"
            placeholder="Select country"
            options={countries}
            error={errors.address?.country?.message}
            value={selectedCountry || ""}
            onChange={handleCountryChange}
            required
          />
          <SelectField
            label="City"
            placeholder={selectedState ? "Select city" : "Select state first"}
            options={cities}
            error={errors.address?.city?.message}
            value={watch("address.city") || ""}
            onChange={(value) => setValue("address.city", value)}
            isDisabled={!selectedState}
            required
          />
        </div>
        <div className="space-y-3">
          <SelectField
            label="State/Province"
            placeholder={selectedCountry ? "Select state/province" : "Select country first"}
            options={states}
            error={errors.address?.state?.message}
            value={selectedState || ""}
            onChange={handleStateChange}
            isDisabled={!selectedCountry}
            required
          />
          <InputField
            label="ZIP Code"
            placeholder="Enter ZIP code"
            error={errors.address?.zipCode?.message}
            required
            {...register("address.zipCode")}
          />
        </div>
      </div>
    </div>
  )
}

// Step 3: Company Settings Component
function CompanySettingsStep({ register, errors, watch, setValue, logoFile, handleLogoUpload }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-base font-medium">
        <Settings className="h-4 w-4" />
        Company Settings
      </div>

      <div className="space-y-1.5">
        <SelectField
          label="Timezone"
          placeholder="Search and select timezone"
          options={timezones}
          error={errors.settings?.timezone?.message}
          value={watch("settings.timezone") || ""}
          onChange={(value) => setValue("settings.timezone", value)}
          required
        />
        <p className="text-xs text-gray-600">
          {"\u{1F4A1}"} Dynamic timezone list extracted from all countries using country-state-city package.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-medium">Notification Settings</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowWhatsAppNotifications"
              {...register("settings.allowWhatsAppNotifications")}
              className="rounded border-gray-300"
            />
            <label htmlFor="allowWhatsAppNotifications" className="text-sm font-medium">
              Allow WhatsApp Notifications
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowEmailNotifications"
              {...register("settings.allowEmailNotifications")}
              className="rounded border-gray-300"
            />
            <label htmlFor="allowEmailNotifications" className="text-sm font-medium">
              Allow Email Notifications
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-medium">Aadhaar Verification Settings</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowAadhaarVerification"
              {...register("settings.allowAadhaarVerification")}
              className="rounded border-gray-300"
            />
            <label htmlFor="allowAadhaarVerification" className="text-sm font-medium">
              Allow Aadhaar Verification
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requireAadhaarPhoto"
              {...register("settings.requireAadhaarPhoto")}
              className="rounded border-gray-300"
            />
            <label htmlFor="requireAadhaarPhoto" className="text-sm font-medium">
              Require Aadhaar Photo
            </label>
          </div>
        </div>
      </div>

      <FileUpload 
        label="Company Logo" 
        accept="image/*" 
        onChange={handleLogoUpload} 
        className="w-full"
        maxSize={10}
        error={logoFile && logoFile.size > 10 * 1024 * 1024 ? "Logo size must be less than 10MB" : undefined}
      />
    </div>
  )
}

// Progress Indicator Component - Card-based design
function ProgressIndicator({ currentStep, steps }: { currentStep: number; steps: any[] }) {
  return (
    <Card className="w-full mb-4">
      <CardContent className="p-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id

            return (
              <div
                key={step.id}
                className={`relative p-3 rounded-lg border transition-all duration-200 ${
                  isCurrent
                    ? "bg-blue-50 border-blue-300"
                    : isCompleted
                      ? "bg-green-50 border-green-300"
                      : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full border ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[11px] font-semibold leading-none">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      isCurrent
                        ? "bg-blue-100 text-blue-700"
                        : isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Step {step.id}
                  </span>
                </div>

                <div className="flex justify-center mb-2">
                  <Icon
                    className={`w-5 h-5 ${
                      isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                </div>

                <h4
                  className={`text-center text-sm font-semibold mb-1 ${
                    isCurrent ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-700"
                  }`}
                >
                  {step.title}
                </h4>

                <p
                  className={`text-center text-xs ${
                    isCurrent ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-1/2 -right-2 w-3 h-px transform -translate-y-1/2 ${
                      isCompleted ? "bg-green-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function CompanyFormSteps() {
  const router = useRouter()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Use RTK Query mutation instead of manual fetch
  const [createCompany, { isLoading, error }] = useCreateCompanyMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<CompanyFormData>({
    resolver: yupResolver(companySchema),
    defaultValues: {
      companyName: "",
      companyCode: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "IN", // India country code
        zipCode: "",
      },
      settings: {
        allowAadhaarVerification: true,
        requireAadhaarPhoto: false,
        allowWhatsAppNotifications: true,
        allowEmailNotifications: true,
        timezone: "Asia/Kolkata",
      },
    },
  })

  // Clear general error when user starts typing
  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file)
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Step validation
  const validateStep = async (step: number) => {
    let fieldsToValidate: string[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ["companyName", "companyCode"]
        break
      case 2:
        fieldsToValidate = ["address.street", "address.country", "address.state", "address.city", "address.zipCode"]
        break
      case 3:
        fieldsToValidate = ["settings.timezone"]
        break
    }

    const isValid = await trigger(fieldsToValidate as any)
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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
        } as any,
      }

      await createCompany(companyData).unwrap()

      router.push("/")
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create company. Please try again."
      setGeneralError(errorMessage)
      // console.log("[v0] Create company error:", errorMessage)
    }
  }

  const handleFinalSubmit = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid) {
      await handleSubmit(onSubmit)()
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInfoStep register={register} errors={errors} watch={watch} setValue={setValue} />
      case 2:
        return <AddressInfoStep register={register} errors={errors} watch={watch} setValue={setValue} />
      case 3:
        return (
          <CompanySettingsStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            logoFile={logoFile}
            handleLogoUpload={handleLogoUpload}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-none shadow-lg">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/50">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Company Setup</h2>
              <p className="text-xs text-muted-foreground">Complete your company profile to get started with SafeIn</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <div className="text-center">
              <div className="text-base font-semibold text-foreground">3</div>
              <div>Steps</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-foreground">Quick</div>
              <div>Setup</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} steps={steps} />

      {/* General Error Alert */}
      {(generalError || error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {generalError || (error as any)?.data?.message || (error as any)?.message || "An error occurred"}
          </AlertDescription>
        </Alert>
      )}

      {/* Company Form Card */}
      <Card className="w-full hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <form className="space-y-4" onChange={clearGeneralError}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep < steps.length ? (
                  <Button type="button" size="sm" onClick={handleNext} className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="btn-hostinger btn-hostinger-primary flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-1" />
                        Creating Company...
                      </>
                    ) : (
                      <>
                        <Building2 className="mr-1 h-4 w-4" />
                        Create Company
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompanyFormSteps
