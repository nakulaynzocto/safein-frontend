"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { initializeAuth } from "@/store/slices/authSlice"
import { useGetUserActiveSubscriptionQuery } from "@/store/api/userSubscriptionApi"
import { routes, isPrivateRoute } from "@/utils/routes"


export function useAuthSubscription() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  
  // Auth state from Redux
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth)
  
  // Local state for initialization
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize auth on mount
  useEffect(() => {
    setIsClient(true)
    dispatch(initializeAuth())
    setIsInitialized(true)
  }, [dispatch])

  // Fetch active subscription (only if authenticated and user exists)
  const { 
    data: activeSubscriptionData, 
    isLoading: isSubscriptionLoading,
    isFetching: isSubscriptionFetching,
    refetch: refetchSubscription,
  } = useGetUserActiveSubscriptionQuery(user?.id ?? "", {
    skip: !isAuthenticated || !user?.id,
    // Refetch on mount and window focus to ensure fresh data after payment
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })

  // Check if user has active subscription
  // PREFERRED: Use backend-provided permission flag (more secure)
  // FALLBACK: Calculate on frontend if backend flag not available
  const hasActiveSubscription = useMemo(() => {
    if (!activeSubscriptionData?.data) return false
    
    const subscription = activeSubscriptionData.data
    
    // ✅ PREFERRED: Use backend-provided flag if available (backend calculates this securely)
    if (subscription.hasActiveSubscription !== undefined) {
      return subscription.hasActiveSubscription
    }
    
    // ✅ ALTERNATIVE: Use backend-provided canAccessDashboard flag
    if (subscription.canAccessDashboard !== undefined) {
      return subscription.canAccessDashboard
    }
    
    // ⚠️ FALLBACK: Frontend calculation (less secure, but works until backend adds flags)
    // Explicitly reject cancelled, failed, or pending payments
    if (subscription.paymentStatus === 'cancelled' || 
        subscription.paymentStatus === 'failed' || 
        subscription.paymentStatus === 'pending') {
      return false
    }
    
    return subscription.isActive === true && subscription.paymentStatus === 'succeeded'
  }, [activeSubscriptionData])

  // Trial detection (3 day trial / free plan)
  const isTrialingSubscription = useMemo(() => {
    if (!activeSubscriptionData?.data) return false
    // Backend provides derived field `isTrialing`
    return activeSubscriptionData.data.isTrialing === true
  }, [activeSubscriptionData])

  // Check if current route is private
  const isCurrentRoutePrivate = useMemo(() => {
    return isPrivateRoute(pathname)
  }, [pathname])

  // Check if current route is a subscription-related page
  const isSubscriptionPage = useMemo(() => {
    return (
      pathname === routes.publicroute.SUBSCRIPTION_PLAN ||
      pathname === routes.publicroute.SUBSCRIPTION_SUCCESS ||
      pathname === routes.publicroute.SUBSCRIPTION_CANCEL
    )
  }, [pathname])

  // Check if current route should hide sidebar
  const shouldHideSidebar = useMemo(() => {
    return (
      pathname === routes.publicroute.SUBSCRIPTION_PLAN ||
      pathname === routes.publicroute.SUBSCRIPTION_SUCCESS
    )
  }, [pathname])

  // Pages that should show content even when authenticated (public pages)
  const allowedPagesForAuthenticated = useMemo(() => [
    routes.publicroute.LOGIN,
    routes.publicroute.REGISTER,
    routes.publicroute.SUBSCRIPTION_PLAN,
    routes.publicroute.SUBSCRIPTION_SUCCESS,
    routes.publicroute.SUBSCRIPTION_CANCEL,
    routes.publicroute.PRICING,
    routes.publicroute.HOME,
    routes.publicroute.FEATURES,
    routes.publicroute.CONTACT,
    routes.publicroute.HELP,
    routes.publicroute.VERIFY,
  ], [])

  const isAllowedPageForAuthenticated = useMemo(() => {
    // Check exact match or if pathname starts with allowed page (for dynamic routes like /verify/[token])
    return allowedPagesForAuthenticated.some(page => 
      pathname === page || pathname?.startsWith(page + '/')
    )
  }, [pathname, allowedPagesForAuthenticated])

  // Determine if Navbar should show (private navbar)
  // Show private navbar only if: hasActiveSubscription AND token exists
  const shouldShowPrivateNavbar = useMemo(() => {
    return hasActiveSubscription && !!token && isAuthenticated
  }, [hasActiveSubscription, token, isAuthenticated])

  // Determine if Sidebar should show
  // Show sidebar only if: hasActiveSubscription AND token exists AND not on pages that hide sidebar
  const shouldShowSidebar = useMemo(() => {
    return hasActiveSubscription && !!token && isAuthenticated && !shouldHideSidebar
  }, [hasActiveSubscription, token, isAuthenticated, shouldHideSidebar])

  // Determine if dashboard access is allowed
  // Dashboard access only if: hasActiveSubscription AND token exists
  const canAccessDashboard = useMemo(() => {
    return hasActiveSubscription && !!token && isAuthenticated
  }, [hasActiveSubscription, token, isAuthenticated])

  // Determine if content should be shown (for protected routes)
  const shouldShowContent = useMemo(() => {
    // If not initialized or not authenticated, don't show content
    if (!isInitialized || !isAuthenticated || !token) {
      return false
    }

    // If on subscription page, always show content
    if (isSubscriptionPage) {
      return true
    }

    // If on private route, show content if:
    // 1. Has active subscription, OR
    // 2. Subscription is still loading (give it time to fetch)
    // This prevents showing loading state when subscription data is being refetched after payment
    if (isCurrentRoutePrivate) {
      // Show content if subscription is active OR if we're still loading (optimistic)
      // The redirect logic will handle cases where subscription is not active
      return hasActiveSubscription || isSubscriptionLoading
    }

    // For other routes, show if authenticated
    return true
  }, [
    isInitialized,
    isAuthenticated,
    token,
    isSubscriptionPage,
    isCurrentRoutePrivate,
    hasActiveSubscription,
    isSubscriptionLoading,
  ])

  // Determine if loading state should be shown
  const isLoading = useMemo(() => {
    // If not initialized, show loading
    if (!isInitialized || !isClient) {
      return true
    }

    // If on private route and subscription is loading, show loading
    // But only for a reasonable time (max 5 seconds) to prevent infinite loading
    if (isCurrentRoutePrivate && isSubscriptionLoading) {
      return true
    }

    // If on private route and no active subscription, don't show loading
    // Let the redirect logic handle it (will redirect to subscription plan)
    if (isCurrentRoutePrivate && !hasActiveSubscription && !isSubscriptionLoading) {
      return false
    }

    return false
  }, [
    isInitialized,
    isClient,
    isCurrentRoutePrivate,
    isSubscriptionLoading,
    hasActiveSubscription,
  ])

  // Redirect logic for private routes without active subscription
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !token) return
    
    // If user is on a private route (dashboard, employee, appointment, visitor, etc.)
    if (isCurrentRoutePrivate) {
      // Wait for subscription check to complete
      if (isSubscriptionLoading) return
      
      // STRICT: If no active subscription, redirect immediately - NO EXCEPTIONS
      if (!hasActiveSubscription) {
        router.replace(routes.publicroute.SUBSCRIPTION_PLAN)
        return
      }
    }
  }, [
    isInitialized,
    isAuthenticated,
    token,
    isSubscriptionLoading,
    hasActiveSubscription,
    pathname,
    router,
    isCurrentRoutePrivate,
  ])

  // Redirect logic for unauthenticated users on private routes
  useEffect(() => {
    if (isInitialized && !isAuthenticated && !token && isCurrentRoutePrivate) {
      router.replace(routes.publicroute.LOGIN)
    }
  }, [isInitialized, isAuthenticated, token, isCurrentRoutePrivate, router])

  // Redirect authenticated users from login/register to subscription-plan
  useEffect(() => {
    if (isInitialized && isAuthenticated && token) {
      const authPages = [routes.publicroute.LOGIN, routes.publicroute.REGISTER]
      if (authPages.some(page => pathname === page)) {
        // Small delay to allow page to render, then redirect
        const timer = setTimeout(() => {
          router.replace(routes.publicroute.SUBSCRIPTION_PLAN)
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [isInitialized, isAuthenticated, token, router, pathname])

  return {
    // Auth state
    isAuthenticated,
    token,
    user,
    isClient,
    isInitialized,
    
    // Subscription state
    hasActiveSubscription,
    isSubscriptionLoading,
    isSubscriptionFetching,
    activeSubscriptionData: activeSubscriptionData?.data,
    isTrialingSubscription,
    
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
  }
}




