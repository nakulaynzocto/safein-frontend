"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker silently.
 * Rendered once at the root layout level.
 *
 * Version is passed as a URL query param (?v=X.X) so the browser
 * automatically detects a new SW whenever NEXT_PUBLIC_APP_VERSION changes.
 */
export function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("serviceWorker" in navigator) ||
            process.env.NODE_ENV !== "production"
        ) {
            return;
        }

        // Pass version as query param — browser treats a new URL as a new SW file
        const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0";
        const swUrl = `/sw.js?v=${version}`;

        navigator.serviceWorker
            .register(swUrl, { scope: "/" })
            .then((reg) => {
                console.log(`[SafeIn PWA] Service Worker v${version} registered:`, reg.scope);

                // Auto-update on new SW available
                reg.addEventListener("updatefound", () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener("statechange", () => {
                        if (
                            newWorker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {
                            console.log(`[SafeIn PWA] New version v${version} available – activating now.`);
                            // Tell new SW to skip waiting and take control immediately
                            newWorker.postMessage({ type: "SKIP_WAITING" });
                        }
                    });
                });
            })
            .catch((err) => console.warn("[SafeIn PWA] SW registration failed:", err));
    }, []);

    return null;
}
