"use client";
import { PageSkeleton } from "@/components/common/pageSkeleton";

import { type ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { MobileBottomNav } from "./mobileBottomNav";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { useAppointmentSocket } from "@/hooks/useSocket";
import { routes } from "@/utils/routes";
import { clearAuthData } from "@/utils/helpers";
import { Banner } from "@/components/common/banner";
import { useChatNotifications } from "@/hooks/useChatNotifications";

interface ProtectedLayoutProps {
    children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
    // Use centralized hook for all auth and subscription logic
    const {
        isClient,
        isInitialized,
        isAuthenticated,
        token,
        shouldShowSidebar,
        shouldShowContent,
        isLoading,
        isCurrentRoutePrivate,
        isSubscriptionPage,
        hasActiveSubscription,
        shouldShowPrivateNavbar,
        expiryWarning,
    } = useAuthSubscription();

    // Show navbar for all authenticated users
    const shouldShowNavbar = isClient && !isLoading && shouldShowPrivateNavbar;

    // 🔌 Initialize WebSocket for real-time appointment updates
    // Auto-connects when user is authenticated and auto-disconnects on logout
    useAppointmentSocket();

    // 🔔 Listen for Chat Notifications globally
    useChatNotifications();

    // State for visual viewport height (to handle mobile keyboard)
    const [viewportHeight, setViewportHeight] = useState<string>("100dvh");

    useEffect(() => {
        if (!window.visualViewport) return;

        const handleResize = () => {
            // Use visualViewport height to precisely fit the screen when keyboard is open
            if (window.visualViewport) {
                setViewportHeight(`${window.visualViewport.height}px`);
            }
        };

        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', handleResize);
        
        // Initial set
        handleResize();

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('scroll', handleResize);
        };
    }, []);

    // Immediate hard redirect for unauthenticated users in ProtectedLayout
    // This is a fail-safe for the global useAuthSubscription redirect
    if (typeof window !== "undefined" && isInitialized && !isLoading && !isAuthenticated && !token) {
        window.location.href = routes.publicroute.LOGIN;
    }

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden bg-background"
            style={{
                backgroundColor: "var(--background)",
                height: viewportHeight,
                width: "100vw"
            }}
        >
            {shouldShowNavbar && <Navbar variant="dashboard" />}
            {/* Expiry warning banner - Only show on private pages (not subscription page) */}
            <Banner
                show={!!(isClient && expiryWarning?.show && !isSubscriptionPage && isAuthenticated)}
                variant={expiryWarning?.isExpired ? "error" : "warning"}
                message={expiryWarning?.isExpired ? (
                    <span>
                        Your Current Plan Expired on <strong>{expiryWarning.formattedDate}</strong>. Service is interrupted.
                    </span>
                ) : (
                    <span>
                        Your plan expires in <strong>{expiryWarning?.days} {expiryWarning?.days === 1 ? "day" : "days"}</strong> on <strong>{expiryWarning?.formattedDate}</strong>.
                    </span>
                )}
                action={expiryWarning?.isExpired ? (
                    <Link
                        href={routes.publicroute.PRICING}
                        className="font-bold underline hover:text-red-100 flex items-center gap-1"
                    >
                        <span>Plan Expired. Renew Now</span>
                        <span>→</span>
                    </Link>
                ) : (
                    <Link
                        href={routes.publicroute.PRICING}
                        className="font-bold underline hover:text-amber-100 bg-white/20 px-3 py-1 rounded-full transition-colors hover:bg-white/30"
                    >
                        Renew Now
                    </Link>
                )}
            />
            <div className="flex flex-1 overflow-hidden">
                {/* Only show sidebar if user has active subscription AND token */}
                {isClient && !isLoading && shouldShowSidebar && <Sidebar />}
                <main
                    className="flex-1 flex flex-col overflow-x-hidden transition-opacity duration-200" // Removed overflow-y-auto from main
                    style={{
                        backgroundColor: "var(--background)",
                        WebkitOverflowScrolling: "touch",
                        scrollBehavior: "smooth",
                        overscrollBehaviorY: "contain"
                    }}
                >
                    {/* Extra bottom padding on mobile so content isn't hidden behind the bottom nav */}
                    <div className="flex-1 container mx-auto max-w-full px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-6 lg:py-6 pb-20 md:pb-6 lg:pb-8 overflow-y-auto"> {/* Added overflow-y-auto here */}
                        {isLoading ? (
                            <PageSkeleton />
                        ) : shouldShowContent ? (
                            // Show content if conditions are met
                            <div className="animate-fade-in" style={{ backgroundColor: "var(--background)" }}>
                                {children}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <div className="text-muted-foreground">Redirecting to login...</div>
                                <button
                                    onClick={() => {
                                        clearAuthData();
                                        window.location.href = routes.publicroute.LOGIN;
                                    }}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Click here if not redirected
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Footer - only on desktop */}
                    <footer className="hidden md:flex border-t bg-gray-50/50 flex-shrink-0" style={{ height: '64px' }}>
                        <div className="container mx-auto max-w-full h-full flex items-center justify-center">
                            <div className="text-xs text-gray-500 font-medium">
                                © 2026 Visitor Management System
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
            {/* Mobile bottom navigation — Instagram/LinkedIn style */}
            {isClient && !isLoading && shouldShowSidebar && <MobileBottomNav />}
        </div>
    );
}
