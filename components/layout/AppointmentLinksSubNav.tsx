"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/utils/routes";
import { MOBILE_APPOINTMENT_LINKS_SUB_NAV_HEIGHT_PX } from "@/utils/appointmentLinksLayout";
import { Link2, Zap, QrCode } from "lucide-react";

const tabs = [
    {
        name: "Smart link",
        href: routes.privateroute.APPOINTMENT_LINKS_SEND_LINK,
        icon: Link2,
        isActive: (pathname: string) =>
            pathname === routes.privateroute.APPOINTMENT_LINKS ||
            pathname === routes.privateroute.APPOINTMENT_LINKS_SEND_LINK ||
            pathname === routes.privateroute.APPOINTMENT_LINKS_CREATE,
    },
    {
        name: "Priority booking",
        href: routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING,
        icon: Zap,
        isActive: (pathname: string) =>
            pathname === routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING ||
            pathname === routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING_CREATE ||
            pathname.startsWith(`${routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING}/`),
    },
    {
        name: "Gate QR",
        href: routes.privateroute.SETTINGS_QR_CHECKIN,
        icon: QrCode,
        isActive: (pathname: string) =>
            pathname === routes.privateroute.SETTINGS_QR_CHECKIN,
    },
];

/**
 * Invite section switcher — mobile only (floating pill above bottom nav).
 * Desktop: hidden; users navigate via sidebar / page content.
 */
export function AppointmentLinksSubNav() {
    const pathname = usePathname() || "";

    return (
        <nav
            className="pointer-events-none fixed left-0 right-0 z-[35] flex justify-center bg-transparent md:hidden"
            style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
            aria-label="Invite section navigation"
        >
            <div
                className="pointer-events-auto flex items-center rounded-2xl border border-gray-200/50 bg-white/90 px-1 shadow-[0_-2px_20px_rgba(56,130,165,0.12)] backdrop-blur-md"
                style={{ height: MOBILE_APPOINTMENT_LINKS_SUB_NAV_HEIGHT_PX }}
            >
                <div className="flex flex-row items-stretch justify-center gap-0">
                    {tabs.map((tab) => {
                        const active = tab.isActive(pathname);
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                prefetch
                                className={cn(
                                    "relative flex min-w-0 shrink-0 flex-col items-center justify-center gap-1 px-1.5 transition-all duration-200",
                                    active ? "text-accent" : "text-gray-400 active:text-accent/70"
                                )}
                            >
                                {active && (
                                    <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent" />
                                )}

                                <span
                                    className={cn(
                                        "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                                        active ? "scale-110 bg-accent/10" : "scale-100"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 transition-all duration-200",
                                            active ? "stroke-[2.2]" : "stroke-[1.6]"
                                        )}
                                    />
                                </span>

                                <span
                                    className={cn(
                                        "max-w-[100px] truncate px-0.5 text-center text-[10px] font-medium leading-tight tracking-tight sm:max-w-none sm:text-[11px]",
                                        active ? "opacity-100" : "opacity-60"
                                    )}
                                >
                                    {tab.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
