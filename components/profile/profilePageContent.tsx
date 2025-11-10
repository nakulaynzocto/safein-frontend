"use client"

import { useState, useCallback } from "react"
import { useGetProfileQuery, useUpdateProfileMutation, UpdateProfileRequest } from "@/store/api/authApi"
import { useAppDispatch } from "@/store/hooks"
import { setUser } from "@/store/slices/authSlice"
import { PageHeader } from "@/components/common/pageHeader"
import { Button } from "@/components/ui/button"
import { Edit, User, MapPin } from "lucide-react"
import { ProfileForm } from "@/components/profile/profileForm"
import { EmptyState } from "@/components/common/emptyState"
import { ProfileCard } from "./profileCard"
import { InfoCard } from "./infoCard"
import { formatDate, formatValue } from "./profileUtils"
import { Badge } from "@/components/ui/badge"

export function ProfilePageContent() {
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const { data: profile, isLoading, error, refetch } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })
  const [updateProfile] = useUpdateProfileMutation()

  const handleProfileUpdate = useCallback(async (data: any) => {
    try {
      // Explicitly create a new object with ONLY the allowed fields
      // This prevents any accidental inclusion of extra properties
      const cleanPayload: UpdateProfileRequest = {}
      
      // Only set companyName if it exists and is a string
      if (data?.companyName && typeof data.companyName === 'string') {
        cleanPayload.companyName = data.companyName.trim()
      }
      
      // Only set profilePicture if it exists and is a string
      if (data?.profilePicture && typeof data.profilePicture === 'string' && data.profilePicture.trim() !== "") {
        cleanPayload.profilePicture = data.profilePicture.trim()
      }
      
      // Verify the payload is clean by stringifying and parsing
      // This will throw an error if there are circular references
      let finalPayload: UpdateProfileRequest
      try {
        finalPayload = JSON.parse(JSON.stringify(cleanPayload))
      } catch (parseError) {
        throw new Error("Failed to prepare profile data: contains invalid data")
      }
      
      // Ensure we have at least companyName (required field)
      if (!finalPayload.companyName) {
        throw new Error("Company name is required")
      }
      
      const result = await updateProfile(finalPayload).unwrap()
      // Refetch profile to get updated data
      await refetch()
      // Update auth state with new user data
      if (result) {
        dispatch(setUser(result))
        // Also update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(result))
          // Dispatch custom event to notify other components (like navbar) of profile update
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: result }))
        }
        // Force a small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      setIsEditing(false)
    } catch (err: any) {
      // Handle RTK Query error structure
      let errorMessage = "Failed to update profile"
      if (err?.data?.message) {
        errorMessage = err.data.message
      } else if (err?.data?.error) {
        errorMessage = err.data.error
      } else if (typeof err?.data === 'string') {
        errorMessage = err.data
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.error) {
        errorMessage = err.error
      }
      
      throw new Error(errorMessage)
    }
  }, [updateProfile, refetch, dispatch])
  
  const handleCancelEdit = () => {
    setIsEditing(false)
  }
  
  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev)
  }
  
  // Account info fields - simple array, no need for memoization
  const accountInfoFields = [
    { label: "Email", value: profile?.email },
    { label: "Company Name", value: profile?.companyName },
    { label: "Role", value: profile?.role },
  ]
  
  // Account status fields - simple array, no need for memoization
  const accountStatusFields = [
    {
      label: "Email Verified",
      value: (
        <Badge variant={profile?.isEmailVerified ? "default" : "secondary"}>
          {profile?.isEmailVerified ? "Verified" : "Not Verified"}
        </Badge>
      ) as any,
    },
    {
      label: "Account Status",
      value: (
        <Badge variant={profile?.isActive ? "default" : "destructive"}>
          {profile?.isActive ? "Active" : "Inactive"}
        </Badge>
      ) as any,
    },
  ]

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Profile" description="View and manage your profile information" />
        <EmptyState
          title={error ? "Failed to load profile" : "No profile found"}
          description={
            error
              ? "There was an error loading your profile information. Please try again."
              : "Your profile information could not be found."
          }
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <PageHeader title="Profile" description="View and manage your profile information">
        <Button onClick={handleToggleEdit} variant={isEditing ? "outline" : "default"}>
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} />
        </div>

        <div className="lg:col-span-2">
          {isEditing && profile ? (
            <ProfileForm profile={profile} onSubmit={handleProfileUpdate} onCancel={handleCancelEdit} />
          ) : !isEditing ? (
            <div className="space-y-6">
              <InfoCard
                icon={User}
                title="Account Information"
                description="Your basic account details"
                fields={accountInfoFields}
              />
              <InfoCard
                icon={MapPin}
                title="Account Status"
                description="Your account verification status"
                fields={accountStatusFields}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
