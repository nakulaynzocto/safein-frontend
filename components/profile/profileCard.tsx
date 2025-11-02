"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"
import { getUserInitials } from "./profileUtils"

interface ProfileCardProps {
  profile: {
    profilePicture?: string
    name?: string
    companyName?: string
    email?: string
    role?: string
  }
}

export const ProfileCard = React.memo(function ProfileCard({ profile }: ProfileCardProps) {
  const initials = getUserInitials(profile.name, profile.companyName)
  const displayName = profile.companyName || profile.name || "User"
  
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            {profile.profilePicture && (
              <AvatarImage src={profile.profilePicture} alt="Profile" />
            )}
            <AvatarFallback className="text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {displayName}
        </CardTitle>
        <CardDescription className="flex items-center justify-center gap-2">
          <Mail className="h-4 w-4" />
          {profile.email}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Badge variant="secondary" className="capitalize">
            {profile.role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
})
