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

    const isProtectedPage = isPrivateRoute(pathname ?? "");

    // ✅ All hooks MUST be called before any early return (Rules of Hooks)
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
        <div className="fixed bottom-[76px] md:bottom-3 left-3 z-[9999] w-fit max-w-64 animate-in slide-in-from-bottom-3 fade-in duration-300">
            <div className="relative rounded-xl border border-[#3882a5]/20 bg-white shadow-lg overflow-hidden">
                {/* Brand accent bar */}
                <div className="h-0.5 w-full bg-gradient-to-r from-[#074463] via-[#3882a5] to-[#98c7dd]" />

                <div className="px-3 py-2.5">
                    <button
                        onClick={handleDismiss}
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        aria-label="Dismiss install prompt"
                    >
                        <X className="h-3 w-3" />
                    </button>

                    <div className="flex items-center gap-2.5 pr-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/aynzo-logo.png"
                            alt="SafeIn"
                            className="h-8 w-8 shrink-0 rounded-lg object-contain"
                        />
                        <div className="min-w-0 pr-2">
                            <p className="text-[13px] font-bold text-gray-900 leading-tight">
                                Install SafeIn App
                            </p>
                        </div>
                    </div>

                    <div className="mt-2.5">
                        <Button
                            size="sm"
                            onClick={handleInstall}
                            disabled={installing}
                            className="w-full h-8 gap-2 text-xs rounded-lg bg-[#3882a5] hover:bg-[#2d6a87] text-white font-semibold px-4 shadow-sm"
                        >
                            {installing ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            Install
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
