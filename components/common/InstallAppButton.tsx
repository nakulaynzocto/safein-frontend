"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Monitor, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InstallAppButtonProps {
    variant?: "banner" | "button" | "hero";
    className?: string;
}

export function InstallAppButton({ variant = "button", className }: InstallAppButtonProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [justInstalled, setJustInstalled] = useState(false);
    const [platform, setPlatform] = useState<"android" | "ios" | "desktop" | null>(null);

    useEffect(() => {
        // Detect platform
        const ua = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const isAndroid = /android/.test(ua);
        if (isIOS) setPlatform("ios");
        else if (isAndroid) setPlatform("android");
        else setPlatform("desktop");

        // Check if already installed
        if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (variant === "banner") {
                const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
                if (!dismissed) setShowBanner(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowBanner(false);
        });

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, [variant]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setIsInstalling(true);
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setJustInstalled(true);
                setIsInstalled(true);
                setShowBanner(false);
                setTimeout(() => setJustInstalled(false), 3000);
            }
        } finally {
            setIsInstalling(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
        sessionStorage.setItem("pwa-banner-dismissed", "1");
    };

    if (isInstalled && !justInstalled) return null;

    /* ─── BANNER variant (only if needed later, currently hidden from usage) ─── */
    if (variant === "banner") {
        if (!showBanner && !justInstalled) return null;
        return (
            <div className={cn("fixed bottom-4 inset-x-4 z-[9999] sm:bottom-0 sm:inset-x-0 sm:border-t border-border/60 bg-white/95 dark:bg-[#0f1923]/95 backdrop-blur-md shadow-2xl rounded-2xl sm:rounded-none animate-in slide-in-from-bottom duration-300", className)}>
                <div className="max-w-4xl mx-auto flex items-center gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
                    <div className="hidden xs:flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#074463] shadow-lg shadow-[#074463]/20">
                        <img src="/icon-192.png" alt="SafeIn" className="h-6 w-6 rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] sm:text-sm text-foreground leading-tight">Install SafeIn App</p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate uppercase tracking-tighter">Fast & Offline Access</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button size="sm" className="h-8 px-3 rounded-lg bg-[#074463] text-white text-[12px] font-bold" onClick={handleInstall} disabled={isInstalling}>
                             {isInstalling ? "..." : "Install"}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleDismiss}><X className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── HERO variant (Responsive & Compact) ─── */
    if (variant === "hero") {
        // Let it show even if prompt is not ready, as a feature showcase
        // if (!deferredPrompt && platform !== "ios") return null; 
        return (
            <div className={cn("relative overflow-hidden rounded-2xl border border-[#3882a5]/30 bg-white/5 backdrop-blur-md p-3.5 sm:p-5 lg:p-6", className)}>
                <div className="flex items-center xs:items-start gap-3 sm:gap-4">
                    {/* Compact Icon for mobile */}
                    <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#074463] shadow-lg shadow-[#074463]/20">
                        {platform === "desktop" ? <Monitor className="h-5 w-5 sm:h-7 sm:w-7 text-white" /> : <Smartphone className="h-5 w-5 sm:h-7 sm:w-7 text-white" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-white text-[13px] sm:text-base lg:text-lg">
                                    {isInstalled ? "SafeIn App Installed" : (platform === "desktop" ? "SafeIn for Desktop" : "Install SafeIn App")}
                                </h3>
                                <p className="hidden xs:block text-[11px] sm:text-sm text-gray-300 mt-0.5 leading-tight sm:leading-relaxed max-w-sm">
                                    {isInstalled 
                                        ? "You're all set! Open from your home screen." 
                                        : (platform === "ios" ? 'Share → Add to Home Screen' : "Fast, offline-ready check-in experience.")}
                                </p>
                            </div>

                            {!isInstalled && (
                                <Button
                                    className="h-8 sm:h-11 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-white text-[#074463] hover:bg-gray-100 hover:text-black text-[11px] sm:text-[13px] font-bold shadow-md transition-all active:scale-95 shrink-0"
                                    onClick={handleInstall}
                                    disabled={isInstalling || (!deferredPrompt && platform !== "ios")}
                                >
                                    {isInstalling ? (
                                        <div className="h-3 w-3 rounded-full border-2 border-[#074463]/30 border-t-[#074463] animate-spin" />
                                    ) : justInstalled ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <Download className="h-3.5 w-3.5" />
                                            {!deferredPrompt && platform !== "ios" ? "Detecting..." : (platform === "ios" ? "Guide" : "Install")}
                                        </span>
                                    )}
                                </Button>
                            )}
                            
                            {isInstalled && (
                                <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase">Installed</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
