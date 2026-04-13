"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useGetSettingsQuery } from "@/store/api/settingsApi";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { routes } from "@/utils/routes";
import { cn } from "@/lib/utils";
import { useConfigurationModal } from "@/hooks/useConfigurationModal";

interface DeliverySetupWarningProps {
    className?: string;
}

const linkClass =
    "font-semibold text-[#074463] underline decoration-[#074463]/40 underline-offset-2 hover:text-[#3882a5] hover:decoration-[#3882a5]/50 dark:text-amber-200 dark:decoration-amber-200/40 dark:hover:text-white";

function CompactBar({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div
            role="status"
            className={cn(
                "flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-lg border border-amber-200/90 bg-amber-50/95 py-1.5 pr-2 pl-2.5 shadow-sm sm:gap-2.5 sm:py-2 sm:pl-3 sm:pr-3",
                "dark:border-amber-800/55 dark:bg-amber-950/35",
                className,
            )}
        >
            <AlertTriangle
                className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400 sm:h-4 sm:w-4"
                strokeWidth={2.25}
                aria-hidden
            />
            <p className="flex min-w-0 flex-1 items-center gap-x-1.5 text-[11px] leading-snug text-amber-950/95 whitespace-nowrap sm:gap-x-2 sm:text-sm dark:text-amber-50/95">
                {children}
            </p>
        </div>
    );
}

/**
 * Reminds admins to configure SMTP (email invites) and/or profile mobile (SMS / account).
 * Employees only see the mobile reminder when their profile number is missing.
 * Single compact row on all breakpoints.
 */
export function DeliverySetupWarning({ className }: DeliverySetupWarningProps) {
    return null;
    const { 
        smtpOk, 
        whatsappOk, 
        settingsReady, 
        hasAnyDeliveryChannel 
    } = useConfigurationModal();
    const { user } = useAppSelector((s) => s.auth);
    const isEmployee = checkIsEmployee(user);
    const mobileMissing = !String(user?.mobileNumber ?? "").trim();

    if (!user?.id) return null;

    if (isEmployee) {
        if (!mobileMissing) return null;
        return (
            <CompactBar className={className}>
                <span className="shrink-0 text-amber-800/85 dark:text-amber-200/90">Profile:</span>
                <Link href={routes.privateroute.PROFILE} className={cn(linkClass, "shrink-0")}>
                    Add mobile number
                </Link>
            </CompactBar>
        );
    }

    if (!settingsReady) return null;

    const smtpMissing = !smtpOk;
    const whatsappMissing = !whatsappOk;

    if (!smtpMissing && !whatsappMissing && !mobileMissing) return null;

    return (
        <CompactBar className={className}>
            <span className="shrink-0 text-amber-800/85 dark:text-amber-200/90">Setup:</span>
            {smtpMissing && (
                <Link href={routes.privateroute.SETTINGS_SMTP} className={cn(linkClass, "shrink-0")}>
                    Configure SMTP
                </Link>
            )}
            {(smtpMissing && (whatsappMissing || mobileMissing)) && (
                <span className="shrink-0 text-amber-600/80 dark:text-amber-400/80" aria-hidden>
                    ·
                </span>
            )}
            {whatsappMissing && (
                <Link href={routes.privateroute.SETTINGS_WHATSAPP} className={cn(linkClass, "shrink-0")}>
                    Verify WhatsApp
                </Link>
            )}
            {(whatsappMissing && mobileMissing) && (
                <span className="shrink-0 text-amber-600/80 dark:text-amber-400/80" aria-hidden>
                    ·
                </span>
            )}
            {mobileMissing && (
                <Link href={routes.privateroute.PROFILE} className={cn(linkClass, "shrink-0")}>
                    Add mobile
                </Link>
            )}
        </CompactBar>
    );
}
