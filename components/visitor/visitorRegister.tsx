"use client"

import { useState, useRef, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/common/formContainer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { ImageUploadField } from "@/components/common/imageUploadField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { PhoneInputField } from "@/components/common/phoneInputField"
import { CountryStateCitySelect } from "@/components/common/countryStateCity"
import { TextareaField } from "@/components/common/textareaField"
import { CreateVisitorRequest, useCreateVisitorMutation, useGetVisitorStatsQuery } from "@/store/api/visitorApi"
import { CreditCard, Camera, CheckCircle, Info } from "lucide-react"
import { showSuccessToast, showErrorToast } from "@/utils/toast"

const visitorDetailsSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup.object({
    street: yup.string().optional(),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
  }),
  idProof: yup.object({
    type: yup.string().optional(),
    number: yup.string().optional(),
    image: yup.string().optional(),
  }),
  photo: yup.string().optional().default(""),
  notes: yup.string().optional().default(""),
})

type VisitorDetailsFormData = yup.InferType<typeof visitorDetailsSchema>

interface VisitorRegisterProps {
  onComplete?: (data: CreateVisitorRequest, visitorId?: string) => void
  initialData?: CreateVisitorRequest | null
  standalone?: boolean
}


export function VisitorRegister({ onComplete, initialData, standalone = false }: VisitorRegisterProps) {
  const [createVisitor, { isLoading, isSuccess }] = useCreateVisitorMutation()
  const [generalError, setGeneralError] = useState<string | null>(null)
  
  // Check if initial data has any optional fields filled
  const hasOptionalData = initialData && (
    initialData.idProof?.type ||
    initialData.idProof?.number ||
    initialData.idProof?.image ||
    initialData.photo
  )
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(!!hasOptionalData)

  const { data: visitorStats, isLoading: isLoadingStats } = useGetVisitorStatsQuery()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = useForm<VisitorDetailsFormData>({
    resolver: yupResolver(visitorDetailsSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: {
        street: initialData?.address?.street || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        country: initialData?.address?.country || "",
      },
      idProof: {
        type: initialData?.idProof?.type || "",
        number: initialData?.idProof?.number || "",
        image: initialData?.idProof?.image || "",
      },
      photo: initialData?.photo || "",
      notes: "",
    },
  })

  const idProofTypes = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
    { value: "other", label: "Other" },
  ]


  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null)
    }
  }

  const handleToggleChange = (checked: boolean) => {
    setShowOptionalFields(checked)
    // Clear optional fields when toggle is turned OFF
    if (!checked) {
      setValue("idProof.type", "")
      setValue("idProof.number", "")
      setValue("idProof.image", "")
      setValue("photo", "")
      setValue("notes", "")
    }
  }

  const onSubmit = async (data: VisitorDetailsFormData): Promise<void> => {
    setGeneralError(null)
    
    try {
      const visitorData: CreateVisitorRequest = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        // company and designation are not part of CreateVisitorRequest
        // company: data.company,
        // designation: data.designation,
        address: {
          street: data.address.street || undefined,
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
        },
        idProof: (data.idProof.type || data.idProof.number || data.idProof.image) ? {
          type: data.idProof.type || undefined,
          number: data.idProof.number || undefined,
          image: data.idProof.image || undefined,
        } : undefined,
        photo: data.photo || undefined,
      }


      const result = await createVisitor(visitorData).unwrap()
      
      showSuccessToast("Visitor registered successfully!")
      
      if (standalone) {
        reset()
      }
      

      if (onComplete) {
        onComplete(visitorData, result._id)
      }
    } catch (error: any) {
      let errorMessage = error?.data?.message || error?.message || "Failed to register visitor"
      
      if (errorMessage.toLowerCase().includes("id proof")) {
        errorMessage = errorMessage
          .replace(/idProof\.type:/gi, "ID Proof Type: ")
          .replace(/idProof\.number:/gi, "ID Proof Number: ")
          .replace(/must be at least 2 characters long/gi, "must be at least 2 characters. Please enter a complete value or leave it empty")
          .replace(/validation failed:/gi, "")
          .trim();
      } else if (errorMessage.toLowerCase().includes("address.street") || errorMessage.toLowerCase().includes("street address")) {
        errorMessage = errorMessage
          .replace(/address\.street:/gi, "Company Address: ")
          .replace(/street address/gi, "Company Address")
          .replace(/must be at least 2 characters long/gi, "must be at least 2 characters. Please enter a complete address or leave it empty")
          .replace(/validation failed:/gi, "")
          .trim();
      }
      
      setGeneralError(errorMessage)
      showErrorToast(errorMessage)
    }
  }


  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 pt-2" onChange={clearGeneralError}>
      {generalError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Name"
                  placeholder="Enter name"
                  error={errors.name?.message}
                  {...register("name")}
                  required
                />
                <InputField
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  error={errors.email?.message}
                  {...register("email")}
                  required
                />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInputField
                      id="phone"
                      label="Phone Number"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      error={errors.phone?.message}
                      required
                      placeholder="Enter phone number"
                      defaultCountry="in"
                    />
                  )}
                />
        </div>
      </div>

      {/* Address Information Section */}
      <div className="space-y-4 pt-4">
              <CountryStateCitySelect
                value={{
                  country: watch("address.country") || "",
                  state: watch("address.state") || "",
                  city: watch("address.city") || "",
                }}
                onChange={(v) => {
                  setValue("address.country", v.country)
                  setValue("address.state", v.state)
                  setValue("address.city", v.city)
                }}
                errors={{
                  country: errors.address?.country?.message as string,
                  state: errors.address?.state?.message as string,
                  city: errors.address?.city?.message as string,
                }}
              />
      </div>

      {/* Company Address Section */}
      <div className="space-y-4 pt-4">
        <TextareaField
          label="Company Address (optional)"
          id="address.street"
          placeholder="Enter company address"
          {...register("address.street")}
          error={errors.address?.street?.message}
          rows={3}
        />
      </div>

      {/* Optional Fields Toggle */}
      <div className="pt-4 border-t">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="optional-fields-toggle" className="text-sm font-medium cursor-pointer">
                      Add Additional Information
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Include optional details like ID proof, photos, and notes
                    </p>
                  </div>
                </div>
                <Switch
                  id="optional-fields-toggle"
                  checked={showOptionalFields}
                  onCheckedChange={handleToggleChange}
                />
              </div>
      </div>

      {/* Optional Fields Section - Only shown when toggle is ON */}
      {showOptionalFields && (
        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* ID Proof & Additional Information Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="ID Proof Type (optional)"
                  placeholder="Select ID proof type"
                  options={idProofTypes}
                  error={errors.idProof?.type?.message}
                  value={watch("idProof.type") || ""}
                  onChange={(value) => setValue("idProof.type", value)}
                />
                <InputField
                  label="ID Proof Number (optional)"
                  placeholder="Enter ID proof number"
                  error={errors.idProof?.number?.message}
                  {...register("idProof.number")}
                />
            </div>
          </div>

          {/* Image Uploads Section */}
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ImageUploadField
                        name="idProof.image"
                        label="ID Proof Image (optional)"
                        register={register}
                        setValue={setValue}
                        errors={errors.idProof?.image}
                        initialUrl={initialData?.idProof?.image}
                        enableImageCapture={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <ImageUploadField
                        name="photo"
                        label="Visitor Photo (optional)"
                        register={register}
                        setValue={setValue}
                        errors={errors.photo}
                        initialUrl={initialData?.photo}
                        enableImageCapture={true}
                      />
            </div>
          </div>
        </div>

          {/* Additional Notes */}
          <div className="space-y-2 pt-4">
                  <TextareaField
                    label="Additional Notes (optional)"
                    id="notes"
                    placeholder="Any additional information or special requirements"
                    {...register("notes")}
                    error={errors.notes?.message}
                    rows={3}
                  />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="outline"
                className="px-8 min-w-[140px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : standalone ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Register Visitor
                  </>
                ) : (
                  "Register"
                )}
              </Button>
      </div>
    </form>
  )

  return (
    <div className="w-full">
      <FormContainer isPage={true} isLoading={false} isEditMode={false}>
        {formContent}
      </FormContainer>
    </div>
  )
}


export { VisitorRegister as VisitorDetailsStep }