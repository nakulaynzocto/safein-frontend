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
    LogOut,
    UserCircle,
    Menu,
    X,
    Users,
    Building2,
    HelpCircle,
    Mail,
    Bell,
    CreditCard,
    Sparkles,
    MessageSquare,
    Settings,
    ChevronRight,
    Zap,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { CreditBalancePill } from "@/components/dashboard/CreditBalancePill";

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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
        setIsSettingsOpen(false);
        setIsUpgradeModalOpen(true);
    }, []);

    const handleCloseUpgradeModal = useCallback(() => {
        setIsUpgradeModalOpen(false);
    }, []);

    return (
        <nav
            className={cn(
                "top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                variant === "dashboard" ? "sticky" : "fixed",
                shouldShowWhiteNavbar
                    ? cn(
                        "border-b border-gray-200/50 bg-white shadow-sm py-0",
                        variant === "dashboard" ? "shadow-sm" : "shadow-md"
                    )
                    : "bg-transparent border-transparent shadow-none py-2"
            )}
        >
            {/* Design accents removed for a cleaner look */}

            <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-3">
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
                                            src={user?.profilePicture && user.profilePicture.trim() !== "" ? user.profilePicture : "/safein-logo.svg"}
                                            alt={user?.companyName || "Company Logo"}
                                            width={40}
                                            height={40}
                                            priority
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.src = "/safein-identity.png";
                                            }}
                                        />
                                    </div>
                                </Link>
                                {/* Visitor Management System Text - Show for authenticated users */}
                                {shouldShowPrivateNavbar && (
                                    <div className={`hidden items-center lg:flex`}>
                                        <div
                                            className={`text-lg lg:text-xl font-black tracking-tight transition-all duration-300 ${shouldShowWhiteNavbar ? "text-[#3882a5]" : "text-white"
                                                }`}
                                        >
                                            {formatName(user?.companyName || "Visitor Management System")}
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
                                    <div className="group relative flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center overflow-hidden rounded-xl lg:rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:scale-105 shadow-sm">
                                        <Image
                                            src={user?.profilePicture && user.profilePicture.trim() !== "" ? user.profilePicture : "/safein-logo.svg"}
                                            alt={user?.companyName || "Company Logo"}
                                            width={56}
                                            height={56}
                                            priority
                                            className="h-full w-full object-contain transition-transform duration-500 group-hover:rotate-12"
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.src = "/safein-identity.png";
                                            }}
                                        />
                                        <div className="animate-shimmer absolute inset-0 opacity-10"></div>
                                    </div>
                                </Link>
                                {/* Visitor Management System Text - Show for authenticated users */}
                                {shouldShowPrivateNavbar && (
                                    <div className={`hidden items-center lg:flex`}>
                                        <div
                                            className={`text-lg lg:text-xl font-black tracking-tight transition-all duration-300 ${shouldShowWhiteNavbar ? "text-[#3882a5]" : "text-white"
                                                }`}
                                        >
                                            {formatName(user?.companyName || "Visitor Management System")}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden flex-1 items-center justify-end lg:flex">
                        {!isActuallyAuthenticated && variant !== "dashboard" && (
                            <div className="flex items-center gap-2 px-2 mr-12">
                                {[
                                    { label: "Home", href: routes.publicroute.HOME },
                                    { label: "Features", href: "/#features" },
                                    { label: "Pricing", href: "/#pricing" },
                                    { label: "Blog", href: routes.publicroute.BLOG },
                                    { label: "Help", href: routes.publicroute.HELP },
                                    { label: "Contact", href: routes.publicroute.CONTACT }
                                ].map((item) => {
                                    const isActive = pathname === item.href;
                                    
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "relative px-5 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl",
                                                isActive 
                                                    ? shouldShowWhiteNavbar 
                                                        ? "text-[#3882a5]" 
                                                        : "text-white"
                                                    : linkText,
                                                "hover:opacity-80 active:scale-95"
                                            )}
                                        >
                                            <span className="relative z-10">{item.label}</span>
                                            {isActive && (
                                                <div className={cn(
                                                    "absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                                                    shouldShowWhiteNavbar ? "bg-brand" : "bg-white"
                                                )} />
                                            )}
                                            {!isActive && (
                                                <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-white/5" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Authenticated users - Show company info or user profile, notifications, and sidebar toggle */}
                        {isActuallyAuthenticated && !isSubscriptionPage && (
                            <div className="flex items-center gap-3">
                                 {!isEmployee && (
                                     <div className="flex">
                                         <CreditBalancePill />
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
                                 <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
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
                                                         onClick={() => {
                                                             setIsSettingsOpen(false);
                                                             router.push(routes.privateroute.PROFILE);
                                                         }}
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
                                             {isEmployee && (user?.employeeId || employeeData?._id) && (
                                                 <DropdownMenuItem asChild className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors">
                                                     <Link
                                                         href={`/employee/${user?.employeeId || employeeData?._id}/settings`}
                                                         className="text-[14px] font-semibold text-[#666666] group-hover:underline flex items-center gap-2"
                                                         onClick={() => setIsSettingsOpen(false)}
                                                     >
                                                         My Settings
                                                     </Link>
                                                 </DropdownMenuItem>
                                             )}
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
                                                    Ask SafeIn (report and query)
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
                                            "rounded-lg px-2 py-1.5 sm:px-6 sm:py-2 text-[11px] sm:text-[14px] font-bold transition-all duration-300 flex items-center justify-center whitespace-nowrap",
                                            ctaBtn
                                        )}
                                        prefetch={true}
                                    >
                                        <span className="xs:hidden">Account</span>
                                        <span className="hidden xs:inline">My Account</span>
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
                                    variant="outline"
                                    asChild
                                    className={cn(
                                        "rounded-xl px-4 h-10 min-w-[100px] text-[13px] font-bold transition-all duration-300 flex items-center justify-center border-2",
                                        shouldShowWhiteNavbar 
                                            ? "border-brand/20 text-brand hover:bg-brand/5 hover:border-brand/40" 
                                            : "border-brand-strong/20 text-brand-strong hover:bg-white/10 hover:border-brand-strong/40"
                                    )}
                                >
                                    <Link href={routes.publicroute.LOGIN} prefetch={true}>
                                        Sign in
                                    </Link>
                                </Button>
                                <Link
                                    href={routes.publicroute.REGISTER}
                                    className={cn(
                                        "hidden rounded-xl px-5 h-10 min-w-[100px] text-[13px] font-bold transition-all duration-300 sm:flex items-center justify-center relative overflow-hidden group whitespace-nowrap",
                                        ctaBtn
                                    )}
                                    prefetch={true}
                                >
                                    <span className="relative z-10">Start Trial</span>
                                    <div className="animate-shimmer absolute inset-0 opacity-10"></div>
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
                    <div className="absolute top-20 left-0 right-0 border-b border-gray-200/30 bg-white/95 shadow-2xl backdrop-blur-xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-1 px-4 pt-4 pb-8">
                            {[
                                { label: "Home", href: routes.publicroute.HOME, icon: <UserCircle className="h-5 w-5" /> },
                                { label: "Features", href: "/#features", icon: <Zap className="h-5 w-5" /> },
                                { label: "Pricing", href: "/#pricing", icon: <CreditCard className="h-5 w-5" /> },
                                { label: "Blog", href: routes.publicroute.BLOG, icon: <MessageSquare className="h-5 w-5" /> },
                                { label: "Help", href: routes.publicroute.HELP, icon: <HelpCircle className="h-5 w-5" /> },
                                { label: "Contact", href: routes.publicroute.CONTACT, icon: <Mail className="h-5 w-5" /> }
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-4 rounded-xl px-4 py-4 text-base font-bold transition-all duration-200 active:scale-95 hover:bg-brand/5 group"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                                        {item.icon}
                                    </div>
                                    <span className="text-[#161718]">{item.label}</span>
                                </Link>
                            ))}
                            
                            <div className="mt-6 border-t border-gray-100 pt-6 px-2 space-y-4">
                                {!isAuthenticated || !token ? (
                                    <>
                                        <Link
                                            href={routes.publicroute.LOGIN}
                                            className="flex h-14 w-full items-center justify-center rounded-2xl bg-gray-50 text-base font-bold text-[#161718] transition-all active:scale-95"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Sign in
                                        </Link>
                                        <Link
                                            href={routes.publicroute.REGISTER}
                                            className={cn(
                                                "flex h-14 w-full items-center justify-center rounded-2xl text-base font-bold transition-all active:scale-95 shadow-lg",
                                                ctaBtn
                                            )}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Start Trial
                                        </Link>
                                    </>
                                ) : isMounted && isAuthenticated && token && !isSubscriptionPage ? (
                                    <Link
                                        href={routes.privateroute.DASHBOARD}
                                        className={cn(
                                            "flex h-14 w-full items-center justify-center rounded-2xl text-base font-bold transition-all active:scale-95 shadow-lg",
                                            ctaBtn
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Account
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
            </div>


        </nav>
    );
}
