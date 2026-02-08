"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initializeAuth, logout } from "@/store/slices/authSlice";
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
        const allowedPages = [
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
        ];
        return allowedPages.some((page) => pathname === page || pathname?.startsWith(page + "/"));
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

    // Determine if loading state should be shown
    const isLoading = useMemo(() => {
        // If not initialized, show loading
        if (!isInitialized || !isClient) return true;

        // If on private route and subscription is loading, show loading
        // But only for a reasonable time (max 5 seconds) to prevent infinite loading
        if (isCurrentRoutePrivate && isSubscriptionLoading) return true;

        // If on private route and no active subscription, still don't show loading
        // We want to show the content (dashboard)
        // This condition is now implicitly handled by the above and the default return false
        // if (isCurrentRoutePrivate && !hasActiveSubscription && !isSubscriptionLoading) {
        //     return false;
        // }

        return false;
    }, [isInitialized, isClient, isCurrentRoutePrivate, isSubscriptionLoading]);

    // Redirect logic for unauthenticated users on private routes
    useEffect(() => {
        if (isInitialized && !isAuthenticated && !token && isCurrentRoutePrivate) {
            router.replace(routes.publicroute.LOGIN);
        }
    }, [isInitialized, isAuthenticated, token, isCurrentRoutePrivate, router]);

    // Force redirect if authenticated but content is hidden (inactive/blocked) for too long
    useEffect(() => {
        if (isInitialized && isAuthenticated && isCurrentRoutePrivate && !shouldShowContent && !isLoading) {
            const timer = setTimeout(() => {
                // Double check specific conditions to handle "stuck" states
                // If user is inactive effectively, force them to login
                router.replace(routes.publicroute.LOGIN);
                dispatch(logout()); // Clean up client state
            }, 2000); // 2 second grace period
            return () => clearTimeout(timer);
        }
    }, [isInitialized, isAuthenticated, isCurrentRoutePrivate, shouldShowContent, isLoading, router, dispatch]);

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
        activeSubscriptionData: subscription,
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
