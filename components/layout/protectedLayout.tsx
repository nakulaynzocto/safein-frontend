"use client";
import { PageSkeleton } from "@/components/common/pageSkeleton";

import { type ReactNode, useEffect } from "react";
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
import { cn } from "@/lib/utils";

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
        pathname,
    } = useAuthSubscription();

    // Show navbar for all authenticated users
    const shouldShowNavbar = isClient && !isLoading && shouldShowPrivateNavbar;

    // 🔌 Initialize WebSocket for real-time appointment updates
    // Auto-connects when user is authenticated and auto-disconnects on logout
    useAppointmentSocket();

    // 🔔 Listen for Chat Notifications globally
    useChatNotifications();

    // Prevent global page scroll for messages page
    useEffect(() => {
        if (typeof window !== 'undefined' && pathname === routes.privateroute.MESSAGES) {
            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalBodyOverflow = document.body.style.overflow;
            
            // On mobile, we need to hide overflow to stop the "bounce" and outer scroll
            // On desktop, the container itself manages overflow
            if (window.innerWidth < 768) {
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';
            }
            
            return () => {
                document.documentElement.style.overflow = originalHtmlOverflow;
                document.body.style.overflow = originalBodyOverflow;
            };
        }
    }, [pathname]);

    // Immediate hard redirect for unauthenticated users in ProtectedLayout
    // This is a fail-safe for the global useAuthSubscription redirect
    if (typeof window !== "undefined" && isInitialized && !isLoading && !isAuthenticated && !token) {
        window.location.href = routes.publicroute.LOGIN;
    }

    return (
        <div className="flex h-[100dvh] flex-col overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
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
                    className={cn(
                        "flex-1 flex flex-col transition-opacity duration-200 relative",
                        pathname === routes.privateroute.MESSAGES ? "overflow-hidden" : "overflow-y-auto"
                    )}
                    style={{
                        backgroundColor: "var(--background)",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <div className={cn(
                        "w-full max-w-full",
                        pathname === routes.privateroute.MESSAGES ? "flex-1 min-h-0 p-0 md:p-4 h-full overflow-hidden flex flex-col" : "container mx-auto px-2 py-4 sm:px-3 sm:py-4 md:px-4 md:py-6 lg:px-6 lg:py-8 pb-32 md:pb-24"
                    )}>
                        {isLoading ? (
                            <PageSkeleton />
                        ) : shouldShowContent ? (
                            // Show content if conditions are met
                            <div className={cn("animate-fade-in flex flex-col", pathname === routes.privateroute.MESSAGES ? "flex-1 min-h-0 h-full" : "min-h-[calc(100vh-200px)]")} style={{ backgroundColor: "var(--background)" }}>
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
                    {/* Footer - only on desktop and not on messages page */}
                    {pathname !== routes.privateroute.MESSAGES && (
                        <footer className="hidden md:flex border-t bg-gray-50/50 flex-shrink-0 mt-auto" style={{ height: '64px' }}>
                            <div className="container mx-auto max-w-full h-full flex items-center justify-between px-8">
                                <div className="text-xs text-gray-500 font-medium">
                                    © 2026 Visitor Management System
                                </div>
                                <div className="text-xs text-gray-400">
                                    Secure & Trusted Platform
                                </div>
                            </div>
                        </footer>
                    )}
                </main>
            </div>
            {/* Mobile bottom navigation — Instagram/LinkedIn style */}
            {isClient && !isLoading && shouldShowSidebar && <MobileBottomNav />}
        </div>
    );
}
