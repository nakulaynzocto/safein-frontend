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
import { ImageUploadField } from "@/components/common/imageUploadField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { CreateVisitorRequest, useCreateVisitorMutation, useGetVisitorStatsQuery, useGetVisitorQuery } from "@/store/api/visitorApi"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { routes } from "@/utils/routes"
import { User, MapPin, CreditCard, Camera, CheckCircle, Users, ChevronRight, ChevronLeft } from "lucide-react"

// ✅ Validation schema
const visitorSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  company: yup.string().required("Company is required"),
  designation: yup.string().required("Designation is required"),
  address: yup.object({
    street: yup.string().required("Street address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
    zipCode: yup.string().required("Zip code is required"),
  }),
  idProof: yup.object({
    type: yup.string().required("ID proof type is required"),
    number: yup.string().required("ID proof number is required"),
    image: yup.string().optional(),
  }),
  photo: yup.string().optional().default(""),
})

type VisitorFormData = yup.InferType<typeof visitorSchema>

// ✅ ID Proof options
const idProofTypes = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "other", label: "Other" },
]

interface NewVisitorModalProps {
  visitorId?: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewVisitorModal({ visitorId, trigger, onSuccess, open: controlledOpen, onOpenChange }: NewVisitorModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation()
  const [generalError, setGeneralError] = React.useState<string | null>(null)
  const [currentStep, setCurrentStep] = React.useState(1)
  const totalSteps = 3
  
  const isEditMode = !!visitorId
  const isLoading = isCreating
  
  // Fetch visitor data for editing
  const { data: visitorData, isLoading: isLoadingVisitor } = useGetVisitorQuery(visitorId!, {
    skip: !isEditMode
  })
  
  // Fetch visitor stats for dynamic count
  const { data: visitorStats, isLoading: isLoadingStats } = useGetVisitorStatsQuery()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm({
    resolver: yupResolver(visitorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      designation: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
      idProof: {
        type: "",
        number: "",
        image: "",
      },
      photo: "",
    },
  })

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      reset()
      setGeneralError(null)
      clearErrors()
      setCurrentStep(1)
    }
  }, [open, reset, clearErrors])

  // Update form when visitor data is loaded for editing
  React.useEffect(() => {
    if (isEditMode && visitorData) {
      reset({
        name: visitorData.name || "",
        email: visitorData.email || "",
        phone: visitorData.phone || "",
        company: visitorData.company || "",
        designation: visitorData.designation || "",
        address: {
          street: visitorData.address?.street || "",
          city: visitorData.address?.city || "",
          state: visitorData.address?.state || "",
          country: visitorData.address?.country || "",
          zipCode: visitorData.address?.zipCode || "",
        },
        idProof: {
          type: visitorData.idProof?.type || "",
          number: visitorData.idProof?.number || "",
          image: visitorData.idProof?.image || "",
        },
        photo: visitorData.photo || "",
      })
    }
  }, [isEditMode, visitorData, reset])

  // Clear general error when user starts typing
  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Validate current step before moving to next
      const currentStepData = watch()
      let isValid = true
      
      if (currentStep === 1) {
        // Validate step 1 fields
        if (!currentStepData.name || !currentStepData.email || !currentStepData.phone || !currentStepData.company || !currentStepData.designation) {
          isValid = false
        }
      } else if (currentStep === 2) {
        // Validate step 2 fields
        if (!currentStepData.address?.street || !currentStepData.address?.city || !currentStepData.address?.state || !currentStepData.address?.country || !currentStepData.address?.zipCode) {
          isValid = false
        }
      }
      
      if (isValid) {
        setCurrentStep(currentStep + 1)
      } else {
        // Trigger validation for current step
        if (currentStep === 1) {
          if (!currentStepData.name) setValue("name", "", { shouldValidate: true })
          if (!currentStepData.email) setValue("email", "", { shouldValidate: true })
          if (!currentStepData.phone) setValue("phone", "", { shouldValidate: true })
          if (!currentStepData.company) setValue("company", "", { shouldValidate: true })
          if (!currentStepData.designation) setValue("designation", "", { shouldValidate: true })
        } else if (currentStep === 2) {
          if (!currentStepData.address?.street) setValue("address.street", "", { shouldValidate: true })
          if (!currentStepData.address?.city) setValue("address.city", "", { shouldValidate: true })
          if (!currentStepData.address?.state) setValue("address.state", "", { shouldValidate: true })
          if (!currentStepData.address?.country) setValue("address.country", "", { shouldValidate: true })
          if (!currentStepData.address?.zipCode) setValue("address.zipCode", "", { shouldValidate: true })
        }
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: VisitorFormData) => {
    try {
      // Clear any previous general errors
      setGeneralError(null)
      
      const visitorData: CreateVisitorRequest = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        designation: data.designation,
        address: data.address,
        idProof: {
          type: data.idProof.type,
          number: data.idProof.number,
          image: data.idProof.image || undefined,
        },
        photo: data.photo || undefined,
      }
      
      await createVisitor(visitorData).unwrap()
      showSuccessToast("Visitor registered successfully")
      
      setOpen(false)
      reset()
      setCurrentStep(1)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Default behavior - navigate to visitor list
        router.push(routes.privateroute.VISITORLIST)
      }
    } catch (error: any) {
      // Handle field-specific validation errors from backend
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        // Set field-specific errors
        error.data.errors.forEach((fieldError: any) => {
          if (fieldError.field && fieldError.message) {
            // Handle nested field errors
            const fieldPath = fieldError.field.includes('.') ? fieldError.field : fieldError.field
            // You might need to implement nested field error handling here
          }
        })
      } else if (error?.data?.message) {
        // Handle specific field errors from backend (e.g., duplicate email)
        const message = error.data.message.toLowerCase()
        if (message.includes('email') && message.includes('already exists')) {
          setGeneralError('Email address is already registered')
        } else if (message.includes('phone') && message.includes('already exists')) {
          setGeneralError('Phone number is already registered')
        } else {
          // Set general error for other errors
          setGeneralError(error.data.message)
        }
      } else {
        // Set general error for network or other errors
        const errorMessage = error?.message || "Failed to register visitor"
        setGeneralError(errorMessage)
      }
    }
  }

  const defaultTrigger = (
    <Button variant="default">
      {isEditMode ? "Edit Visitor" : "New Visitor"}
    </Button>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter visitor's full name"
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", { onChange: clearGeneralError })}
                  placeholder="Enter phone number"
                  aria-required="true"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <span className="text-sm text-destructive">{errors.phone.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="company" className="font-medium">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  {...register("company")}
                  placeholder="Enter company name"
                  aria-required="true"
                  className={errors.company ? "border-destructive" : ""}
                />
                {errors.company && (
                  <span className="text-sm text-destructive">{errors.company.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="designation" className="font-medium">
                  Designation <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="designation"
                  {...register("designation")}
                  placeholder="Enter designation"
                  aria-required="true"
                  className={errors.designation ? "border-destructive" : ""}
                />
                {errors.designation && (
                  <span className="text-sm text-destructive">{errors.designation.message}</span>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Address Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="address.street" className="font-medium">
                  Street Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.street"
                  {...register("address.street")}
                  placeholder="Enter street address"
                  aria-required="true"
                  className={errors.address?.street ? "border-destructive" : ""}
                />
                {errors.address?.street && (
                  <span className="text-sm text-destructive">{errors.address.street.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="address.city" className="font-medium">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.city"
                  {...register("address.city")}
                  placeholder="Enter city"
                  aria-required="true"
                  className={errors.address?.city ? "border-destructive" : ""}
                />
                {errors.address?.city && (
                  <span className="text-sm text-destructive">{errors.address.city.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="address.state" className="font-medium">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.state"
                  {...register("address.state")}
                  placeholder="Enter state"
                  aria-required="true"
                  className={errors.address?.state ? "border-destructive" : ""}
                />
                {errors.address?.state && (
                  <span className="text-sm text-destructive">{errors.address.state.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="address.country" className="font-medium">
                  Country <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.country"
                  {...register("address.country")}
                  placeholder="Enter country"
                  aria-required="true"
                  className={errors.address?.country ? "border-destructive" : ""}
                />
                {errors.address?.country && (
                  <span className="text-sm text-destructive">{errors.address.country.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="address.zipCode" className="font-medium">
                  Zip Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address.zipCode"
                  {...register("address.zipCode")}
                  placeholder="Enter zip code"
                  aria-required="true"
                  className={errors.address?.zipCode ? "border-destructive" : ""}
                />
                {errors.address?.zipCode && (
                  <span className="text-sm text-destructive">{errors.address.zipCode.message}</span>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">ID Proof & Photos</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="idProof.type"
                control={control}
                rules={{ required: "ID proof type is required" }}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium">
                      ID Proof Type <span className="text-destructive">*</span>
                    </Label>
                    <SelectField
                      placeholder="Select ID proof type"
                      options={idProofTypes}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      error={errors.idProof?.type?.message}
                    />
                  </div>
                )}
              />

              <div className="flex flex-col gap-2">
                <Label htmlFor="idProof.number" className="font-medium">
                  ID Proof Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="idProof.number"
                  {...register("idProof.number")}
                  placeholder="Enter ID proof number"
                  aria-required="true"
                  className={errors.idProof?.number ? "border-destructive" : ""}
                />
                {errors.idProof?.number && (
                  <span className="text-sm text-destructive">{errors.idProof.number.message}</span>
                )}
              </div>
            </div>

            {/* Image Uploads Section */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    ID Proof Document
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload a clear photo of your ID document
                  </p>
                  <ImageUploadField
                    name="idProof.image"
                    label="ID Proof Image"
                    register={register}
                    setValue={setValue}
                    errors={errors.idProof?.image}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Visitor Photo
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload a clear photo of yourself
                  </p>
                  <ImageUploadField
                    name="photo"
                    label="Visitor Photo"
                    register={register}
                    setValue={setValue}
                    errors={errors.photo}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src="/images/personal-information.png"
              alt="Personal information header reference"
              className="h-6 w-6 rounded-sm object-cover"
            />
            <div>
              <DialogTitle className="text-xl">
                {isEditMode ? "Edit Visitor" : "Register New Visitor"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isEditMode 
                  ? "Update the visitor information and details."
                  : "Add visitor details step by step. Fields marked with"
                }
                {!isEditMode && <span className="px-1 text-destructive">*</span>}
                {!isEditMode && " are required."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          {/* Show loading state when fetching visitor data for editing */}
          {isEditMode && isLoadingVisitor ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* General Error Display */}
              {generalError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    {generalError}
                  </AlertDescription>
                </Alert>
              )}

          {/* Progress Indicator */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
              <div 
                className="absolute h-2 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="ml-4 text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          <DialogFooter className="mt-6">
            <div className="flex justify-between w-full">
              <div>
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Register Visitor
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewVisitorModal
