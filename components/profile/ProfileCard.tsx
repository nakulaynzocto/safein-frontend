"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Building, MapPin } from "lucide-react"
import { getUserInitials, formatValue } from "./profileUtils"

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
              {getUserInitials(profile.name, profile.companyName)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {profile.companyName || profile.name || "User"}
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
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Company:</span>
            <span>{formatValue(profile.companyName)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Department:</span>
            <span>{formatValue(profile.department)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Designation:</span>
            <span>{formatValue(profile.designation)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
