"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdownMenu";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    Notification,
} from "@/store/slices/notificationSlice";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { routes } from "@/utils/routes";

interface NotificationBellProps {
    className?: string;
    iconClassName?: string;
}

export function NotificationBell({ className, iconClassName }: NotificationBellProps) {
    const dispatch = useAppDispatch();
    const { notifications, unreadCount } = useAppSelector((state) => state.notification);
    const [isOpen, setIsOpen] = useState(false);

    const handleMarkAsRead = (id: string) => {
        dispatch(markAsRead(id));
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const handleRemove = (id: string) => {
        dispatch(removeNotification(id));
    };

    const handleClearAll = () => {
        dispatch(clearNotifications());
    };

    const getNotificationIcon = (type: Notification["type"]) => {
        switch (type) {
            case "appointment_approved":
                return <Check className="h-4 w-4 text-green-500" />;
            case "appointment_rejected":
                return <X className="h-4 w-4 text-red-500" />;
            case "appointment_created":
                return <Calendar className="h-4 w-4 text-yellow-600" />;
            case "appointment_deleted":
                return <Calendar className="h-4 w-4 text-orange-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-105",
                        className,
                    )}
                >
                    <Bell className={cn("h-5 w-5", iconClassName)} />

                    {/* Notification badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        </span>
                    )}

                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 border-gray-200/50 p-0 shadow-xl sm:w-96" align="end" forceMount>
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-gradient-to-r from-gray-50 to-white p-4">
                    <div className="flex items-center gap-2">
                        <Bell className="text-brand h-5 w-5" />
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-brand hover:text-brand-strong h-8 px-2 text-xs"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications list */}
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-900">No notifications yet</p>
                            <p className="mt-1 text-sm text-gray-500">You&apos;ll see appointment updates here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-gray-50",
                                        !notification.read && "bg-blue-50/50",
                                    )}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                >
                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                                            notification.type === "appointment_approved" && "bg-green-100",
                                            notification.type === "appointment_rejected" && "bg-red-100",
                                            notification.type === "appointment_created" && "bg-yellow-100",
                                            notification.type === "appointment_deleted" && "bg-orange-100",
                                            notification.type === "general" && "bg-gray-100",
                                        )}
                                    >
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={cn(
                                                "text-sm",
                                                !notification.read
                                                    ? "font-semibold text-gray-900"
                                                    : "font-medium text-gray-700",
                                            )}
                                        >
                                            {notification.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {formatTime(notification.timestamp)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-shrink-0 items-center gap-1">
                                        {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(notification.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="flex items-center justify-between p-2">
                            <Link
                                href={routes.privateroute.NOTIFICATIONS}
                                className="text-brand hover:text-brand-strong rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-50"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-gray-500 hover:text-red-500"
                                onClick={handleClearAll}
                            >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Clear all
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
