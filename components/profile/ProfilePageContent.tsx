"use client"

import { useState } from "react"
import { useGetProfileQuery, useUpdateProfileMutation } from "@/store/api/authApi"
import { PageHeader } from "@/components/common/pageHeader"
import { Button } from "@/components/ui/button"
import { Edit, User, Building, MapPin } from "lucide-react"
import { ProfileForm } from "@/components/profile/profileForm"
import { LoadingSpinner } from "@/components/common/loadingSpinner"
import { EmptyState } from "@/components/common/emptyState"
import { ProfileCard } from "./profileCard"
import { InfoCard } from "./infoCard"
import { formatDate, formatValue, formatGender } from "./profileUtils"
import { Badge } from "@/components/ui/badge"

export function ProfilePageContent() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: profile, isLoading, error } = useGetProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()

  const handleProfileUpdate = async (data: any) => {
    try {
      await updateProfile(data).unwrap()
      setIsEditing(false)
    } catch (err) {
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Profile" description="View and manage your profile information" />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

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
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} />
        </div>

        <div className="lg:col-span-2">
          {isEditing ? (
            <ProfileForm profile={profile} onSubmit={handleProfileUpdate} onCancel={() => setIsEditing(false)} />
          ) : (
            <div className="space-y-6">
              <InfoCard
                icon={User}
                title="Personal Information"
                description="Your basic personal details"
                fields={[
                  { label: "First Name", value: formatValue(profile.firstName) },
                  { label: "Last Name", value: formatValue(profile.lastName) },
                  { label: "Email", value: profile.email },
                  { label: "Phone Number", value: formatValue(profile.phoneNumber) },
                  { label: "Date of Birth", value: formatDate(profile.dateOfBirth) },
                  { label: "Gender", value: formatGender(profile.gender) },
                ]}
              />
              <InfoCard
                icon={Building}
                title="Professional Information"
                description="Your work-related details"
                fields={[
                  { label: "Role", value: profile.role },
                  { label: "Department", value: formatValue(profile.department) },
                  { label: "Designation", value: formatValue(profile.designation) },
                  { label: "Employee ID", value: formatValue(profile.employeeId) },
                ]}
              />
              <InfoCard
                icon={MapPin}
                title="Account Status"
                description="Your account verification status"
                fields={[
                  {
                    label: "Email Verified",
                    value: (
                      <Badge variant={profile.isEmailVerified ? "default" : "secondary"}>
                        {profile.isEmailVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    ) as any,
                  },
                  {
                    label: "Phone Verified",
                    value: (
                      <Badge variant={profile.isPhoneVerified ? "default" : "secondary"}>
                        {profile.isPhoneVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    ) as any,
                  },
                  {
                    label: "Account Status",
                    value: (
                      <Badge variant={profile.isActive ? "default" : "destructive"}>
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    ) as any,
                  },
                  { label: "Last Login", value: formatDate(profile.lastLoginAt) },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
