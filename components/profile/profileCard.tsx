"use client";

import { useMemo, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { getUserInitials } from "./profileUtils";

interface ProfileCardProps {
    profile: {
        profilePicture?: string;
        name?: string;
        companyName?: string;
        email?: string;
        role?: string;
    };
}

export const ProfileCard = memo(function ProfileCard({ profile }: ProfileCardProps) {
    const initials = getUserInitials(profile.name, profile.companyName);
    const displayName = profile.companyName || profile.name || "User";

    const profileImageSrc = useMemo(() => {
        if (profile.profilePicture && profile.profilePicture.trim() !== "") {
            return `${profile.profilePicture}${profile.profilePicture.includes("?") ? "&" : "?"}v=${profile.profilePicture.length}`;
        }
        return "/aynzo-logo.png";
    }, [profile.profilePicture]);

    return (
        <Card>
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <Avatar className="h-24 w-24">
                        <AvatarImage
                            src={profileImageSrc}
                            alt="Profile"
                            key={profile.profilePicture}
                            onError={(e) => {
                                e.currentTarget.src = "/aynzo-logo.png";
                            }}
                        />
                        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle className="text-xl">{displayName}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex justify-center">
                    <Badge variant="secondary" className="capitalize">
                        {profile.role === "visitor" ? "User" : profile.role}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
});
