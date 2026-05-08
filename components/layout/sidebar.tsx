"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/utils/routes";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useAppSelector } from "@/store/hooks";
// Import Chat Query
import { useGetChatsQuery } from "@/store/api/chatApi";
import { useGetUserActiveSubscriptionQuery } from "@/store/api/userSubscriptionApi";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserPlus,
    UserCircle,
    CheckCircle,
    Bell,
    Package,
    Menu,
    ClipboardList,
    Link as LinkIcon,
    MessageSquare,
    Mail,
    QrCode,
} from "lucide-react";

interface SidebarProps {
    className?: string;
}

// Base navigation items
const baseNavigation: Array<{
    name: string;
    href: string | ((role: string) => string);
    icon: any;
    roles: string[];
    requiredModule?: "enableInvites" | "enablePriorityBooking" | "enableQrCode" | "enableChat" | "enableSpotPass";
}> = [
        {
            name: "Dashboard",
            href: routes.privateroute.DASHBOARD,
            icon: LayoutDashboard,
            roles: ["admin", "employee"], // Both admin and employee can see
        },
        {
            name: "Employees",
            href: routes.privateroute.EMPLOYEELIST,
            icon: Users,
            roles: ["admin"], // Only admin
        },
        {
            name: "Visitors",
            href: routes.privateroute.VISITORLIST,
            icon: UserPlus,
            roles: ["admin"], // Only admin
        },
        {
            name: "Appointments",
            href: routes.privateroute.APPOINTMENTLIST,
            icon: Calendar,
            roles: ["admin", "employee"], // Both admin and employee can see
        },
        {
            name: "Invite Links",
            href: routes.privateroute.APPOINTMENT_LINKS_SEND_LINK,
            icon: LinkIcon,
            roles: ["admin", "employee"], // Both admin and employee
            requiredModule: "enableInvites",
        },
        {
            name: "Priority Bookings",
            href: routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING,
            icon: UserCircle,
            roles: ["admin", "employee"], // Both admin and employee
            requiredModule: "enablePriorityBooking",
        },
        {
            name: "Spot Pass",
            href: routes.privateroute.SPOT_PASS,
            icon: ClipboardList,
            roles: ["admin"], // Only admin
            requiredModule: "enableSpotPass",
        },
        {
            name: "QR Check-in",
            href: routes.privateroute.SETTINGS_QR_CHECKIN,
            icon: QrCode,
            roles: ["admin", "employee"], // Both admin and employee
            requiredModule: "enableQrCode",
        },
        {
            name: "Visit Approvals",
            href: routes.privateroute.APPOINTMENT_REQUESTS,
            icon: ClipboardList,
            roles: ["employee"], // Only employee
        },
    ];




export const SidebarContent = ({ onLinkClick, isMobile = false }: { onLinkClick?: () => void; isMobile?: boolean }) => {
    const pathname = usePathname();
    const { user } = useAppSelector((state) => state.auth);
    
    // Determine user roles and type first
    const userRoles = user?.roles || (user?.role ? [user.role] : []);
    const isEmployee = checkIsEmployee(user);

    // For employees, we need to fetch the subscription of their Admin (createdBy)
    const subscriptionOwnerId = isEmployee ? user?.createdBy : user?.id;
    const { data: subscriptionData } = useGetUserActiveSubscriptionQuery(subscriptionOwnerId as string, { skip: !subscriptionOwnerId });
    const modules = subscriptionData?.data?.modules;

    // Filter navigation items based on role, subscription modules, and set correct href
    const navigation = baseNavigation
        .filter(item => {
            // Check if any of the user's roles match the item's allowed roles
            const hasRequiredRole = item.roles.some(role => userRoles.includes(role));
            if (!hasRequiredRole) return false;

            // Check Subscription Module
            if (item.requiredModule) {
                if (!modules || !modules[item.requiredModule]) return false;
            }

            return true;
        })
        .map(item => ({
            ...item,
            href: typeof item.href === 'function' ? item.href(userRoles[0] || 'admin') : item.href
        }));

    const prevPathnameRef = useRef(pathname);

    const isActive = (href: string) => {
        if (pathname === href) return true;

        if (href === routes.privateroute.EMPLOYEELIST) {
            return (
                pathname === routes.privateroute.EMPLOYEELIST ||
                pathname === routes.privateroute.EMPLOYEECREATE ||
                (pathname?.startsWith("/employee/") && pathname !== routes.privateroute.EMPLOYEELIST)
            );
        }

        if (href === routes.privateroute.APPOINTMENTLIST) {
            return (
                pathname === routes.privateroute.APPOINTMENTLIST ||
                pathname === routes.privateroute.APPOINTMENTCREATE ||
                (pathname?.startsWith("/appointment/") &&
                    pathname !== routes.privateroute.APPOINTMENTLIST &&
                    pathname !== routes.privateroute.APPOINTMENT_REQUESTS)
            );
        }

        if (href === routes.privateroute.VISITORLIST) {
            return (
                pathname === routes.privateroute.VISITORLIST ||
                pathname === routes.privateroute.VISITORREGISTRATION ||
                (pathname?.startsWith("/visitor/") && pathname !== routes.privateroute.VISITORLIST)
            );
        }

        if (href === routes.privateroute.APPOINTMENT_REQUESTS) {
            return pathname === routes.privateroute.APPOINTMENT_REQUESTS;
        }

        if (href === routes.privateroute.APPOINTMENT_LINKS_SEND_LINK) {
            return (
                pathname === routes.privateroute.APPOINTMENT_LINKS_SEND_LINK ||
                pathname === routes.privateroute.APPOINTMENT_LINKS_CREATE ||
                pathname === routes.privateroute.APPOINTMENT_LINKS
            );
        }

        if (href === routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING) {
            return pathname === routes.privateroute.APPOINTMENT_LINKS_VIP_BOOKING;
        }

        if (href === routes.privateroute.SPOT_PASS) {
            return pathname === routes.privateroute.SPOT_PASS;
        }

        if (href === routes.privateroute.SETTINGS_QR_CHECKIN) {
            return pathname === routes.privateroute.SETTINGS_QR_CHECKIN;
        }

        return false;
    };

    useEffect(() => {
        prevPathnameRef.current = pathname;
    }, [pathname]);



    if (isMobile) {
        return (
            <div className="flex h-full flex-col bg-white">
                <SheetHeader className="border-b bg-linear-to-r from-gray-50 to-white p-4">
                    <div className="flex items-center gap-3">
                        <Image src="/safein-logo.svg" alt="SafeIn Logo" width={100} height={40} className="h-8 w-auto" />
                    </div>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>

                <nav className="flex-1 space-y-2 overflow-y-auto p-2">
                    {navigation.map((item) => {
                        if (!item.href) return null;
                        const isMessages = item.name === "Messages";
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    "flex items-center gap-4 rounded-xl px-4 py-4 text-[16px] font-bold transition-all duration-200 relative",
                                    isActive(item.href)
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
                                )}
                                onClick={onLinkClick}
                            >
                                <item.icon className="h-6 w-6 shrink-0" />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}

                </nav>
            </div>
        );

    }

    return (
        <>
            <nav className="mt-8 flex-1 space-y-2 overflow-y-auto p-2">
                {navigation.map((item) => {
                    if (!item.href) return null;
                    const isMessages = item.name === "Messages";
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                                "sidebar-item rounded-lg border-0 text-base flex justify-between items-center pr-3",
                                isActive(item.href) && "active"
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className="sidebar-item-icon" />
                                <span className="sidebar-item-text font-medium tracking-wide">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}

            </nav>
        </>
    );
};

export function Sidebar({ className }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "sidebar-hostinger hidden h-full flex-col overflow-hidden transition-all duration-300 ease-in-out md:flex",
                    collapsed ? "sidebar-collapsed" : "sidebar-expanded",
                    className,
                )}
            >
                <SidebarContent />
            </div>

            {/* Mobile Sidebar - Now controlled from Navbar */}
        </>
    );
}
