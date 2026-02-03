"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Bell, Check, CheckCheck, Trash2, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scrollArea";
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation, useDeleteAllNotificationsMutation, Notification } from "@/store/api/notificationApi";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/common/loadingSpinner";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 50;

    const {
        data: notificationsData,
        isLoading,
        refetch,
    } = useGetNotificationsQuery({
        page: currentPage,
        limit,
    });

    // Fetch unread count separately for more reliable badge updates
    const { data: unreadCountData } = useGetUnreadCountQuery(undefined, {
        pollingInterval: 10000, // Poll every 10 seconds when modal is open
    });

    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [deleteAllNotifications] = useDeleteAllNotificationsMutation();

    const notifications = useMemo(() => notificationsData?.notifications || [], [notificationsData?.notifications]);
    // Use unreadCount from dedicated query if available, otherwise fallback to notificationsData
    const unreadCount = useMemo(() => unreadCountData?.unreadCount ?? notificationsData?.unreadCount ?? 0, [unreadCountData?.unreadCount, notificationsData?.unreadCount]);
    const pagination = useMemo(() => notificationsData?.pagination, [notificationsData?.pagination]);

    // Reset to page 1 when modal opens and prevent body scroll
    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            refetch();
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
        } else {
            // Restore body scroll when modal is closed
            document.body.style.overflow = "unset";
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, refetch]);

    const handleMarkAsRead = useCallback(async (id: string) => {
        try {
            await markAsRead(id).unwrap();
            // Refetch notifications to update unreadCount immediately
            await refetch();
        } catch (error) {
            // Error handled silently - user can retry
        }
    }, [markAsRead, refetch]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead().unwrap();
            // Refetch notifications to update unreadCount immediately
            await refetch();
        } catch (error) {
            // Error handled silently - user can retry
        }
    }, [markAllAsRead, refetch]);

    const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNotification(id).unwrap();
        } catch (error) {
            // Error handled silently - user can retry
        }
    }, [deleteNotification]);

    const handleClearAll = useCallback(async () => {
        try {
            await deleteAllNotifications().unwrap();
        } catch (error) {
            // Error handled silently - user can retry
        }
    }, [deleteAllNotifications]);

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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - Start below navbar (navbar height is typically 80px/h-20) */}
            <div
                className="fixed inset-0 z-[100] bg-black/50 transition-opacity cursor-pointer"
                style={{ top: '80px' }}
                onClick={onClose}
            />

            {/* Modal - Slide from right, start below navbar */}
            <div
                className={cn(
                    "fixed right-0 z-[100] w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                style={{ 
                    top: '80px',
                    height: 'calc(100vh - 80px)',
                    maxHeight: 'calc(100vh - 80px)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-gradient-to-r from-gray-50 to-white p-4">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                                Mark all read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Notifications list - Scrollable */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <LoadingSpinner />
                        </div>
                    ) : notifications.length === 0 ? (
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
                                    key={notification._id}
                                    className={cn(
                                        "flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-gray-50",
                                        !notification.read && "bg-blue-50/50",
                                    )}
                                    onClick={() => {
                                        if (!notification.read) {
                                            handleMarkAsRead(notification._id);
                                        }
                                    }}
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
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-shrink-0 items-center gap-1">
                                        {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                                            onClick={(e) => handleDelete(notification._id, e)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Footer with Pagination */}
                {notifications.length > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-gray-500 hover:text-red-500"
                                    onClick={handleClearAll}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Clear all
                                </Button>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={!pagination.hasPrevPage || isLoading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                        disabled={!pagination.hasNextPage || isLoading}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

