"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/common/inputField"
import { FileUpload } from "@/components/common/fileUpload"
import { showSuccessToast, showErrorToast } from "@/utils/toast"

const profileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name cannot exceed 100 characters"),
  profilePicture: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  employeeId: z.string().optional().or(z.literal("")),
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
      companyName: profile.companyName || "",
      profilePicture: profile.profilePicture || "",
      department: profile.department || "",
      designation: profile.designation || "",
      employeeId: profile.employeeId || "",
    },
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      showSuccessToast("Profile updated successfully!")
    } catch (error) {
      showErrorToast("Failed to update profile")
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
      showSuccessToast("Profile picture uploaded successfully!")
    } catch (err) {
      showErrorToast("Failed to upload profile picture")
    }
  }

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

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Company Name"
                placeholder="Enter your company name"
                {...register("companyName")}
                error={errors.companyName?.message}
                required
              />
              <InputField
                label="Employee ID"
                placeholder="Enter your employee ID"
                {...register("employeeId")}
                error={errors.employeeId?.message}
              />
              <InputField
                label="Department"
                placeholder="Enter your department"
                {...register("department")}
                error={errors.department?.message}
              />
              <InputField
                label="Designation"
                placeholder="Enter your designation"
                {...register("designation")}
                error={errors.designation?.message}
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
