"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/store/hooks";
import { baseApi } from "@/store/api/baseApi";
import { notificationApi } from "@/store/api/notificationApi";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { routes, isPublicActionRoute } from "@/utils/routes";

export enum SocketEvents {
    CONNECTION = "connection",
    DISCONNECT = "disconnect",
    JOIN_USER_ROOM = "join_user_room",
    LEAVE_USER_ROOM = "leave_user_room",
    APPOINTMENT_UPDATED = "appointment_updated",
    APPOINTMENT_CREATED = "appointment_created",
    APPOINTMENT_DELETED = "appointment_deleted",
    APPOINTMENT_STATUS_CHANGED = "appointment_status_changed",
    NEW_NOTIFICATION = "new_notification",

    // Chat Events
    JOIN_CHAT_ROOM = "join_chat_room",
    LEAVE_CHAT_ROOM = "leave_chat_room",
    SEND_MESSAGE = "send_message",
    RECEIVE_MESSAGE = "receive_message",
    TYPING = "typing",
    STOP_TYPING = "stop_typing",
    READ_RECEIPT = "read_receipt",
    USER_ONLINE = "user_online",
    USER_OFFLINE = "user_offline",
    GET_ONLINE_USERS = "get_online_users",
}

interface UseSocketOptions {
    onAppointmentUpdated?: (data: any) => void;
    onAppointmentStatusChanged?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: (reason: string) => void;
    showToasts?: boolean;
}

type NotificationType = "appointment_created" | "appointment_approved" | "appointment_rejected";

interface NotificationConfig {
    type: NotificationType;
    title: string;
    message: string;
    toastType: "success" | "error" | "info" | "warning";
}

// Helper: Get socket URL from environment
const getSocketUrl = (): string | null => {
    if (process.env.NEXT_PUBLIC_DISABLE_SOCKET === "true") {
        return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010/api/v1";
    if (!apiUrl || apiUrl === "undefined") {
        return null;
    }

    return apiUrl.replace("/api/v1", "");
};

/** Normalize Mongo/socket ids so strict string checks don't skip handlers */
function normalizeAppointmentIdFromPayload(payload: any): string {
    const raw = payload?.appointment?._id ?? payload?.appointment?.id ?? payload?.appointmentId;
    if (raw == null || raw === "") return "";
    if (typeof raw === "string") return raw.trim();
    if (typeof raw === "object" && raw !== null && "$oid" in (raw as object)) {
        return String((raw as { $oid: string }).$oid).trim();
    }
    return String(raw).trim();
}

// Helper: Extract names from payload (backend always provides these)
const extractNames = (payload: any): { employeeName: string; visitorName: string } => {
    if (payload?.employeeName && payload?.visitorName) {
        return {
            employeeName: payload.employeeName,
            visitorName: payload.visitorName,
        };
    }

    // Fallback (shouldn't happen in normal flow)
    return {
        employeeName:
            payload?.appointment?.employeeId?.name || payload?.appointment?.employee?.name || "Unknown Employee",
        visitorName: payload?.appointment?.visitorId?.name || payload?.appointment?.visitor?.name || "Unknown Visitor",
    };
};

// Helper: Play Voice Alert
const playVoiceAlert = (text: string = "SafeIn") => {
    try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        // Silently handle error
    }
};

// Helper: Get notification config based on status
const getNotificationConfig = (status: string, employeeName: string, visitorName: string, isSpecialVisitor: boolean = false): NotificationConfig => {
    const configs: Record<string, NotificationConfig> = {
        pending: {
            type: "appointment_created",
            title: "New Appointment Request 📅",
            message: `${visitorName} has requested an appointment with ${employeeName}.`,
            toastType: "success",
        },
        approved: {
            type: "appointment_approved",
            title: isSpecialVisitor ? "Special Visitor Scheduled 🌟" : "Appointment Approved! ✅",
            message: isSpecialVisitor
                ? `Special visitor ${visitorName} has been scheduled with ${employeeName}.`
                : `${employeeName} has approved the appointment for ${visitorName}.`,
            toastType: isSpecialVisitor ? "info" : "success",
        },
        rejected: {
            type: "appointment_rejected",
            title: "Appointment Rejected ❌",
            message: `${employeeName} has rejected the appointment for ${visitorName}.`,
            toastType: "error",
        },
        completed: {
            type: "appointment_created",
            title: "Appointment Completed ✓",
            message: `Appointment for ${visitorName} with ${employeeName} has been completed.`,
            toastType: "info",
        },
    };

    return configs[status] || configs.pending;
};

// Helper: Show toast notification (optional id dedupes socket + FCM double-fire)
const showToast = (config: NotificationConfig, onClick?: () => void, toastId?: string) => {
    const toastOptions = {
        description: config.message,
        duration: 5000,
        onClick: onClick,
        ...(toastId ? { id: toastId } : {}),
    };

    switch (config.toastType) {
        case "success":
            toast.success(config.title, toastOptions);
            break;
        case "error":
            toast.error(config.title, toastOptions);
            break;
        case "warning":
            toast.warning(config.title, toastOptions);
            break;
        case "info":
            toast.info(config.title, toastOptions);
            break;
    }
};


export function useSocket(options: UseSocketOptions = {}) {
    const { onAppointmentUpdated, onAppointmentStatusChanged, onConnect, onDisconnect, showToasts = true } = options;

    const router = useRouter();
    const socketRef = useRef<Socket | null>(null);
    const dispatch = useDispatch();
    const { token, user } = useAppSelector((state) => state.auth);
    const resolvedUserId = user?.id || (user as any)?._id;
    const [isConnected, setIsConnected] = useState(false);
    const isConnectedRef = useRef(false);
    const isPublicActionContext = useCallback(() => {
        if (typeof window === "undefined") return false;
        return isPublicActionRoute(window.location.pathname || "");
    }, []);

    const invalidateAppointments = useCallback(() => {
        dispatch(
            baseApi.util.invalidateTags([
                "Appointment",
                { type: "Appointment", id: "LIST" },
                { type: "Appointment", id: "STATS" },
            ]),
        );
    }, [dispatch]);

    const invalidateNotifications = useCallback(() => {
        dispatch(
            notificationApi.util.invalidateTags([
                { type: "Notification", id: "LIST" },
                { type: "Notification", id: "UNREAD_COUNT" },
            ]),
        );
    }, [dispatch]);

    // Handle appointment status change
    const handleAppointmentStatusChange = useCallback(
        (data: any) => {
            const { payload } = data;
            const appointmentId = normalizeAppointmentIdFromPayload(payload);

            if (!appointmentId) {
                invalidateAppointments();
                onAppointmentStatusChanged?.(data);
                return;
            }

            const { employeeName, visitorName } = extractNames(payload);
            const status = payload?.status;

            const isAdmin = user?.role === 'admin' || (user as any)?.roles?.includes('admin');
            const isEmployee = user?.role === 'employee' || (user as any)?.roles?.includes('employee');

            if (status === "approved" || status === "rejected") {
                const config = getNotificationConfig(status, employeeName, visitorName);
                invalidateNotifications();

                if (showToasts) {
                    if (isPublicActionContext()) {
                        invalidateAppointments();
                        onAppointmentStatusChanged?.(data);
                        return;
                    }
                    // ADMIN gets all status change notifications with sound
                    // EMPLOYEE does NOT get sound/toast for status changes (they usually perform them)
                    if (isAdmin) {
                        showToast(
                            config,
                            () => {
                                router.push(routes.privateroute.APPOINTMENTLIST);
                            },
                            `appointment-status-${appointmentId}-${status}`,
                        );
                        playVoiceAlert();
                    }
                }
            }

            invalidateAppointments();
            onAppointmentStatusChanged?.(data);
        },
        [showToasts, invalidateAppointments, invalidateNotifications, onAppointmentStatusChanged, user, isPublicActionContext, router],
    );

    // Handle appointment created
    const handleAppointmentCreated = useCallback(
        (data: any) => {
            const { payload } = data;
            const appointmentId = normalizeAppointmentIdFromPayload(payload);
            const status = payload?.appointment?.status || payload?.status || "pending";

            if (!appointmentId) {
                invalidateAppointments();
                return;
            }

            const { employeeName, visitorName } = extractNames(payload);

            const isAdmin = user?.role === 'admin' || (user as any)?.roles?.includes('admin');
            const isEmployee = user?.role === 'employee' || (user as any)?.roles?.includes('employee');

            // Check if this is a special visitor booking (created directly in approved status)
            const isSpecialVisitor = status === "approved";
            const config = getNotificationConfig(status, employeeName, visitorName, isSpecialVisitor);

            invalidateNotifications();

            if (showToasts) {
                if (isPublicActionContext()) {
                    invalidateAppointments();
                    return;
                }
                // ADMIN gets all creations with sound
                // EMPLOYEE ONLY gets sound for 'pending' (New Request)
                if (isAdmin || (isEmployee && status === 'pending')) {
                    showToast(
                        config,
                        () => {
                            if (isSpecialVisitor) {
                                router.push(`${routes.privateroute.APPOINTMENT_LINKS}?type=special`);
                            } else {
                                router.push(routes.privateroute.APPOINTMENTLIST);
                            }
                        },
                        `appointment-created-${appointmentId}`,
                    );
                    playVoiceAlert();
                }
            }

            invalidateAppointments();
        },
        [showToasts, invalidateAppointments, invalidateNotifications, user, isPublicActionContext, router],
    );

    // Handle appointment updated
    const handleAppointmentUpdated = useCallback(
        (data: any) => {
            const { payload } = data;
            const status = payload?.status;
            const appointmentId = normalizeAppointmentIdFromPayload(payload);

            // If it's a critical status change, show toast for admins who might not be the creator
            const isAdmin = user?.role === 'admin' || (user as any)?.roles?.includes('admin');
            
            if (isAdmin && (status === "approved" || status === "rejected")) {
                const { employeeName, visitorName } = extractNames(payload);
                const config = getNotificationConfig(status, employeeName, visitorName);
                
                if (showToasts && !isPublicActionContext()) {
                    showToast(
                        config,
                        () => router.push(routes.privateroute.APPOINTMENTLIST),
                        `global-update-${appointmentId}-${status}`
                    );
                    playVoiceAlert();
                }
            }

            invalidateAppointments();
            invalidateNotifications();
            onAppointmentUpdated?.(data);
        },
        [invalidateAppointments, invalidateNotifications, onAppointmentUpdated, user, showToasts, isPublicActionContext, router],
    );

    // Handle appointment deleted
    const handleAppointmentDeleted = useCallback(() => {
        invalidateAppointments();
    }, [invalidateAppointments]);

    // Handle new notification - Only invalidate, no toast (prevents duplicates)
    // NOTE: Toast notifications are handled by specific event handlers:
    // - handleAppointmentStatusChange for approve/reject
    // - handleAppointmentCreated for new appointments
    const handleNewNotification = useCallback(
        (data: any) => {
            const { payload } = data;

            // Handle special booking notifications (which don't emit specific appointment events)
            if (payload?.type?.startsWith("special_booking_")) {
                const config: NotificationConfig = {
                    type: "appointment_created",
                    title: payload.title || "Special Visitor Request",
                    message: payload.message || "",
                    toastType: "info",
                };

                if (showToasts) {
                    if (isPublicActionContext()) {
                        invalidateNotifications();
                        return;
                    }
                    showToast(config, () => {
                        router.push(`${routes.privateroute.APPOINTMENT_LINKS}?type=special`);
                    });
                    playVoiceAlert();
                }
            }

            // Only invalidate notifications to refresh inbox count and list
            invalidateNotifications();
        },
        [invalidateNotifications, router, showToasts, isPublicActionContext],
    );

    // Fix: Use useRef for stable callbacks to prevent unnecessary re-renders
    const onConnectRef = useRef(onConnect);
    const onDisconnectRef = useRef(onDisconnect);

    useEffect(() => {
        onConnectRef.current = onConnect;
        onDisconnectRef.current = onDisconnect;
    }, [onConnect, onDisconnect]);

    const connect = useCallback(() => {
        if (socketRef.current?.connected || !token) return;

        const socketUrl = getSocketUrl();
        if (!socketUrl) return;

        // Clean up existing socket if any
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
        }

        socketRef.current = io(socketUrl, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        const socket = socketRef.current;

        // Store handlers for cleanup
        const connectHandler = () => {
            isConnectedRef.current = true;
            setIsConnected(true);
            if (resolvedUserId) {
                socket.emit(SocketEvents.JOIN_USER_ROOM, resolvedUserId);
            }
            onConnectRef.current?.();
        };

        const disconnectHandler = (reason: string) => {
            isConnectedRef.current = false;
            setIsConnected(false);
            onDisconnectRef.current?.(reason);
        };

        const connectErrorHandler = () => {
            // Socket is optional for app functionality
        };

        socket.on("connect", connectHandler);
        socket.on("disconnect", disconnectHandler);
        socket.on("connect_error", connectErrorHandler);
        socket.on(SocketEvents.APPOINTMENT_STATUS_CHANGED, handleAppointmentStatusChange);
        socket.on(SocketEvents.APPOINTMENT_CREATED, handleAppointmentCreated);
        socket.on(SocketEvents.APPOINTMENT_UPDATED, handleAppointmentUpdated);
        socket.on(SocketEvents.APPOINTMENT_DELETED, handleAppointmentDeleted);
        socket.on(SocketEvents.NEW_NOTIFICATION, handleNewNotification);
    }, [
        token,
        resolvedUserId,
        showToasts,
        handleAppointmentStatusChange,
        handleAppointmentCreated,
        handleAppointmentUpdated,
        handleAppointmentDeleted,
        handleNewNotification,
    ]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            // Remove all event listeners before disconnecting
            socketRef.current.removeAllListeners();

            if (resolvedUserId) {
                socketRef.current.emit(SocketEvents.LEAVE_USER_ROOM, resolvedUserId);
            }
            socketRef.current.disconnect();
            socketRef.current = null;
            isConnectedRef.current = false;
        }
    }, [resolvedUserId, showToasts]);

    // Join user room when socket is connected but user id was not ready on first connect (fixes missing real-time toasts)
    useEffect(() => {
        if (typeof window === "undefined" || !token || !resolvedUserId) return;
        const s = socketRef.current;
        if (!s?.connected) return;
        s.emit(SocketEvents.JOIN_USER_ROOM, resolvedUserId);
    }, [token, resolvedUserId, isConnected]);

    // Fix: Properly handle socket connection lifecycle with stable references
    useEffect(() => {
        if (typeof window === "undefined" || !token) {
            disconnect();
            return;
        }

        const timeoutId = setTimeout(() => {
            connect();
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Only depend on token, connect/disconnect are stable

    return {
        isConnected: isConnected,
        socket: socketRef.current,
        connect,
        disconnect,
        invalidateAppointments,
    };
}

export function useAppointmentSocket() {
    return useSocket({ showToasts: true });
}
