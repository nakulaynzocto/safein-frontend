"use client";
import { PageSkeleton } from "@/components/common/pageSkeleton";

import { type ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { useAppointmentSocket } from "@/hooks/useSocket";
import { routes } from "@/utils/routes";

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
    const shouldShowNavbar = !isLoading && shouldShowPrivateNavbar;

    // 🔌 Initialize WebSocket for real-time appointment updates
    // Auto-connects when user is authenticated and auto-disconnects on logout
    useAppointmentSocket();

    return (
        <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
            {shouldShowNavbar && <Navbar variant="dashboard" />}
            {/* Expiry warning banner - Only show on private pages (not subscription page) */}
            {expiryWarning?.show && !isSubscriptionPage && isAuthenticated && (
                <div className="w-full bg-amber-500/90 px-4 py-2 text-center text-xs text-white shadow-md backdrop-blur-sm sm:text-sm">
                    <span className="font-medium">
                        ⚠️ Your plan expires in {expiryWarning.days} {expiryWarning.days === 1 ? "day" : "days"}
                        .{" "}
                    </span>
                    <Link
                        href={routes.publicroute.PRICING}
                        className="ml-2 font-bold underline hover:text-amber-100"
                    >
                        Renew Now
                    </Link>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                {/* Only show sidebar if user has active subscription AND token */}
                {shouldShowSidebar && <Sidebar />}
                <main
                    className="flex-1 overflow-x-hidden overflow-y-auto transition-opacity duration-200"
                    style={{ backgroundColor: "var(--background)" }}
                >
                    <div className="container mx-auto max-w-full px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-6 lg:py-6">
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
                                        window.location.href = "/login";
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("user");
                                    }}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Click here if not redirected
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
