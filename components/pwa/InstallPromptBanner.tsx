"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPrivateRoute } from "@/utils/routes";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    prompt(): Promise<void>;
}

const DISMISSED_KEY = "safein_pwa_install_dismissed";

/**
 * Shows a polished "Add to Home Screen" banner when the browser fires
 * the beforeinstallprompt event (Chrome/Edge/Android on mobile/desktop).
 */
export function InstallPromptBanner() {
    const pathname = usePathname();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [show, setShow] = useState(false);
    const [installing, setInstalling] = useState(false);

    // Restrict visibility to only Home, Features, Pricing, Contact, and Help pages
    const allowedPublicPages = ["/", "/features", "/pricing", "/contact", "/help"];
    const isAllowedPage = pathname ? allowedPublicPages.includes(pathname) : false;
    const isProtectedPage = !isAllowedPage || isPrivateRoute(pathname ?? "");

    // ✅ All hooks  MUST be called before any early return (Rules of Hooks)
    useEffect(() => {
        // Don't attach listener on protected/private pages
        if (isProtectedPage) return;
        // Don't show if user already dismissed in this session
        if (sessionStorage.getItem(DISMISSED_KEY)) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShow(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, [isProtectedPage]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setInstalling(true);
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setShow(false);
        }
        setDeferredPrompt(null);
        setInstalling(false);
    };

    const handleDismiss = () => {
        setShow(false);
        sessionStorage.setItem(DISMISSED_KEY, "1");
    };

    // Early return AFTER all hooks — React Rules of Hooks compliant
    if (isProtectedPage || !show) return null;

    return (
        <div className="fixed bottom-[76px] md:bottom-3 left-3 z-[9999] animate-in slide-in-from-bottom-3 fade-in duration-300">
            <div className="relative flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2 pr-10 shadow-xl ring-1 ring-black/5">
                {/* Logo */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1.5">
                    <img
                        src="/aynzo-logo.png"
                        alt="Aynzo"
                        className="h-full w-full object-contain"
                    />
                </div>

                {/* Install Button */}
                <Button
                    size="sm"
                    onClick={handleInstall}
                    disabled={installing}
                    className="h-9 rounded-xl bg-[#3882a5] px-4 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#2d6a87] active:scale-95"
                >
                    {installing ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        "Install"
                    )}
                </Button>

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Dismiss install prompt"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
