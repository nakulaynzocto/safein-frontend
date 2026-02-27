import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Requests notification permission from the user and returns the FCM token.
 * Returns null if permission is denied or an error occurs.
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    if (typeof window === "undefined" || !messaging) return null;

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
            });

            if (token) {
                return token;
            }
        }
        return null;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error("FCM Token Error:", error);
        }
        return null;
    }
};
