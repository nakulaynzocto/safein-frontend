"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { ImageUploadField } from "@/components/common/imageUploadField"
import { VisitorDetails } from "@/store/api/appointmentApi"
import { User, MapPin, CreditCard, Camera } from "lucide-react"

const visitorDetailsSchema = yup.object({
  name: yup.string().required("Name is required"),
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
    image: yup.string().url("Invalid image URL").required("ID proof image URL is required"),
  }),
  photo: yup.string().url("Invalid image URL").required("Visitor photo URL is required"),
})

type VisitorDetailsFormData = yup.InferType<typeof visitorDetailsSchema>

interface VisitorDetailsStepProps {
  onComplete: (data: VisitorDetails, accompaniedBy?: any) => void
  initialData?: VisitorDetails | null
}


export function VisitorDetailsStep({ onComplete, initialData }: VisitorDetailsStepProps) {
  const [hasAccompaniedBy, setHasAccompaniedBy] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VisitorDetailsFormData>({
    resolver: yupResolver(visitorDetailsSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      company: initialData?.company || "",
      designation: initialData?.designation || "",
      address: {
        street: initialData?.address?.street || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        country: initialData?.address?.country || "",
        zipCode: initialData?.address?.zipCode || "",
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

  const onSubmit = (data: VisitorDetailsFormData) => {
    const visitorDetails: VisitorDetails = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      designation: data.designation,
      address: data.address,
      idProof: data.idProof,
      photo: data.photo,
    }
    onComplete(visitorDetails, hasAccompaniedBy ? {} : undefined)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card className="card-hostinger">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Name"
              placeholder="Enter name"
              error={errors.name?.message}
              {...register("name")}
            />
            <InputField
              label="Email"
              type="email"
              placeholder="Enter email address"
              error={errors.email?.message}
              {...register("email")}
            />
            <InputField
              label="Phone"
              placeholder="Enter phone number"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <InputField
              label="Company"
              placeholder="Enter company name"
              error={errors.company?.message}
              {...register("company")}
            />
            <InputField
              label="Designation"
              placeholder="Enter designation"
              error={errors.designation?.message}
              {...register("designation")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="card-hostinger">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Street Address"
              placeholder="Enter street address"
              error={errors.address?.street?.message}
              {...register("address.street")}
            />
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
            <InputField
              label="Country"
              placeholder="Enter country"
              error={errors.address?.country?.message}
              {...register("address.country")}
            />
            <InputField
              label="Zip Code"
              placeholder="Enter zip code"
              error={errors.address?.zipCode?.message}
              {...register("address.zipCode")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ID Proof */}
      <Card className="card-hostinger">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <CreditCard className="h-5 w-5" />
            ID Proof & Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" className="btn-hostinger btn-hostinger-primary px-6 py-2">
          Complete Step 1 - Proceed to Appointment Details
        </Button>
      </div>
    </form>
  )
}