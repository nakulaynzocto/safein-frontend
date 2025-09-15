"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Calendar, Users } from "lucide-react"
import { getUserInitials, formatDate, formatValue, formatGender } from "./profile.utils"

export function ProfileCard({ profile }: { profile: any }) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            {profile.profilePicture && (
              <AvatarImage src={profile.profilePicture} alt="Profile" />
            )}
            <AvatarFallback className="text-2xl">
              {getUserInitials(profile.firstName, profile.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {profile.firstName && profile.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : profile.name ?? "User"}
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

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Phone:</span>
            <span>{formatValue(profile.phoneNumber)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Birth Date:</span>
            <span>{formatDate(profile.dateOfBirth)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Gender:</span>
            <span>{formatGender(profile.gender)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
