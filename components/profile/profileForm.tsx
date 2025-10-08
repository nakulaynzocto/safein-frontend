"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/common/inputField"
import { SelectField } from "@/components/common/selectField"
import { DatePicker } from "@/components/common/datePicker"
import { FileUpload } from "@/components/common/fileUpload"
import { User, Upload, Save, X } from "lucide-react"
import { User as UserType } from "@/store/api/authApi"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name cannot exceed 50 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name cannot exceed 50 characters"),
  phoneNumber: z
    .string()
    .regex(/^\d{10,15}$/, "Phone number must be 10–15 digits")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .refine(date => !date || new Date(date) <= new Date(), {
      message: "Date of birth cannot be in the future"
    })
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  profilePicture: z.string().optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  profile: UserType
  onSubmit: (data: ProfileFormData) => Promise<void>
  onCancel: () => void
}

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(profile.profilePicture || null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phoneNumber: profile.phoneNumber || "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
      gender: profile.gender || undefined,
      profilePicture: profile.profilePicture || "",
    },
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (file: File | null) => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const { url } = await res.json()
      setProfileImage(url)
      setValue("profilePicture", url)
    } catch (err) {
    }
  }

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={profileImage || "/placeholder-user.jpg"}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                />
              </div>
              <FileUpload
                onChange={handleImageUpload}
                accept="image/*"
                className="flex-1"
                label="Upload Photo"
              />
            </div>
            {errors.profilePicture && (
              <p className="text-sm text-destructive">{errors.profilePicture.message}</p>
            )}
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                placeholder="Enter your first name"
                {...register("firstName")}
                error={errors.firstName?.message}
                required
              />
              <InputField
                label="Last Name"
                placeholder="Enter your last name"
                {...register("lastName")}
                error={errors.lastName?.message}
                required
              />
              <InputField
                label="Phone Number"
                placeholder="Enter your phone number"
                {...register("phoneNumber")}
                error={errors.phoneNumber?.message}
              />
              <DatePicker
                label="Date of Birth"
                placeholder="Select your date of birth"
                {...register("dateOfBirth")}
                error={errors.dateOfBirth?.message}
                required
              />
              <SelectField
                label="Gender"
                placeholder="Select your gender"
                options={genderOptions}
                value={watch("gender") || ""}
                onChange={(value) => setValue("gender", value as "male" | "female" | "other")}
                error={errors.gender?.message}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset(profile)
                onCancel()
              }}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4 animate-spin" /> Saving...
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
