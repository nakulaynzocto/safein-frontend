"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { requestNotificationPermission } from "@/lib/firebaseMessaging";
import { useUpdateFCMTokenMutation } from "@/store/api/authApi";
import { messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { isPublicActionRoute } from "@/utils/routes";

export function NotificationHandler() {
    const pathname = usePathname();
    const isPublicAction = isPublicActionRoute(pathname || "");
    const { user, isAuthenticated } = useSelector((state: any) => state.auth);
    const [updateFCMToken] = useUpdateFCMTokenMutation();
    const hasRequested = useRef(false);

    useEffect(() => {
        if (isAuthenticated && user?._id && !hasRequested.current) {
            const handleToken = async () => {
                const token = await requestNotificationPermission();
                if (token) {
                    try {
                        await updateFCMToken({ fcmToken: token }).unwrap();
                        hasRequested.current = true;
                    } catch (err) {
                        console.error("FCM update failed:", err);
                    }
                }
            };
            handleToken();
        }
    }, [isAuthenticated, user?._id, updateFCMToken]);

    // Handle foreground messages
    useEffect(() => {
        if (!messaging) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            if (isPublicAction) return;

            // 1. Play notification sound
            const audio = new Audio("/sounds/notification.mp3");
            audio.play().catch(() => {
                /* Browser blocked autoplay, ignore */
            });

            // 2. Show a toast notification (same id as useSocket when appointmentId present → no duplicate UI)
            if (payload.notification?.title) {
                const data = payload.data as Record<string, string> | undefined;
                const type = data?.type;
                const apptId = data?.appointmentId;
                const dedupeId =
                    type === "appointment_created" && apptId
                        ? `appointment-created-${apptId}`
                        : type && apptId && (type === "appointment_approved" || type === "appointment_rejected")
                          ? `appointment-status-${apptId}-${type}`
                          : undefined;

                toast.success(payload.notification.title, {
                    description: payload.notification.body,
                    duration: 5000,
                    ...(dedupeId ? { id: dedupeId } : {}),
                });
            }
        });

        return () => unsubscribe();
    }, [isPublicAction]);

    return null;
}
