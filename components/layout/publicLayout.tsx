"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useAuthSubscription } from "@/hooks/useAuthSubscription";
import { routes } from "@/utils/routes";
import { PageSkeleton } from "@/components/common/pageSkeleton";

interface PublicLayoutProps {
    children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
    const pathname = usePathname();

    // Use centralized hook for all auth and subscription logic
    const { isClient, isInitialized, isAuthenticated, token, isAllowedPageForAuthenticated, hasActiveSubscription } =
        useAuthSubscription();

    // Define auth routes where navbar and footer should be hidden
    const authRoutes = [
        routes.publicroute.LOGIN,
        routes.publicroute.REGISTER,
        routes.publicroute.FORGOT_PASSWORD,
        routes.publicroute.RESET_PASSWORD,
        routes.publicroute.VERIFY,
        routes.publicroute.SUBSCRIPTION_SUCCESS,
        routes.publicroute.SUBSCRIPTION_CANCEL,
        routes.publicroute.EMPLOYEE_SETUP, // Employee setup page - hide navbar
    ];

    // Dynamically check if current route is an auth route
    const isAuthRoute =
        authRoutes.some((route) => pathname === route) ||
        pathname?.startsWith(routes.publicroute.VERIFY.split('[')[0]) ||
        pathname?.startsWith(routes.publicroute.EMPLOYEE_SETUP);

    const shouldHideNavbar = isAuthRoute || !isInitialized || !isClient;
    const shouldHideFooter = isAuthRoute || !isInitialized || !isClient;

    // Check if user is logged in but doesn't have active subscription
    const shouldShowUpgradeButton = !!(isAuthenticated && token && !hasActiveSubscription);

    return (
        <div
            className="flex min-h-screen flex-col transition-all duration-300"
            style={{ backgroundColor: "var(--background)" }}
        >
            {!shouldHideNavbar && <Navbar forcePublic showUpgradeButton={shouldShowUpgradeButton} />}
            <main
                className="flex-1 transition-opacity duration-300 ease-in-out"
                style={{
                    backgroundColor: "var(--background)",
                    minHeight: shouldHideNavbar ? "100vh" : "calc(100vh - 200px)",
                }}
            >
                {!isClient || !isInitialized ? (
                    <div className="container mx-auto px-4 py-8">
                        <PageSkeleton />
                    </div>
                ) : isAuthenticated && token && !isAllowedPageForAuthenticated ? (
                    // Show loading for authenticated users on pages they shouldn't access (they should be redirected)
                    <div className="container mx-auto px-4 py-8">
                        <PageSkeleton />
                    </div>
                ) : (
                    // Show content for: unauthenticated users OR allowed pages (even if authenticated)
                    <div style={{ backgroundColor: "var(--background)", minHeight: "100%" }}>{children}</div>
                )}
            </main>
            {!shouldHideFooter && <Footer />}
        </div>
    );
}
