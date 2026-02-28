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
            name: "Visitor Invites",
            href: routes.privateroute.APPOINTMENT_LINKS,
            icon: LinkIcon,
            roles: ["admin", "employee"], // Both admin and employee
        },
        {
            name: "Spot Pass",
            href: routes.privateroute.SPOT_PASS,
            icon: ClipboardList,
            roles: ["admin"], // Only admin
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

    // Check if user is employee
    const isEmployee = checkIsEmployee(user);

    // Determine user role - if user is not loaded, default to empty to hide menus
    let userRole = 'admin';
    if (user) {
        if (checkIsEmployee(user)) {
            userRole = 'employee';
        } else if (user.role) {
            userRole = user.role;
        }
    } else {
        // If user is not loaded yet, don't show admin menus
        userRole = '';
    }

    // Filter navigation items based on role and set correct href
    const navigation = baseNavigation
        .filter(item => userRole && item.roles.includes(userRole as any))
        .map(item => ({
            ...item,
            href: typeof item.href === 'function' ? item.href(userRole) : item.href
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

        if (href === routes.privateroute.APPOINTMENT_LINKS) {
            return (
                pathname === routes.privateroute.APPOINTMENT_LINKS ||
                pathname?.startsWith(routes.privateroute.APPOINTMENT_LINKS)
            );
        }

        if (href === routes.privateroute.SPOT_PASS) {
            return pathname === routes.privateroute.SPOT_PASS;
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
                        <Image src="/aynzo-logo.png" alt="Aynzo Logo" width={100} height={40} className="h-8 w-auto" />
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
                                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                                    isActive(item.href)
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
                                )}
                                onClick={onLinkClick}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
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
                                isActive(item.href) && "active bg-primary/10 text-primary",
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
