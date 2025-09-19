"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { VisitorDetails } from "@/store/api/appointmentApi"
import { User, Building, MapPin, CreditCard, Camera, Users } from "lucide-react"

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

const accompaniedBySchema = yup.object({
  name: yup.string().required("Accompanied by name is required"),
  phone: yup.string().required("Accompanied by phone is required"),
  relation: yup.string().required("Relation is required"),
  idProof: yup.object({
    type: yup.string().required("ID proof type is required"),
    number: yup.string().required("ID proof number is required"),
    image: yup.string().url("Invalid image URL").required("ID proof image URL is required"),
  }),
})

type VisitorDetailsFormData = yup.InferType<typeof visitorDetailsSchema>

interface VisitorDetailsStepProps {
  onComplete: (data: VisitorDetails, accompaniedBy?: any) => void
  initialData?: VisitorDetails | null
}

export function VisitorDetailsStep({ onComplete, initialData }: VisitorDetailsStepProps) {
  const [hasAccompaniedBy, setHasAccompaniedBy] = useState(false)
  const [accompaniedByData, setAccompaniedByData] = useState({
    name: "",
    phone: "",
    relation: "",
    idProof: {
      type: "",
      number: "",
      image: "",
    }
  })

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
    }
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
    onComplete(visitorDetails, hasAccompaniedBy ? accompaniedByData : undefined)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            ID Proof
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <InputField
              label="ID Proof Image URL"
              placeholder="Enter image URL"
              error={errors.idProof?.image?.message}
              {...register("idProof.image")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visitor Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Visitor Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InputField
            label="Visitor Photo URL"
            placeholder="Enter visitor photo URL"
            error={errors.photo?.message}
            {...register("photo")}
          />
        </CardContent>
      </Card>

      {/* Accompanied By */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accompanied By (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="accompanied-by"
              checked={hasAccompaniedBy}
              onCheckedChange={setHasAccompaniedBy}
            />
            <Label htmlFor="accompanied-by">Visitor is accompanied by someone</Label>
          </div>

          {hasAccompaniedBy && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Accompanied By Name"
                  placeholder="Enter companion name"
                  value={accompaniedByData.name}
                  onChange={(e) => setAccompaniedByData({...accompaniedByData, name: e.target.value})}
                />
                <InputField
                  label="Companion Phone"
                  placeholder="Enter companion phone"
                  value={accompaniedByData.phone}
                  onChange={(e) => setAccompaniedByData({...accompaniedByData, phone: e.target.value})}
                />
                <InputField
                  label="Relation"
                  placeholder="Enter relation"
                  value={accompaniedByData.relation}
                  onChange={(e) => setAccompaniedByData({...accompaniedByData, relation: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                  label="Companion ID Proof Type"
                  placeholder="Select ID proof type"
                  options={idProofTypes}
                  value={accompaniedByData.idProof.type}
                  onChange={(value) => setAccompaniedByData({
                    ...accompaniedByData, 
                    idProof: {...accompaniedByData.idProof, type: value}
                  })}
                />
                <InputField
                  label="Companion ID Proof Number"
                  placeholder="Enter ID proof number"
                  value={accompaniedByData.idProof.number}
                  onChange={(e) => setAccompaniedByData({
                    ...accompaniedByData, 
                    idProof: {...accompaniedByData.idProof, number: e.target.value}
                  })}
                />
                <InputField
                  label="Companion ID Proof Image URL"
                  placeholder="Enter image URL"
                  value={accompaniedByData.idProof.image}
                  onChange={(e) => setAccompaniedByData({
                    ...accompaniedByData, 
                    idProof: {...accompaniedByData.idProof, image: e.target.value}
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Complete Step 1 - Proceed to Appointment Details
        </Button>
      </div>
    </form>
  )
}
