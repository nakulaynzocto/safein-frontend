"use client";

import { CheckCircle, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
    title: string;
    description: string;
    isVerified?: boolean;
    providerName?: string;
    icon: LucideIcon;
    badgeText?: string;
    extraBadges?: React.ReactNode;
}

export function SettingsHeader({
    title,
    description,
    isVerified,
    providerName,
    icon: Icon,
    badgeText,
    extraBadges,
}: SettingsHeaderProps) {
    return (
        <div className="mb-6 text-center sm:text-left">
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-[#3882a5]" />
                    <h1 className="text-foreground text-xl font-bold tracking-tight">
                        {title}
                    </h1>
                </div>
                {isVerified !== undefined && (
                    isVerified ? (
                        <Badge className="bg-emerald-500 text-white border-transparent flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {badgeText || (providerName ? `${providerName.toUpperCase()} - Verified` : "Verified")}
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="text-muted-foreground border-dashed border-muted-foreground/30 flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold"
                        >
                            Not Configured
                        </Badge>
                    )
                )}

                {extraBadges}
            </div>
            <p className="text-muted-foreground mt-2 text-sm font-medium">
                {description}
            </p>
        </div>
    );
}
