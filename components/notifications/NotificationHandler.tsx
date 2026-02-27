"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { requestNotificationPermission } from "@/lib/firebaseMessaging";
import { useUpdateFCMTokenMutation } from "@/store/api/authApi";
import { messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import { toast } from "sonner";

export function NotificationHandler() {
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
            // 1. Play notification sound
            const audio = new Audio("/sounds/notification.mp3");
            audio.play().catch(() => {
                /* Browser blocked autoplay, ignore */
            });

            // 2. Show a toast notification
            if (payload.notification?.title) {
                toast.success(payload.notification.title, {
                    description: payload.notification.body,
                    duration: 5000,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return null;
}
