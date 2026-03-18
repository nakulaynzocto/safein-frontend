"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initializeAuth, logout } from "@/store/slices/authSlice";
import { useGetUserActiveSubscriptionQuery, useGetTrialLimitsStatusQuery } from "@/store/api/userSubscriptionApi";
import { routes, isPrivateRoute, isPublicRoute, isGuestOnlyRoute, isPublicActionRoute } from "@/utils/routes";

export function useAuthSubscription() {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
    const [isClient, setIsClient] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize auth on mount
    // IMPORTANT: setIsInitialized must happen AFTER dispatch so Redux
    // has time to read localStorage and update isAuthenticated
    useEffect(() => {
        setIsClient(true);
        dispatch(initializeAuth());
        // Use setTimeout(0) to defer isInitialized until after
        // the Redux state update from initializeAuth is flushed
        const t = setTimeout(() => setIsInitialized(true), 0);
        return () => clearTimeout(t);
    }, [dispatch]);

    // Fetch active subscription (only if authenticated and user exists)
    const {
        data: activeSubscriptionData,
        isLoading: isSubscriptionLoading,
        isFetching: isSubscriptionFetching,
        refetch: refetchSubscription,
    } = useGetUserActiveSubscriptionQuery(user?.id ?? "", {
        skip: !isAuthenticated || !user?.id,
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
    });

    const subscription = useMemo(() => activeSubscriptionData?.data, [activeSubscriptionData]);

    const hasActiveSubscription = useMemo(() => {
        if (!subscription) return false;

        if (subscription.hasActiveSubscription !== undefined) {
            return subscription.hasActiveSubscription;
        }

        const endDate = new Date(subscription.endDate);
        const now = new Date();
        return (
            subscription.isActive === true &&
            subscription.paymentStatus === "succeeded" &&
            endDate.getTime() > now.getTime()
        );
    }, [subscription]);

    const isTrialingSubscription = useMemo(() => subscription?.isTrialing === true, [subscription]);

    // Check if user has ANY subscription (active or expired)
    // This is used to determine dashboard access and navbar button display
    const hasAnySubscription = useMemo(() => !!subscription, [subscription]);

    const isCurrentRoutePrivate = useMemo(() => isPrivateRoute(pathname), [pathname]);

    // Check if current route is a subscription-related page
    const isSubscriptionPage = useMemo(() => {
        return pathname === routes.publicroute.SUBSCRIPTION_SUCCESS || pathname === routes.publicroute.SUBSCRIPTION_CANCEL;
    }, [pathname]);

    // Check if current route should hide sidebar
    const shouldHideSidebar = useMemo(() => pathname === routes.publicroute.SUBSCRIPTION_SUCCESS, [pathname]);

    // Pages that should show content even when authenticated (public pages)
    const isAllowedPageForAuthenticated = useMemo(() => {
        // Use the centralized utility to check if the current path is a public route
        return isPublicRoute(pathname);
    }, [pathname]);

    // Determine if Navbar should show (private navbar)
    // Show private navbar if authenticated
    const shouldShowPrivateNavbar = useMemo(() => !!token && isAuthenticated, [token, isAuthenticated]);

    // Determine if Sidebar should show
    // Show sidebar only if authenticated AND not on pages that hide sidebar
    const shouldShowSidebar = useMemo(() => {
        return !!token && isAuthenticated && !shouldHideSidebar;
    }, [token, isAuthenticated, shouldHideSidebar]);

    const canAccessDashboard = useMemo(() => !!token && isAuthenticated, [token, isAuthenticated]);

    // Determine if content should be shown (for protected routes)
    const shouldShowContent = useMemo(() => {
        // If not initialized or not authenticated, don't show content
        if (!isInitialized || !isAuthenticated || !token) return false;

        // If on subscription page or private route, always show content
        // The individual components will handle limits (create button disabled, etc.)
        if (isSubscriptionPage || isCurrentRoutePrivate) return true;

        // For other routes, show if authenticated
        return true;
    }, [isInitialized, isAuthenticated, token, isSubscriptionPage, isCurrentRoutePrivate]);

    // Calculate remaining days and show warning if less than 5 days
    const expiryWarning = useMemo(() => {
        if (!subscription?.endDate) return { show: false, days: 0, formattedDate: "", isExpired: false };

        const endDate = new Date(subscription.endDate);
        const now = new Date();
        const timeDiff = endDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        const isExpired = subscription.subscriptionStatus === "expired" || timeDiff < 0;

        // Format date and time
        const formattedDate = endDate.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // Show warning if expiring within 5 days OR already expired
        return {
            show: (daysRemaining <= 5 && daysRemaining >= 0) || isExpired,
            days: daysRemaining,
            formattedDate,
            isExpired
        };
    }, [subscription]);

    // Safety timeout: if subscription loading takes > 3s, force-unblock
    useEffect(() => {
        if (isCurrentRoutePrivate && isSubscriptionLoading && isAuthenticated) {
            loadingTimeoutRef.current = setTimeout(() => {
                setLoadingTimedOut(true);
            }, 3000);
        } else {
            // Clear timeout and reset if loading finished
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
            setLoadingTimedOut(false);
        }
        return () => {
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        };
    }, [isCurrentRoutePrivate, isSubscriptionLoading, isAuthenticated]);

    // Determine if loading state should be shown
    const isLoading = useMemo(() => {
        // If not initialized or not client-side yet, show loading
        if (!isInitialized || !isClient) return true;

        // If timed out, stop showing loading regardless
        if (loadingTimedOut) return false;

        // If on private route and subscription is still loading, show loading
        if (isCurrentRoutePrivate && isSubscriptionLoading) return true;

        return false;
    }, [isInitialized, isClient, isCurrentRoutePrivate, isSubscriptionLoading, loadingTimedOut]);

    // Redirect logic for unauthenticated users on private routes
    useEffect(() => {
        if (isInitialized && !isAuthenticated && !token && isCurrentRoutePrivate) {
            router.replace(routes.publicroute.LOGIN);
        }
    }, [isInitialized, isAuthenticated, token, isCurrentRoutePrivate, router]);

    // NOTE: Removed the auto-logout effect that was triggering during subscription loading.
    // It was causing a race condition: user logs in, navigates to dashboard,
    // subscription API is still loading -> shouldShowContent=false briefly ->
    // auto-logout fires -> page stuck / user kicked to login.
    // Now handled gracefully by loadingTimedOut safeguard above.

    // Redirect authenticated users from login/register to dashboard
    useEffect(() => {
        if (isInitialized && isAuthenticated && token) {
            // Check if current route is guest-only using utility
            if (isGuestOnlyRoute(pathname) && !isPublicActionRoute(pathname)) {
                // Small delay to allow page to render, then redirect
                const timer = setTimeout(() => {
                    router.replace(routes.privateroute.DASHBOARD);
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [isInitialized, isAuthenticated, token, router, pathname]);

    // Note: Free trial is auto-assigned during registration, so all new users will have a subscription

    // Fetch trial limits (permissions & modules)
    const { data: trialLimitsData } = useGetTrialLimitsStatusQuery(undefined, {
        skip: !isAuthenticated || !user?.id,
    });

    const subscriptionLimits = useMemo(() => trialLimitsData?.data, [trialLimitsData]);

    return {
        // Auth state
        isAuthenticated,
        token,
        user,
        isClient,
        isInitialized,

        // Subscription state
        hasActiveSubscription,
        hasAnySubscription,
        isSubscriptionLoading,
        isSubscriptionFetching,
        activeSubscriptionData: subscription,
        isTrialingSubscription,
        expiryWarning,
        subscriptionLimits, // Export limits and modules

        // Route state
        pathname,
        isCurrentRoutePrivate,
        isSubscriptionPage,
        shouldHideSidebar,
        isAllowedPageForAuthenticated,

        // UI visibility flags
        shouldShowPrivateNavbar,
        shouldShowSidebar,
        canAccessDashboard,
        shouldShowContent,
        isLoading,
    };
}
