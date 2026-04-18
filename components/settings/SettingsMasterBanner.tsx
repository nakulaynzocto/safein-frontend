"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BrandSwitch } from "@/components/common/BrandSwitch";

interface SettingsMasterBannerProps {
    title: string;
    description: string;
    icon: LucideIcon;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void | Promise<void>;
    /** Extra rows inside the same rounded card (e.g. Voice triggers below the master row) */
    children?: ReactNode;
}

export function SettingsMasterBanner({
    title,
    description,
    icon: Icon,
    checked,
    onCheckedChange,
    children,
}: SettingsMasterBannerProps) {
    return (
        <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border/50 bg-muted/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#3882a5] text-white shadow-lg flex items-center justify-center">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                        <p className="text-xs text-gray-500">{description}</p>
                    </div>
                </div>
                <BrandSwitch checked={checked} onCheckedChange={onCheckedChange} variant="large" />
            </div>
            {children}
        </div>
    );
}
