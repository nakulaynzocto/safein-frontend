"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User, X, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputField } from "@/components/common/inputField"
import { FileUpload } from "@/components/common/fileUpload"
import { showSuccessToast, showErrorToast } from "@/utils/toast"
import { useUploadFileMutation } from "@/store/api"
import { User as UserType } from "@/store/api/authApi"

const profileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name cannot exceed 100 characters"),
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
  const [profileImage, setProfileImage] = useState<string | null>(profile?.profilePicture || null)
  const [uploadFile] = useUploadFileMutation()

  const defaultValues = {
    companyName: profile?.companyName || "",
    profilePicture: profile?.profilePicture || "",
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  useEffect(() => {
    if (profile && profile.companyName) {
      const newDefaultValues = {
        companyName: profile.companyName || "",
        profilePicture: profile.profilePicture || "",
      }
      reset(newDefaultValues)
      setProfileImage(profile.profilePicture || null)
    }
  }, [profile, reset])
  
  if (!profile || !profile.companyName) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Unable to load profile data. Please refresh the page.</p>
        </CardContent>
      </Card>
    )
  }

  const handleFormSubmit = useCallback(async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      const cleanData: { companyName: string; profilePicture?: string } = {
        companyName: data.companyName.trim(),
      }
      
      if (data.profilePicture && data.profilePicture.trim() !== "") {
        cleanData.profilePicture = data.profilePicture.trim()
      }
      
      const payload = JSON.parse(JSON.stringify(cleanData))
      
      await onSubmit(payload as ProfileFormData)
      showSuccessToast("Profile updated successfully!")
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update profile"
      showErrorToast(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit])

  const handleImageUpload = useCallback(async (file: File | null) => {
    if (!file) return

    try {
      const result = await uploadFile({ file }).unwrap()
      
      setProfileImage(result.url)
      setValue("profilePicture", result.url)
      showSuccessToast("Profile picture uploaded successfully!")
    } catch (err: any) {
      showErrorToast(err?.data?.message || err?.message || "Failed to upload profile picture")
    }
  }, [uploadFile, setValue])
  
  const handleCancel = useCallback(() => {
    if (profile) {
      reset(defaultValues)
      setProfileImage(profile.profilePicture || null)
    }
    onCancel()
  }, [profile, reset, onCancel, defaultValues])

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
                  src={profileImage ? `${profileImage}${profileImage.includes('?') ? '&' : '?'}v=${profileImage.length}` : "/placeholder-user.jpg"}
                  alt="Profile"
                  key={profileImage}
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-user.jpg"
                  }}
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
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <InputField
                label="Company Name"
                placeholder="Enter your company name"
                {...register("companyName")}
                error={errors.companyName?.message}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
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
