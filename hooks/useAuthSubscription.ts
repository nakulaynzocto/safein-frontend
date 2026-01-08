"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";
import { useGetUserActiveSubscriptionQuery } from "@/store/api/userSubscriptionApi";
import { routes, isPrivateRoute } from "@/utils/routes";

export function useAuthSubscription() {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
    const [isClient, setIsClient] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize auth on mount
    useEffect(() => {
        setIsClient(true);
        dispatch(initializeAuth());
        setIsInitialized(true);
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

    const hasActiveSubscription = useMemo(() => {
        if (!activeSubscriptionData?.data) return false;
        const subscription = activeSubscriptionData.data;
        return subscription.isActive === true && subscription.paymentStatus === "succeeded";
    }, [activeSubscriptionData]);

    const isTrialingSubscription = useMemo(() => {
        if (!activeSubscriptionData?.data) return false;
        return activeSubscriptionData.data.isTrialing === true;
    }, [activeSubscriptionData]);

    // Check if user has ANY subscription (active or expired)
    // This is used to determine dashboard access and navbar button display
    const hasAnySubscription = useMemo(() => {
        return !!activeSubscriptionData?.data;
    }, [activeSubscriptionData]);

    const isCurrentRoutePrivate = useMemo(() => {
        return isPrivateRoute(pathname);
    }, [pathname]);

    // Check if current route is a subscription-related page
    const isSubscriptionPage = useMemo(() => {
        return (
            pathname === routes.publicroute.SUBSCRIPTION_SUCCESS || pathname === routes.publicroute.SUBSCRIPTION_CANCEL
        );
    }, [pathname]);

    // Check if current route should hide sidebar
    const shouldHideSidebar = useMemo(() => {
        return pathname === routes.publicroute.SUBSCRIPTION_SUCCESS;
    }, [pathname]);

    // Pages that should show content even when authenticated (public pages)
    const allowedPagesForAuthenticated = useMemo(
        () => [
            routes.publicroute.LOGIN,
            routes.publicroute.REGISTER,
            routes.publicroute.SUBSCRIPTION_SUCCESS,
            routes.publicroute.SUBSCRIPTION_CANCEL,
            routes.publicroute.PRICING,
            routes.publicroute.HOME,
            routes.publicroute.FEATURES,
            routes.publicroute.CONTACT,
            routes.publicroute.HELP,
            routes.publicroute.VERIFY,
        ],
        [],
    );

    const isAllowedPageForAuthenticated = useMemo(() => {
        // Check exact match or if pathname starts with allowed page (for dynamic routes like /verify/[token])
        return allowedPagesForAuthenticated.some((page) => pathname === page || pathname?.startsWith(page + "/"));
    }, [pathname, allowedPagesForAuthenticated]);

    // Determine if Navbar should show (private navbar)
    // Show private navbar if authenticated
    const shouldShowPrivateNavbar = useMemo(() => {
        return !!token && isAuthenticated;
    }, [token, isAuthenticated]);

    // Determine if Sidebar should show
    // Show sidebar only if authenticated AND not on pages that hide sidebar
    const shouldShowSidebar = useMemo(() => {
        return !!token && isAuthenticated && !shouldHideSidebar;
    }, [token, isAuthenticated, shouldHideSidebar]);

    const canAccessDashboard = useMemo(() => {
        return !!token && isAuthenticated;
    }, [token, isAuthenticated]);

    // Determine if content should be shown (for protected routes)
    const shouldShowContent = useMemo(() => {
        // If not initialized or not authenticated, don't show content
        if (!isInitialized || !isAuthenticated || !token) {
            return false;
        }

        // If on subscription page, always show content
        if (isSubscriptionPage) {
            return true;
        }

        // If on private route, show content if:
        // 1. Has active subscription, OR
        // 2. Subscription is still loading (give it time to fetch)
        // This prevents showing loading state when subscription data is being refetched after payment
        if (isCurrentRoutePrivate) {
            // Allow access to private routes even if subscription is expired
            // The individual components will handle limits (create button disabled, etc.)
            return true;
        }

        // For other routes, show if authenticated
        return true;
    }, [
        isInitialized,
        isAuthenticated,
        token,
        isSubscriptionPage,
        isCurrentRoutePrivate,
        hasActiveSubscription,
        isSubscriptionLoading,
    ]);

    // Calculate remaining days and show warning if less than 5 days
    const expiryWarning = useMemo(() => {
        if (!activeSubscriptionData?.data?.endDate) return { show: false, days: 0 };

        const endDate = new Date(activeSubscriptionData.data.endDate);
        const now = new Date();
        const timeDiff = endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
            show: daysRemaining <= 5 && daysRemaining >= 0,
            days: daysRemaining,
        };
    }, [activeSubscriptionData]);

    // Determine if loading state should be shown
    const isLoading = useMemo(() => {
        // If not initialized, show loading
        if (!isInitialized || !isClient) {
            return true;
        }

        // If on private route and subscription is loading, show loading
        // But only for a reasonable time (max 5 seconds) to prevent infinite loading
        if (isCurrentRoutePrivate && isSubscriptionLoading) {
            return true;
        }

        // If on private route and no active subscription, still don't show loading
        // We want to show the content (dashboard)
        if (isCurrentRoutePrivate && !hasActiveSubscription && !isSubscriptionLoading) {
            return false;
        }

        return false;
    }, [isInitialized, isClient, isCurrentRoutePrivate, isSubscriptionLoading, hasActiveSubscription]);

    // Redirect logic for unauthenticated users on private routes
    useEffect(() => {
        if (isInitialized && !isAuthenticated && !token && isCurrentRoutePrivate) {
            router.replace(routes.publicroute.LOGIN);
        }
    }, [isInitialized, isAuthenticated, token, isCurrentRoutePrivate, router]);

    // Redirect authenticated users from login/register to dashboard
    useEffect(() => {
        if (isInitialized && isAuthenticated && token) {
            const authPages = [routes.publicroute.LOGIN, routes.publicroute.REGISTER];
            if (authPages.some((page) => pathname === page)) {
                // Small delay to allow page to render, then redirect
                const timer = setTimeout(() => {
                    router.replace(routes.privateroute.DASHBOARD);
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [isInitialized, isAuthenticated, token, router, pathname]);

    // Note: Free trial is auto-assigned during registration, so all new users will have a subscription

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
        activeSubscriptionData: activeSubscriptionData?.data,
        isTrialingSubscription,
        expiryWarning,

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
