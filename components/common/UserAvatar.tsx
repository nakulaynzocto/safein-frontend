"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/helpers";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl" | "h-10 w-10" | string;
    fallbackClassName?: string;
    allowExpand?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-20 w-20 sm:h-24 sm:w-24",
};

export function UserAvatar({
    src,
    name = "User",
    size = "md",
    fallbackClassName,
    allowExpand = false,
    className,
}: UserAvatarProps) {
    const avatarSize = (sizeClasses as any)[size] || size;

    return (
        <div className={cn("group relative shrink-0", className)}>
            <Avatar className={cn(avatarSize)}>
                {src && <AvatarImage src={src} alt={name} />}
                <AvatarFallback className={cn("flex items-center justify-center leading-none", fallbackClassName)}>
                    {getInitials(name, 2)}
                </AvatarFallback>
            </Avatar>
            {src && allowExpand && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(src, "_blank");
                    }}
                    className="absolute -right-1 -bottom-1 rounded-full bg-[#3882a5] p-1 text-white opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-[#2d6a87]"
                    title="View full image"
                >
                    <Maximize2 className="h-2.5 w-2.5" />
                </button>
            )}
        </div>
    );
}
