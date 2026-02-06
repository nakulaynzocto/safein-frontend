"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/utils/routes";
import { isEmployee as checkIsEmployee } from "@/utils/helpers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserPlus,
    Settings,
    UserCircle,
    CheckCircle,
    Bell,
    LogOut,
    ChevronDown,
    ChevronRight,
    Package,
    Menu,
    ClipboardList,
    Link as LinkIcon,
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
            name: "Appointment Requests",
            href: routes.privateroute.APPOINTMENT_REQUESTS,
            icon: ClipboardList,
            roles: ["employee"], // Only employee
        },
        {
            name: "Send Appointment Link",
            href: routes.privateroute.APPOINTMENT_LINKS,
            icon: LinkIcon,
            roles: ["admin", "employee"], // Both admin and employee
        },
    ];

// Base settings submenu items
const baseSettingsSubmenu = [
    {
        name: "Profile",
        href: routes.privateroute.PROFILE,
        icon: UserCircle,
        roles: ["admin"], // Only admin can access profile
    },
];

export const SidebarContent = ({ onLinkClick, isMobile = false }: { onLinkClick?: () => void; isMobile?: boolean }) => {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
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

    // Filter settings submenu based on role - only show if user is loaded and is admin
    const settingsSubmenu = baseSettingsSubmenu.filter(item =>
        userRole && item.roles.includes(userRole as any)
    );

    const isSettingsActive =
        pathname === routes.privateroute.SETTINGS ||
        pathname === routes.privateroute.PROFILE ||
        pathname === routes.privateroute.SETTINGS_STATUS ||
        pathname?.startsWith("/settings/");
    const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
    const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
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

        return false;
    };

    useEffect(() => {
        // Only update when pathname actually changes (not on every render or state change)
        if (prevPathnameRef.current !== pathname) {
            // Auto-open settings menu if navigating TO a settings page
            if (isSettingsActive) {
                setSettingsOpen(true);
            } else {
                // Auto-close settings menu when navigating AWAY from settings pages to a different route
                setSettingsOpen(false);
            }
            prevPathnameRef.current = pathname;
        }
    }, [pathname, isSettingsActive]);

    const handleLogout = async () => {
        try {
            dispatch(logout());
            logoutMutation()
                .unwrap()
                .catch(() => { });
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                sessionStorage.clear();
            }
            onLinkClick?.();
            setTimeout(() => {
                router.replace(routes.publicroute.LOGIN);
            }, 300);
        } catch (error) {
            dispatch(logout());
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
            onLinkClick?.();
            setTimeout(() => {
                router.replace(routes.publicroute.LOGIN);
            }, 300);
        }
    };

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
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
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

                    {/* Settings menu - only show if there are submenu items */}
                    {settingsSubmenu.length > 0 && (
                        <div className="mt-2 space-y-1">
                            <button
                                onClick={() => setSettingsOpen(!settingsOpen)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                                    isSettingsActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="h-5 w-5 shrink-0" />
                                    <span className="truncate">Settings</span>
                                </div>
                                {settingsOpen ? (
                                    <ChevronDown className="h-4 w-4 shrink-0" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 shrink-0" />
                                )}
                            </button>

                            {settingsOpen && (
                                <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-2">
                                    {settingsSubmenu.map((item) => {
                                        if (!item.href) return null;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                prefetch={true}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                                    isActive(item.href)
                                                        ? "bg-primary/10 text-primary shadow-sm"
                                                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
                                                )}
                                                onClick={onLinkClick}
                                            >
                                                <item.icon className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                <div className="border-t bg-gray-50 p-4">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mb-4 flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="truncate">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                    <p className="text-center text-xs text-gray-500">© 2024 Aynzo. All rights reserved.</p>
                </div>
            </div>
        );

    }

    return (
        <>
            <nav className="mt-8 flex-1 space-y-2 overflow-y-auto p-2">
                {navigation.map((item) => {
                    if (!item.href) return null;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                                "sidebar-item rounded-lg border-0 text-base",
                                isActive(item.href) && "active bg-primary/10 text-primary",
                            )}
                        >
                            <item.icon className="sidebar-item-icon" />
                            <span className="sidebar-item-text font-medium tracking-wide">{item.name}</span>
                        </Link>
                    );
                })}

                {/* Settings menu - only show if there are submenu items */}
                {settingsSubmenu.length > 0 && (
                    <div className="space-y-1">
                        <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className={cn(
                                "sidebar-item flex w-full items-center justify-between rounded-lg border-0 text-base",
                                isSettingsActive && "active bg-primary/10 text-primary",
                            )}
                        >
                            <div className="flex items-center">
                                <Settings className="sidebar-item-icon" />
                                <span className="sidebar-item-text font-medium tracking-wide">Settings</span>
                            </div>
                            {settingsOpen ? (
                                <ChevronDown className="sidebar-item-text h-4 w-4" />
                            ) : (
                                <ChevronRight className="sidebar-item-text h-4 w-4" />
                            )}
                        </button>

                        {settingsOpen && (
                            <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-2">
                                {settingsSubmenu.map((item) => {
                                    if (!item.href) return null;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            prefetch={true}
                                            className={cn(
                                                "sidebar-item flex items-center gap-2 rounded-md border-0 px-3 py-2 text-sm",
                                                isActive(item.href) && "active bg-primary/10 text-primary",
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span className="sidebar-item-text font-medium">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </nav>

            <div className="p-2 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="sidebar-item flex w-full items-center gap-2 rounded-lg border-0 text-base text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                    <LogOut className="sidebar-item-icon" />
                    <span className="sidebar-item-text font-medium tracking-wide">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
            </div>
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
