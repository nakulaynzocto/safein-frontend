"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
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
            <p className="flex min-w-0 flex-1 items-center gap-x-1.5 text-xs leading-snug text-amber-950/95 whitespace-nowrap sm:gap-x-2 sm:text-sm dark:text-amber-50/95">
                {children}
            </p>
        </div>
    );
}

/**
 * Reminds admins to configure at least one delivery channel (SMTP or SMS).
 * Warning is shown ONLY when BOTH toggles are OFF.
 * If either SMTP or SMS toggle is ON → no warning shown at all.
 * Employees are completely excluded from this warning.
 */
export function DeliverySetupWarning({ className }: DeliverySetupWarningProps) {
    const { smtpOk, smsOk, settingsReady } = useConfigurationModal();
    const { user } = useAppSelector((s) => s.auth);
    const isEmployee = checkIsEmployee(user);

    // Not logged in
    if (!user?.id) return null;

    // Employees don't need this warning
    if (isEmployee) return null;

    // Still loading settings — don't flash warning
    if (!settingsReady) return null;

    // If at least one toggle is ON → no warning needed
    if (smtpOk || smsOk) return null;

    // Both SMTP and SMS are OFF → show setup warning
    return (
        <CompactBar className={className}>
            <span className="shrink-0 text-amber-800/85 dark:text-amber-200/90">Setup:</span>
            <Link href={routes.privateroute.SETTINGS_SMTP} className={cn(linkClass, "shrink-0")}>
                Configure SMTP
            </Link>
            <span className="shrink-0 text-amber-600/80 dark:text-amber-400/80" aria-hidden>
                ·
            </span>
            <Link href={routes.privateroute.SETTINGS_SMS} className={cn(linkClass, "shrink-0")}>
                Enable SMS
            </Link>
        </CompactBar>
    );
}
