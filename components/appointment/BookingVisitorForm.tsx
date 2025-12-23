"use client"

import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SelectField } from "@/components/common/selectField"
import { CountryStateCitySelect } from "@/components/common/countryStateCity"
import { PhoneInputField } from "@/components/common/phoneInputField"
import { ImageUploadField } from "@/components/common/imageUploadField"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { useEffect } from "react"
import { FileText, Camera } from "lucide-react"

const bookingVisitorSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  company: yup.string().optional(),
  designation: yup.string().optional(),
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
  photo: yup.string().optional(),
})

type BookingVisitorFormData = {
  name: string
  email: string
  phone: string
  company?: string
  designation?: string
  address: {
    street?: string
    city: string
    state: string
    country: string
  }
  idProof: {
    type?: string
    number?: string
    image?: string
  }
  photo?: string
}

const idProofTypes = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "other", label: "Other" },
]

interface BookingVisitorFormProps {
  initialEmail?: string
  initialValues?: Partial<BookingVisitorFormData>
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function BookingVisitorForm({ initialEmail, initialValues, onSubmit, isLoading = false }: BookingVisitorFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<BookingVisitorFormData>({
    resolver: yupResolver(bookingVisitorSchema) as any,
    defaultValues: {
      name: initialValues?.name || "",
      email: initialValues?.email || initialEmail || "",
      phone: initialValues?.phone || "",
      company: initialValues?.company || "",
      designation: initialValues?.designation || "",
      address: {
        street: initialValues?.address?.street || "",
        city: initialValues?.address?.city || "",
        state: initialValues?.address?.state || "",
        country: initialValues?.address?.country || "",
      },
      idProof: {
        type: initialValues?.idProof?.type || "",
        number: initialValues?.idProof?.number || "",
        image: initialValues?.idProof?.image || "",
      },
      photo: initialValues?.photo || "",
    },
  })

  useEffect(() => {
    const opts = { shouldValidate: false, shouldDirty: false }
    if (initialEmail) setValue("email", initialEmail, opts)
    if (initialValues) {
      const { address, idProof, ...rest } = initialValues
      Object.entries(rest).forEach(([key, value]) => {
        if (value) setValue(key as any, value, opts)
      })
      if (address) {
        setValue("address", {
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "",
        }, opts)
      }
      if (idProof) {
        setValue("idProof", {
          type: idProof.type || "",
          number: idProof.number || "",
          image: idProof.image || "",
        }, opts)
      }
    }
  }, [initialEmail, initialValues, setValue])

  const handleFormSubmit = (data: BookingVisitorFormData) => {
    const { address, idProof, ...rest } = data
    const payload = {
      ...rest,
      company: rest.company || undefined,
      designation: rest.designation || undefined,
      address: {
        street: address.street?.trim() || undefined,
        city: address.city,
        state: address.state,
        country: address.country,
      },
      idProof: (idProof.type || idProof.number || idProof.image) ? {
        type: idProof.type || undefined,
        number: idProof.number || undefined,
        image: idProof.image || undefined,
      } : undefined,
      photo: rest.photo || undefined,
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter full name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          {initialEmail ? (
            <Controller
              name="email"
              control={control}
              defaultValue={initialEmail}
              render={({ field }) => (
                <div className="space-y-1">
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={initialEmail}
                    className={errors.email ? "border-red-500 bg-gray-50" : "bg-gray-50"}
                    disabled={true}
                    readOnly={true}
                  />
                  <p className="text-xs text-gray-500">This email was used to send you the appointment link</p>
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              )}
            />
          ) : (
            <>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInputField
                {...(field as any)}
                id="phone"
                error={errors.phone?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} placeholder="Enter company name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" {...register("designation")} placeholder="Enter designation" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <CountryStateCitySelect
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="idProofType">ID Proof Type</Label>
          <Controller
            name="idProof.type"
            control={control}
            render={({ field }) => (
              <SelectField
                {...(field as any)}
                options={idProofTypes}
                placeholder="Select ID proof type"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idProofNumber">ID Proof Number</Label>
          <Input
            id="idProofNumber"
            {...register("idProof.number")}
            placeholder="Enter ID proof number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="idProofImage" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            ID Proof Document
          </Label>
          <ImageUploadField
            name="idProof.image"
            register={register}
            setValue={setValue}
            errors={errors.idProof?.image}
            initialUrl={initialValues?.idProof?.image}
            label="Take or Upload Photo"
            enableImageCapture={true}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Visitor Photo
          </Label>
          <ImageUploadField
            name="photo"
            register={register}
            setValue={setValue}
            errors={errors.photo}
            initialUrl={initialValues?.photo}
            label="Take or Upload Photo"
            enableImageCapture={true}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            "Continue to Appointment"
          )}
        </Button>
      </div>
    </form>
  )
}

