"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { ImageUploadField } from "@/components/common/imageUploadField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { CreateVisitorRequest, useCreateVisitorMutation, useGetVisitorStatsQuery } from "@/store/api/visitorApi"
import { User, MapPin, CreditCard, Camera, CheckCircle, Users } from "lucide-react"
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
  

  const { data: visitorStats, isLoading: isLoadingStats } = useGetVisitorStatsQuery()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
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
      
      if (standalone) {

        showSuccessToast("Visitor registered successfully!")
        reset()
      }
      

      if (onComplete) {
        onComplete(visitorData, result._id)
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to register visitor"
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-none shadow-lg">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/50">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Register New Visitor
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter the personal and professional details of your new visitor.
              </p>
            </div>
          </div>

          {/* Optional stats */}
          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold text-primary">
              Total Visitors: {isLoadingStats ? "..." : visitorStats?.totalVisitors || 0}
            </span>
            <span className="text-sm text-muted-foreground">Manage visitor records efficiently</span>
          </div>
        </CardContent>
      </Card>

      {/* General Error Alert */}
      {generalError && (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Visitor Form Card */}
      <Card className="w-full hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6" onChange={clearGeneralError}>
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <User className="h-5 w-5" />
                Personal Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <InputField
                  label="Phone"
                  placeholder="Enter phone number"
                  error={errors.phone?.message}
                  {...register("phone")}
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MapPin className="h-5 w-5" />
                Address Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Company Address"
                  placeholder="Enter company address"
                  error={errors.address?.street?.message}
                  {...register("address.street")}
                />
                <InputField
                  label="City"
                  placeholder="Enter city"
                  error={errors.address?.city?.message}
                  {...register("address.city")}
                  required
                />
                <InputField
                  label="State"
                  placeholder="Enter state"
                  error={errors.address?.state?.message}
                  {...register("address.state")}
                  required
                />
                <InputField
                  label="Country"
                  placeholder="Enter country"
                  error={errors.address?.country?.message}
                  {...register("address.country")}
                  required
                />
              </div>
            </div>

            {/* ID Proof */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-medium">
                <CreditCard className="h-5 w-5" />
                ID Proof & Photos
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="ID Proof Type"
                  placeholder="Select ID proof type"
                  options={idProofTypes}
                  error={errors.idProof?.type?.message}
                  value={watch("idProof.type") || ""}
                  onChange={(value) => setValue("idProof.type", value)}
                />
                <InputField
                  label="ID Proof Number"
                  placeholder="Enter ID proof number"
                  error={errors.idProof?.number?.message}
                  {...register("idProof.number")}
                />
              </div>

              {/* Image Uploads Section */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      initialUrl={initialData?.idProof?.image}
                      enableImageCapture={true}
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
                      initialUrl={initialData?.photo}
                      enableImageCapture={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                className="btn-hostinger btn-hostinger-primary px-6 py-2"
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
        </CardContent>
      </Card>
    </div>
  )
}


export { VisitorRegister as VisitorDetailsStep }