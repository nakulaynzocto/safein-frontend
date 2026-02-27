"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuLabel,
} from "@/components/ui/dropdownMenu";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout, setUser } from "@/store/slices/authSlice";
import { toggleAssistant } from "@/store/slices/uiSlice";
import { useLogoutMutation, useGetProfileQuery } from "@/store/api/authApi";
import { useGetChatsQuery } from "@/store/api/chatApi";
import { useGetEmployeeQuery, useGetEmployeesQuery } from "@/store/api/employeeApi";
import { routes } from "@/utils/routes";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { isEmployee as checkIsEmployee, clearAuthData, formatName } from "@/utils/helpers";
import { NotificationBell } from "@/components/common/NotificationBell";
import { useNavbarScrollStyle } from "@/hooks/useScrollStyle";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    User,
    LogOut,
    UserCircle,
    Menu,
    X,
    Calendar,
    Users,
    Building2,
    Shield,
    FileText,
    HelpCircle,
    Phone,
    Mail,
    Bell,
    CreditCard,
    Sparkles,
    MessageSquare,
    Settings,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface NavbarProps {
    forcePublic?: boolean;
    showUpgradeButton?: boolean;
    variant?: "public" | "dashboard";
}

export function Navbar({ forcePublic = false, showUpgradeButton = false, variant = "public" }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user: authUser } = useAppSelector((state) => state.auth);
    const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const lastProfileUserRef = useRef<string | null>(null);

    // Use centralized hook for auth and subscription checks
    const {
        isAuthenticated,
        token,
        shouldShowPrivateNavbar,
        canAccessDashboard,
        isSubscriptionPage,
        hasActiveSubscription,
        hasAnySubscription,
        isTrialingSubscription,
        expiryWarning,
    } = useAuthSubscription();

    // Use scroll-based styling hook for navbar
    const { shouldShowWhiteNavbar, linkText, linkHoverBgClass, ctaBtn } = useNavbarScrollStyle({
        isAuthenticated: !forcePublic && shouldShowPrivateNavbar,
        isMounted,
        threshold: 10,
    });

    const { data: profileUser, refetch: refetchProfile } = useGetProfileQuery(undefined, {
        skip: !isAuthenticated,
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
    });

    const user = profileUser || authUser;

    // Check if user is employee - employees shouldn't see upgrade options
    const isEmployee = checkIsEmployee(user);

    // Fetch employee data to get correct employee name
    // Try to get employee by employeeId first, or by email as fallback
    const { data: employeeData, isLoading: isLoadingEmployee } = useGetEmployeeQuery(user?.employeeId || "", {
        skip: !isEmployee || !user?.employeeId,
    });

    // Also try to get employee by email if employeeId is not available
    const { data: employeesListData } = useGetEmployeesQuery(
        { page: 1, limit: 1, search: user?.email || "" },
        { skip: !isEmployee || !user?.email || !!user?.employeeId || !!employeeData }
    );

    // Get employee from list if found by email
    const employeeFromList = employeesListData?.employees?.find(
        (emp) => emp.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim()
    );

    // Get employee name - prioritize employee data name from API, then employee from list, then user name, then email
    const employeeName = isEmployee
        ? formatName(employeeData?.name || employeeFromList?.name || user?.name || "") || user?.email || "Employee"
        : null;

    // Fetch Chats for Badge Count
    const { data: chats } = useGetChatsQuery(undefined, { skip: !user });

    // Calculate total unread messages
    const unreadMessagesCount = (chats || []).reduce((acc: number, chat: any) => {
        const userId = user?.id || (user as any)?._id;
        return acc + (chat.unreadCounts?.[userId] || 0);
    }, 0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (profileUser && profileUser.id) {
            const userDataHash = JSON.stringify({
                id: profileUser.id,
                profilePicture: profileUser.profilePicture || "",
                email: profileUser.email,
                name: profileUser.name,
                companyName: profileUser.companyName,
            });

            if (userDataHash !== lastProfileUserRef.current) {
                lastProfileUserRef.current = userDataHash;
                dispatch(setUser(profileUser));
                if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(profileUser));
                }
            }
        }
    }, [profileUser, dispatch]);

    useEffect(() => {
        if (!isMounted) return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "user" && e.newValue) {
                try {
                    const updatedUser = JSON.parse(e.newValue);
                    if (updatedUser && updatedUser.id) {
                        refetchProfile();
                    }
                } catch (err) { }
            }
        };

        const handleProfileUpdate = (e: CustomEvent) => {
            if (e.detail && e.detail.id) {
                refetchProfile();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("profileUpdated", handleProfileUpdate as EventListener);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("profileUpdated", handleProfileUpdate as EventListener);
        };
    }, [isMounted, refetchProfile]);

    // Determine if user is authenticated (for UI display purposes)
    // Show private navbar UI if: authenticated AND not forcePublic
    // If user is logged in, show private navbar even if subscription is expired (dashboard access)
    // IMPORTANT: Use isMounted to prevent hydration mismatch - server renders as not authenticated
    const isPublicVariant = forcePublic === true;
    const isActuallyAuthenticated = isMounted && !isPublicVariant && shouldShowPrivateNavbar;

    // For hiding Sign In button: check if user is simply logged in (has token)
    const isLoggedIn = isMounted && !isPublicVariant && isAuthenticated && token;
    const isLoggedInPublic = isMounted && isAuthenticated && token;

    // Show profile dropdown if:
    // 1. Token exists AND payment successful (hasActiveSubscription) - show dropdown with "My Account"
    // 2. OR user is logged in but no subscription (show profile dropdown with upgrade option)
    // Otherwise show public navbar (Sign In / Start Trial)
    // Show profile dropdown if authenticated (only after mount to prevent hydration issues)
    const shouldShowProfileDropdown = isMounted && isAuthenticated && token;

    const handleLogout = useCallback(async () => {
        try {
            dispatch(logout());
            clearAuthData();

            // Call logout API (silently)
            logoutMutation().unwrap().catch(() => { });

            // Robust redirection using window.location to ensure complete state reset
            // This fixes the issue where the app might get stuck in a loading state
            if (typeof window !== "undefined") {
                window.location.href = routes.publicroute.LOGIN;
            }
        } catch (error) {
            dispatch(logout());
            if (typeof window !== "undefined") {
                window.location.href = routes.publicroute.LOGIN;
            }
        }
    }, [logoutMutation, dispatch]);

    const handleOpenUpgradeModal = useCallback(() => {
        setIsUpgradeModalOpen(true);
    }, []);

    const handleCloseUpgradeModal = useCallback(() => {
        setIsUpgradeModalOpen(false);
    }, []);

    return (
        <nav
            className={`${shouldShowWhiteNavbar
                ? "border-b border-gray-200/30 bg-white/90 shadow-lg backdrop-blur-md"
                : "bg-hero-gradient backdrop-blur-0 border-transparent shadow-none"
                } sticky top-0 z-50 transition-all duration-300`}
        >
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Logo - Only show logo, hide text when sidebar is visible (to avoid duplicate branding) */}
                        {variant === "dashboard" ? (
                            // For dashboard variant, show minimal branding with text
                            <>
                                <Link
                                    href={canAccessDashboard ? routes.privateroute.DASHBOARD : routes.publicroute.HOME}
                                    className="flex-shrink-0"
                                    prefetch={true}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-white">
                                        <Image
                                            src="/aynzo-logo.png"
                                            alt="Aynzo Logo"
                                            width={40}
                                            height={40}
                                            priority
                                            className="h-full w-full object-contain p-1"
                                            onError={(e) => {
                                                // Fallback if logo fails to load
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.src = "/aynzo-logo.svg";
                                            }}
                                        />
                                    </div>
                                </Link>
                                {/* Visitor Management System Text - Show for authenticated users */}
                                {shouldShowPrivateNavbar && (
                                    <div className={`hidden items-center lg:flex`}>
                                        <div
                                            className={`text-base font-bold tracking-tight transition-all duration-300 ${shouldShowWhiteNavbar ? "text-[#3882a5]" : "text-white drop-shadow-lg"
                                                }`}
                                        >
                                            Visitor Management System
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // For public variant, show full branding
                            <>
                                <Link
                                    href={canAccessDashboard ? routes.privateroute.DASHBOARD : routes.publicroute.HOME}
                                    className="flex-shrink-0"
                                    prefetch={true}
                                >
                                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-white">
                                        <Image
                                            src="/aynzo-logo.png"
                                            alt="Aynzo Logo"
                                            width={48}
                                            height={48}
                                            priority
                                            className="h-full w-full object-contain p-1"
                                            onError={(e) => {
                                                // Fallback if logo fails to load
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.src = "/aynzo-logo.svg";
                                            }}
                                        />
                                    </div>
                                </Link>
                                {/* Visitor Management System Text - Show for authenticated users */}
                                {shouldShowPrivateNavbar && (
                                    <div className={`hidden items-center lg:flex`}>
                                        <div
                                            className={`text-base font-bold tracking-tight transition-all duration-300 ${shouldShowWhiteNavbar ? "text-[#3882a5]" : "text-white drop-shadow-lg"
                                                }`}
                                        >
                                            Visitor Management System
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden flex-1 items-center justify-center lg:flex">
                        {!isActuallyAuthenticated && variant !== "dashboard" && (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={routes.publicroute.HOME}
                                    className={`relative inline-flex items-center rounded-lg border-b-2 px-3 py-2 text-[14px] font-medium ${pathname === routes.publicroute.HOME
                                        ? `${shouldShowWhiteNavbar ? "border-brand" : "border-white"} ${linkText}`
                                        : `border-transparent ${linkText}`
                                        } group transition-colors duration-200 ${linkHoverBgClass}`}
                                    prefetch={true}
                                >
                                    <span className="relative z-10">Home</span>
                                    <div
                                        className={`absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${shouldShowWhiteNavbar ? "from-brand/10 to-brand-strong/10 bg-gradient-to-r" : "bg-white/5"}`}
                                    />
                                </Link>
                                <Link
                                    href={routes.publicroute.FEATURES}
                                    className={`relative inline-flex items-center rounded-lg border-b-2 px-3 py-2 text-[14px] font-medium ${pathname === routes.publicroute.FEATURES
                                        ? `${shouldShowWhiteNavbar ? "border-brand" : "border-white"} ${linkText}`
                                        : `border-transparent ${linkText}`
                                        } group transition-colors duration-200 ${linkHoverBgClass}`}
                                    prefetch={true}
                                >
                                    <span className="relative z-10">Features</span>
                                    <div
                                        className={`absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${shouldShowWhiteNavbar ? "from-brand/10 to-brand-strong/10 bg-gradient-to-r" : "bg-white/5"}`}
                                    />
                                </Link>
                                <Link
                                    href={routes.publicroute.PRICING}
                                    className={`relative inline-flex items-center rounded-lg border-b-2 px-3 py-2 text-[14px] font-medium ${pathname === routes.publicroute.PRICING
                                        ? `${shouldShowWhiteNavbar ? "border-brand" : "border-white"} ${linkText}`
                                        : `border-transparent ${linkText}`
                                        } group transition-colors duration-200 ${linkHoverBgClass}`}
                                    prefetch={true}
                                >
                                    <span className="relative z-10">Pricing</span>
                                    <div
                                        className={`absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${shouldShowWhiteNavbar ? "from-brand/10 to-brand-strong/10 bg-gradient-to-r" : "bg-white/5"}`}
                                    />
                                </Link>
                                <Link
                                    href={routes.publicroute.CONTACT}
                                    className={`relative inline-flex items-center rounded-lg border-b-2 px-3 py-2 text-[14px] font-medium ${pathname === routes.publicroute.CONTACT
                                        ? `${shouldShowWhiteNavbar ? "border-brand" : "border-white"} ${linkText}`
                                        : `border-transparent ${linkText}`
                                        } group transition-colors duration-200 ${linkHoverBgClass}`}
                                    prefetch={true}
                                >
                                    <span className="relative z-10">Contact</span>
                                    <div
                                        className={`absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${shouldShowWhiteNavbar ? "from-brand/10 to-brand-strong/10 bg-gradient-to-r" : "bg-white/5"}`}
                                    />
                                </Link>
                                <Link
                                    href={routes.publicroute.HELP}
                                    className={`relative inline-flex items-center rounded-lg border-b-2 px-3 py-2 text-[14px] font-medium ${pathname === routes.publicroute.HELP
                                        ? `${shouldShowWhiteNavbar ? "border-brand" : "border-white"} ${linkText}`
                                        : `border-transparent ${linkText}`
                                        } group transition-colors duration-200 ${linkHoverBgClass}`}
                                    prefetch={true}
                                >
                                    <span className="relative z-10">Help</span>
                                    <div
                                        className={`absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${shouldShowWhiteNavbar ? "from-brand/10 to-brand-strong/10 bg-gradient-to-r" : "bg-white/5"}`}
                                    />
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Authenticated users - Show company info or user profile, notifications, and sidebar toggle */}
                        {isActuallyAuthenticated && !isSubscriptionPage && (
                            <div className="flex items-center gap-3">
                                {/* Company Name with Logo - For admins */}
                                {user?.companyName && !isEmployee && (
                                    <div
                                        className={`hidden items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 sm:flex ${shouldShowWhiteNavbar
                                            ? "bg-gray-50 text-gray-900"
                                            : "bg-white/10 text-white"
                                            }`}
                                    >
                                        {user?.profilePicture && user.profilePicture.trim() !== "" ? (
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden bg-white">
                                                <Image
                                                    src={`${user.profilePicture}${user.profilePicture.includes("?") ? "&" : "?"}v=${user.profilePicture.length}`}
                                                    alt={user?.companyName || "Company Logo"}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-contain p-1"
                                                    onError={(e) => {
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        target.src = "/aynzo-logo.png";
                                                        target.className = "h-full w-full object-contain p-1";
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <Building2
                                                className={`h-5 w-5 flex-shrink-0 ${shouldShowWhiteNavbar ? "text-gray-600" : "text-white"}`}
                                            />
                                        )}
                                        <span className="text-sm font-semibold whitespace-nowrap">
                                            {formatName(user.companyName)}
                                        </span>
                                    </div>
                                )}
                                {/* Company Logo - Company Name (Employee Name) - For employees (plain text, no button) */}
                                {isEmployee && (user?.companyName || user?.name || user?.email) && (
                                    <div
                                        className={`hidden items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 sm:flex ${shouldShowWhiteNavbar
                                            ? "bg-gray-50 text-gray-900"
                                            : "bg-white/10 text-white"
                                            }`}
                                    >
                                        {/* Company Logo - Use company profile picture or Building2 icon */}
                                        {user?.profilePicture && user.profilePicture.trim() !== "" ? (
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden bg-white rounded-full">
                                                <Image
                                                    src={`${user.profilePicture}${user.profilePicture.includes("?") ? "&" : "?"}v=${user.profilePicture.length}`}
                                                    alt={user?.companyName || "Company Logo"}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-contain p-1"
                                                    onError={(e) => {
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        target.src = "/aynzo-logo.png";
                                                        target.className = "h-full w-full object-contain p-1";
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <Building2
                                                className={`h-5 w-5 flex-shrink-0 ${shouldShowWhiteNavbar ? "text-gray-600" : "text-white"}`}
                                            />
                                        )}
                                        <span className="text-sm font-semibold whitespace-nowrap">
                                            {user?.companyName && employeeName
                                                ? `${formatName(user.companyName)} (${employeeName})`
                                                : formatName(user?.companyName || "") || employeeName || "Employee"}
                                        </span>
                                    </div>
                                )}


                                 {/* Messages Icon */}
                                <Link
                                    href={routes.privateroute.MESSAGES}
                                    className={cn(
                                        "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                                        shouldShowWhiteNavbar ? "text-gray-700 hover:bg-gray-100/80" : "text-white hover:bg-white/10"
                                    )}
                                    title="Messages"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    {unreadMessagesCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm">
                                            {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Notification Bell */}
                                <NotificationBell
                                    className={shouldShowWhiteNavbar ? "hover:bg-gray-100/80" : "hover:bg-white/10"}
                                    iconClassName={shouldShowWhiteNavbar ? "text-gray-700" : "text-white"}
                                />

                                {/* Settings Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "size-9 rounded-full transition-colors",
                                                shouldShowWhiteNavbar
                                                    ? "text-gray-700 hover:bg-gray-100/80"
                                                    : "text-white hover:bg-white/10"
                                            )}
                                            title="Settings"
                                        >
                                            <Settings className="h-5 w-5" />
                                            <span className="sr-only">Settings</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        sideOffset={8}
                                        className="w-72 p-0 overflow-hidden rounded-xl border border-border shadow-xl bg-white"
                                    >
                                        {/* Header: LinkedIn Style */}
                                        {user && (
                                            <div className="p-4 border-b border-border bg-white">
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-14 w-14 ring-1 ring-border shadow-sm">
                                                        <AvatarImage src={user.photo || user.profilePicture} alt={user.name} />
                                                        <AvatarFallback className="text-xl font-bold rounded-full"
                                                            style={{ background: "#e9eff6", color: "#074463" }}>
                                                            {(isEmployee
                                                                ? (employeeName || "E")
                                                                : (user.companyName || user.name || "A")
                                                            ).charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0 pt-1">
                                                        <p className="text-base font-bold text-[#161718] truncate leading-tight">
                                                            {isEmployee
                                                                ? (employeeName || "Employee")
                                                                : (user.companyName || user.name || "Admin")}
                                                        </p>
                                                        <p className="text-xs text-[#6b7280] truncate mt-1">
                                                            {isEmployee ? "Employee Account" : "Platform Administrator"}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mt-4">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex-1 rounded-full h-8 text-[13px] font-semibold border-[#074463] text-[#074463] hover:bg-[#e9eff6] hover:text-[#074463]"
                                                        onClick={() => router.push(routes.privateroute.PROFILE)}
                                                    >
                                                        View Profile
                                                    </Button>
                                                    {!isEmployee && (
                                                        <Button 
                                                            size="sm" 
                                                            className="flex-1 rounded-full h-8 text-[13px] font-semibold bg-[#074463] text-white hover:bg-[#05334a]"
                                                            onClick={handleOpenUpgradeModal}
                                                        >
                                                            Upgrade
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Account Section */}
                                        <div className="py-2">
                                            <div className="px-4 py-1.5">
                                                <p className="text-[15px] font-bold text-[#161718]">Account</p>
                                                {!isEmployee && (isTrialingSubscription || !hasActiveSubscription) && (
                                                    <div className="flex items-center gap-1.5 mt-1.5 group cursor-pointer" onClick={handleOpenUpgradeModal}>
                                                        <div className="h-3 w-3 bg-[#e68a00] rounded-[2px]" />
                                                        <p className="text-[13px] font-semibold text-[#666666] group-hover:underline group-hover:text-[#0a66c2]">
                                                            Try Premium for ₹0
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                             {!isEmployee && (
                                                 <DropdownMenuItem asChild className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors">
                                                    <Link href={routes.privateroute.PROFILE} className="text-[14px] font-semibold text-[#666666] group-hover:underline">
                                                        Settings & Privacy
                                                    </Link>
                                                </DropdownMenuItem>
                                             )}
                                            {/* WhatsApp and Email Server links removed */}
                                            <DropdownMenuItem asChild className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors">
                                                <Link href={routes.publicroute.HELP} className="text-[14px] font-semibold text-[#666666] group-hover:underline">
                                                    Help
                                                </Link>
                                            </DropdownMenuItem>
                                        </div>

                                        {/* Manage Section */}
                                        <div className="py-2 border-t border-border">
                                            <p className="px-4 py-1.5 text-[15px] font-bold text-[#161718]">Manage</p>
                                            <DropdownMenuItem 
                                                onClick={() => dispatch(toggleAssistant())}
                                                className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors"
                                            >
                                                <span className="text-[14px] font-semibold text-[#666666] group-hover:underline flex items-center gap-2">
                                                    Ask SafeIn
                                                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                                </span>
                                            </DropdownMenuItem>
                                            {!isEmployee && (
                                                <DropdownMenuItem asChild className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors">
                                                    <Link href={routes.privateroute.SPOT_PASS} className="text-[14px] font-semibold text-[#666666] group-hover:underline">
                                                        Spot Pass
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                        </div>

                                        {/* Logout Section */}
                                        <div className="py-2 border-t border-border">
                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors"
                                            >
                                                <span className="text-[14px] font-semibold text-[#666666] group-hover:underline">
                                                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                                                </span>
                                            </DropdownMenuItem>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>



                            </div>
                        )}

                        {/* Show appropriate button based on subscription status */}
                        {isMounted && isAuthenticated && token && !isSubscriptionPage && (
                            <>
                                {/* Private navbar: Show Upgrade ONLY for trial users or expired subscription AND NOT for employees */}
                                {isActuallyAuthenticated && !isEmployee && (isTrialingSubscription || !hasActiveSubscription) && (
                                    <button
                                        type="button"
                                        onClick={handleOpenUpgradeModal}
                                        className="hidden rounded-lg bg-[#3882a5] px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#2d6a87] sm:flex sm:px-4 sm:text-[14px]"
                                    >
                                        UPGRADE
                                    </button>
                                )}
                                {/* Public navbar ONLY: Show My Account for logged-in users */}
                                {forcePublic && isLoggedInPublic && (
                                    <Link
                                        href={routes.privateroute.DASHBOARD}
                                        className={cn(
                                            "rounded-lg px-3 py-1.5 sm:px-6 sm:py-2 text-[12px] sm:text-[14px] font-semibold transition-all duration-300 flex items-center justify-center",
                                            ctaBtn
                                        )}
                                        prefetch={true}
                                    >
                                        My Account
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Logout button - Only on subscription page */}
                        {isMounted && isSubscriptionPage && isAuthenticated && token && (
                            <Button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="rounded-lg bg-[#3882a5] px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#2d6a87] sm:px-4 sm:text-[14px]"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </Button>
                        )}

                        {/* Sign In / Start Trial - Show ONLY when not authenticated */}
                        {isMounted && (!isAuthenticated || !token) && variant !== "dashboard" && (
                            <>
                                <Button
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        "rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-sm font-medium transition-all duration-200 flex items-center justify-center",
                                        linkHoverBgClass,
                                        linkText
                                    )}
                                >
                                    <Link href={routes.publicroute.LOGIN} prefetch={true}>
                                        Sign in
                                    </Link>
                                </Button>
                                <Link
                                    href={routes.publicroute.REGISTER}
                                    className={`hidden rounded-lg px-6 py-2 text-[14px] font-semibold transition-all duration-300 sm:flex ${ctaBtn}`}
                                    prefetch={true}
                                >
                                    Start 3 Day Trial
                                </Link>
                            </>
                        )}

                        {/* Mobile menu toggle - Only show on public pages */}
                        {!isActuallyAuthenticated && variant !== "dashboard" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`rounded-lg p-2 transition-all duration-200 lg:hidden ${shouldShowWhiteNavbar
                                    ? "text-gray-900 hover:bg-gray-100/80"
                                    : "text-white hover:bg-white/10"
                                    }`}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Upgrade Modal (opened from navbar Upgrade button) */}
                <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={handleCloseUpgradeModal} />

                {isMobileMenuOpen && !isActuallyAuthenticated && (
                    <div className="border-t border-gray-200/30 bg-white/90 shadow-lg backdrop-blur-md lg:hidden">
                        <div className="space-y-2 px-4 pt-4 pb-6">
                            {/* Show public menu links when: forcePublic is true OR not authenticated OR no subscription */}
                            {(forcePublic || !isAuthenticated || !token || !hasActiveSubscription) && (
                                <>
                                    <Link
                                        href={routes.publicroute.HOME}
                                        className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100/80"
                                        style={{ color: "#161718" }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href={routes.publicroute.FEATURES}
                                        className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100/80"
                                        style={{ color: "#161718" }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href={routes.publicroute.PRICING}
                                        className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100/80"
                                        style={{ color: "#161718" }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Pricing
                                    </Link>
                                    <Link
                                        href={routes.publicroute.CONTACT}
                                        className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100/80"
                                        style={{ color: "#161718" }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Contact
                                    </Link>
                                    <Link
                                        href={routes.publicroute.HELP}
                                        className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 hover:bg-gray-100/80"
                                        style={{ color: "#161718" }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Help
                                    </Link>
                                    <div className="border-t border-gray-200/50 pt-4">
                                        {/* Show Sign In / Start Trial if: No token */}
                                        {!isAuthenticated || !token ? (
                                            <>
                                                <Link
                                                    href={routes.publicroute.LOGIN}
                                                    className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:bg-gray-100/80"
                                                    style={{ color: "#161718" }}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Sign in
                                                </Link>
                                                <Link
                                                    href={routes.publicroute.REGISTER}
                                                    className={`block rounded-lg px-4 py-3 text-base font-semibold transition-all duration-300 ${ctaBtn}`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Start 3 Day Trial
                                                </Link>
                                            </>
                                        ) : isMounted && isAuthenticated && token && !isSubscriptionPage ? (
                                            /* Show My Account for any logged-in user */
                                            <Link
                                                href={routes.privateroute.DASHBOARD}
                                                className={`block rounded-lg px-4 py-3 text-base font-semibold transition-all duration-300 ${ctaBtn}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                My Account
                                            </Link>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>


        </nav>
    );
}
