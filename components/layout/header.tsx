"use client";

import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { CreditBalancePill } from "@/components/dashboard/CreditBalancePill";
import { NotificationBell } from "@/components/common/NotificationBell";
import { MessageSquare, Settings, Sparkles, UserCircle, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, setUser } from "@/store/slices/authSlice";
import { toggleAssistant } from "@/store/slices/uiSlice";
import { useLogoutMutation, useGetProfileQuery } from "@/store/api/authApi";
import { useGetChatsQuery } from "@/store/api/chatApi";
import { useGetEmployeeQuery } from "@/store/api/employeeApi";
import { routes } from "@/utils/routes";
import { isEmployee as checkIsEmployee, clearAuthData, formatName } from "@/utils/helpers";
import { UpgradePlanModal } from "@/components/common/upgradePlanModal";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface HeaderProps {
    shouldShowWhiteNavbar?: boolean;
}

export function Header({ shouldShowWhiteNavbar = true }: HeaderProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user: authUser } = useAppSelector((state) => state.auth);
    const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const handleOpenUpgradeModal = useCallback(() => {
        setIsSettingsOpen(false);
        setIsUpgradeModalOpen(true);
    }, []);

    const handleCloseUpgradeModal = useCallback(() => {
        setIsUpgradeModalOpen(false);
    }, []);

    const {
        isAuthenticated,
        token,
        activeSubscriptionData,
        isTrialingSubscription,
        hasActiveSubscription,
    } = useAuthSubscription();

    const { data: profileUser } = useGetProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const user = profileUser || authUser;
    const isEmployee = checkIsEmployee(user);

    // Fetch employee data if applicable
    const { data: employeeData } = useGetEmployeeQuery(user?.employeeId || "", {
        skip: !isEmployee || !user?.employeeId,
    });

    const employeeName = isEmployee
        ? formatName(employeeData?.name || user?.name || "") || user?.email || "Employee"
        : null;

    // Fetch Chats for Badge Count
    const { data: chats } = useGetChatsQuery(undefined, { skip: !user });

    // Calculate total unread messages
    const unreadMessagesCount = (chats || []).reduce((acc: number, chat: any) => {
        const userId = user?.id || (user as any)?._id;
        return acc + (chat.unreadCounts?.[userId] || 0);
    }, 0);

    const handleLogout = useCallback(async () => {
        try {
            dispatch(logout());
            clearAuthData();
            logoutMutation().unwrap().catch(() => { });
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

    // Visibility Logic for Wallet
    // Directly linked to subscriptionData?.data?.modules as per user requirements
    const modules = activeSubscriptionData?.modules;
    const isAnyMessagingEnabled = 
        modules?.enableSms || 
        modules?.enableWhatsApp || 
        modules?.enableVoice;

    if (!isAuthenticated || !token) return null;

    return (
        <div className="flex items-center gap-3">
            {/* Wallet - Visibility based on Billing Plan modules */}
            {!isEmployee && isAnyMessagingEnabled && (
                <div className="flex">
                    <CreditBalancePill />
                </div>
            )}

            {/* Messages Icon */}
            {modules?.enableChat && (
                <Link
                    href={routes.privateroute.MESSAGES}
                    className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                        shouldShowWhiteNavbar ? "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50" : "text-white hover:bg-white/10 border border-transparent"
                    )}
                    title="Messages"
                >
                    <MessageSquare className="h-5 w-5" />
                    {unreadMessagesCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white shadow-sm">
                            {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                        </span>
                    )}
                </Link>
            )}

            {/* Notification Bell */}
            <NotificationBell
                className={shouldShowWhiteNavbar ? "bg-white border border-gray-200 hover:bg-gray-50" : "hover:bg-white/10 border border-transparent"}
                iconClassName={shouldShowWhiteNavbar ? "text-gray-700" : "text-white"}
            />

            {/* Settings Dropdown */}
            <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full transition-colors",
                            shouldShowWhiteNavbar
                                ? "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                                : "text-white hover:bg-white/10 border border-transparent"
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

                    <div className="py-2">
                        <div className="px-4 py-1.5">
                            <p className="text-sm font-bold text-[#161718]">Account</p>
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
                        <DropdownMenuItem asChild className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors">
                            <Link href={routes.publicroute.HELP} className="text-[14px] font-semibold text-[#666666] group-hover:underline">
                                Help
                            </Link>
                        </DropdownMenuItem>
                    </div>

                    <div className="py-2 border-t border-border">
                        <p className="px-4 py-1.5 text-sm font-bold text-[#161718]">Manage</p>
                        <DropdownMenuItem 
                            onClick={() => dispatch(toggleAssistant())}
                            className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors"
                        >
                            <span className="text-[14px] font-semibold text-[#666666] group-hover:underline flex items-center gap-2">
                                Ask SafeIn (report and query)
                                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                            </span>
                        </DropdownMenuItem>
                        {!isEmployee && modules?.enableSpotPass && (
                            <DropdownMenuItem asChild className="px-4 py-1.5 focus:bg-[#f3f6f8] focus:text-[#0a66c2] cursor-pointer group transition-colors">
                                <Link href={routes.privateroute.SPOT_PASS} className="text-[14px] font-semibold text-[#666666] group-hover:underline">
                                    Spot Pass
                                </Link>
                            </DropdownMenuItem>
                        )}
                    </div>

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

            {/* Upgrade Modal */}
            <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={handleCloseUpgradeModal} />
        </div>
    );
}
