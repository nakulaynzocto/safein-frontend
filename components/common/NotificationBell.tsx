"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUnreadCountQuery } from "@/store/api/notificationApi";
import { NotificationModal } from "./NotificationModal";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
    className?: string;
    iconClassName?: string;
}

export function NotificationBell({ className, iconClassName }: NotificationBellProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch unread count for badge
    const { data: unreadCountData, isLoading: isLoadingCount } = useGetUnreadCountQuery();

    const unreadCount = unreadCountData?.unreadCount || 0;

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-105",
                    className,
                )}
                onClick={() => setIsModalOpen(true)}
            >
                <Bell className={cn("h-5 w-5", iconClassName)} />

                {/* Notification badge */}
                {!isLoadingCount && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                        <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-gray-950">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    </span>
                )}

                <span className="sr-only">Notifications</span>
            </Button>

            <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
