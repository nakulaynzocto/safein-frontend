"use client"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdownMenu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout, setUser } from "@/store/slices/authSlice"
import { useLogoutMutation, useGetProfileQuery } from "@/store/api/authApi"
import { routes } from "@/utils/routes"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"
import { NotificationBell } from "@/components/common/NotificationBell"
import { useNavbarScrollStyle } from "@/hooks/useScrollStyle"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import {
  User,
  LogOut,
  UserCircle,
  Menu,
  X,
  Calendar,
  Users,
  Building2,
  Shield,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  Bell,
  CreditCard,
} from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { showSuccessToast, showErrorToast } from "@/utils/toast"

interface NavbarProps {
  forcePublic?: boolean
  showUpgradeButton?: boolean
}

export function Navbar({ forcePublic = false, showUpgradeButton = false }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user: authUser } = useAppSelector((state) => state.auth)
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const lastProfileUserRef = useRef<string | null>(null)

  // Use centralized hook for auth and subscription checks
  const {
    isAuthenticated,
    token,
    shouldShowPrivateNavbar,
    canAccessDashboard,
    isSubscriptionPage,
    hasActiveSubscription,
    isTrialingSubscription,
  } = useAuthSubscription()

  // Use scroll-based styling hook for navbar
  const {
    shouldShowWhiteNavbar,
    linkText,
    linkHoverBgClass,
    ctaBtn,
  } = useNavbarScrollStyle({
    isAuthenticated: !forcePublic && shouldShowPrivateNavbar,
    isMounted,
    threshold: 10,
  })

  const { data: profileUser, refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })

  const user = profileUser || authUser

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (profileUser && profileUser.id) {
      const userDataHash = JSON.stringify({
        id: profileUser.id,
        profilePicture: profileUser.profilePicture || '',
        email: profileUser.email,
        name: profileUser.name,
        companyName: profileUser.companyName
      })
      
      if (userDataHash !== lastProfileUserRef.current) {
        lastProfileUserRef.current = userDataHash
        dispatch(setUser(profileUser))
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(profileUser))
        }
      }
    }
  }, [profileUser, dispatch])

  useEffect(() => {
    if (!isMounted) return
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue)
          if (updatedUser && updatedUser.id) {
            refetchProfile()
          }
        } catch (err) {
        }
      }
    }
    
    const handleProfileUpdate = (e: CustomEvent) => {
      if (e.detail && e.detail.id) {
        refetchProfile()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener)
    }
  }, [isMounted, refetchProfile])

  // Determine if user is authenticated (for UI display purposes)
  // Show private navbar UI only if: hasActiveSubscription AND token exists AND not forcePublic
  // If user is logged in but no subscription, show public navbar
  const isPublicVariant = forcePublic === true || (isAuthenticated && token && !hasActiveSubscription)
  const isActuallyAuthenticated = !isPublicVariant && shouldShowPrivateNavbar
  
  // For hiding Sign In button: check if user is simply logged in (has token)
  const isLoggedIn = !isPublicVariant && isAuthenticated && token
  const isLoggedInPublic = isAuthenticated && token
  
  // Show profile dropdown if:
  // 1. Token exists AND payment successful (hasActiveSubscription) - show dropdown with "My Account"
  // 2. OR user is on subscription-plan page AND logged in (has token) - show dropdown even in public variant
  // 3. OR user is logged in but no subscription (show profile dropdown with upgrade option)
  // Otherwise show public navbar (Sign In / Start Trial)
  const shouldShowProfileDropdown = isAuthenticated && token && (
    (isPublicVariant && (isSubscriptionPage || !hasActiveSubscription)) || // Allow dropdown on subscription page or if no subscription in public variant
    (!isPublicVariant && (isSubscriptionPage || (hasActiveSubscription && user))) // Show if token exists AND payment successful
  )

  const handleLogout = useCallback(async () => {
    try {
      // Clear data first
      dispatch(logout())
      
      // Call logout API (but don't wait for it or show errors)
      logoutMutation().unwrap().catch(() => {
        // Silently fail - we're logging out locally anyway
      })
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        sessionStorage.clear()
      }
      
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.replace(routes.publicroute.LOGIN)
      }, 300)
    } catch (error) {
      // Even on error, logout locally
      dispatch(logout())
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      
      
      // Redirect to login page
      setTimeout(() => {
        router.replace(routes.publicroute.LOGIN)
      }, 300)
    }
  }, [logoutMutation, dispatch, router])

  const handleAvatarClick = useCallback(() => {
    router.push(routes.privateroute.PROFILE)
  }, [router])

  const handleOpenUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true)
  }, [])

  const handleCloseUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false)
  }, [])

  const getUserInitials = (name?: string, companyName?: string) => {
    if (companyName) {
      return companyName.substring(0, 1).toUpperCase()
    }
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 1)
    }
    return "U"
  }

  const userInitials = user ? getUserInitials(user.name, user.companyName) : "U"

  // For authenticated users with active subscription, always show white navbar
  const shouldUseWhiteNavbar = shouldShowWhiteNavbar || (isActuallyAuthenticated && hasActiveSubscription)

  return (
    <nav
      className={`${
        shouldUseWhiteNavbar
          ? 'bg-white border-b border-gray-200 shadow-sm'
          : 'bg-hero-gradient border-transparent shadow-none backdrop-blur-0'
      } sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={canAccessDashboard ? routes.privateroute.DASHBOARD : routes.publicroute.HOME} className="flex items-center gap-3" prefetch={true}>
              {/* Circular Logo with A */}
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-[#3882a5] flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-bold">A</span>
                </div>
              </div>
              {/* AYNZO Text and Visitor Management System */}
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">AYNZO</span>
                <span className="text-xs sm:text-sm font-medium text-[#3882a5] leading-tight">Visitor Management System</span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            {!isActuallyAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  href={routes.publicroute.HOME}
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${
                    pathname === routes.publicroute.HOME
                      ? `${shouldShowWhiteNavbar ? 'border-brand' : 'border-white'} ${linkText}`
                      : `border-transparent ${linkText}`
                  } group transition-colors duration-200 ${linkHoverBgClass}`}
                  prefetch={true}
                >
                  <span className="relative z-10">Home</span>
                  <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-brand/10 to-brand-strong/10' : 'bg-white/5'}`} />
                </Link>
                <Link
                  href={routes.publicroute.FEATURES}
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${
                    pathname === routes.publicroute.FEATURES
                      ? `${shouldShowWhiteNavbar ? 'border-brand' : 'border-white'} ${linkText}`
                      : `border-transparent ${linkText}`
                  } group transition-colors duration-200 ${linkHoverBgClass}`}
                  prefetch={true}
                >
                  <span className="relative z-10">Features</span>
                  <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-brand/10 to-brand-strong/10' : 'bg-white/5'}`} />
                </Link>
                <Link
                  href={routes.publicroute.PRICING}
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${
                    pathname === routes.publicroute.PRICING
                      ? `${shouldShowWhiteNavbar ? 'border-brand' : 'border-white'} ${linkText}`
                      : `border-transparent ${linkText}`
                  } group transition-colors duration-200 ${linkHoverBgClass}`}
                  prefetch={true}
                >
                  <span className="relative z-10">Pricing</span>
                  <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-brand/10 to-brand-strong/10' : 'bg-white/5'}`} />
                </Link>
                <Link
                  href={routes.publicroute.CONTACT}
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${
                    pathname === routes.publicroute.CONTACT
                      ? `${shouldShowWhiteNavbar ? 'border-brand' : 'border-white'} ${linkText}`
                      : `border-transparent ${linkText}`
                  } group transition-colors duration-200 ${linkHoverBgClass}`}
                  prefetch={true}
                >
                  <span className="relative z-10">Contact</span>
                  <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-brand/10 to-brand-strong/10' : 'bg-white/5'}`} />
                </Link>
                <Link
                  href={routes.publicroute.HELP}
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${
                    pathname === routes.publicroute.HELP
                      ? `${shouldShowWhiteNavbar ? 'border-brand' : 'border-white'} ${linkText}`
                      : `border-transparent ${linkText}`
                  } group transition-colors duration-200 ${linkHoverBgClass}`}
                  prefetch={true}
                >
                  <span className="relative z-10">Help</span>
                  <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-brand/10 to-brand-strong/10' : 'bg-white/5'}`} />
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 1. Upgrade button (first) - Show if user is logged in but no subscription, hide on subscription-plan page */}
            {showUpgradeButton && isAuthenticated && token && !hasActiveSubscription && !isSubscriptionPage && (
              forcePublic ? (
                <Link 
                  href={routes.publicroute.SUBSCRIPTION_PLAN}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 ${ctaBtn}`}
                  prefetch={true}
                >
                  Upgrade
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenUpgradeModal}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
                >
                  Upgrade
                </button>
              )
            )}

            {/* Trial plan active (3 day trial): show Upgrade button left of profile in navbar */}
            {isAuthenticated && token && hasActiveSubscription && isTrialingSubscription && !isSubscriptionPage && (
              forcePublic ? (
                <Link 
                  href={routes.publicroute.SUBSCRIPTION_PLAN}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 ${ctaBtn}`}
                  prefetch={true}
                >
                  Upgrade
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenUpgradeModal}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
                >
                  Upgrade
                </button>
              )
            )}

            {shouldShowProfileDropdown ? (
              <>
                {/* User Profile Section with Paytm logo, name, and bell icon */}
                <div className="flex items-center gap-3">
                  {/* Paytm Logo */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Paytm</span>
                  </div>

                  {/* User Name */}
                  <div className="hidden sm:flex items-center">
                    <span className="text-sm font-medium text-gray-700">{user?.name || user?.companyName || "User"}</span>
                  </div>

                  {/* Notification Bell */}
                  {isActuallyAuthenticated && !isSubscriptionPage && (
                    <NotificationBell 
                      className="hover:bg-gray-100 rounded-lg p-2 transition-colors"
                      iconClassName="text-gray-700"
                    />
                  )}

                  {/* Profile Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        onClick={handleAvatarClick}
                      >
                        <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200">
                          {user?.profilePicture && user.profilePicture.trim() !== "" ? (
                            <AvatarImage 
                              src={`${user.profilePicture}${user.profilePicture.includes('?') ? '&' : '?'}v=${user.profilePicture.length}`} 
                              alt={user.companyName || "User"}
                              key={user.profilePicture}
                            />
                          ) : null}
                          <AvatarFallback className="text-white font-semibold shadow-lg" style={{ backgroundColor: '#3882a5' }}>
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2 shadow-xl border-gray-200/50" align="end" forceMount>
                      <div className="flex items-center justify-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg mb-2">
                        <Avatar className="h-10 w-10">
                          {user?.profilePicture && user.profilePicture.trim() !== "" ? (
                            <AvatarImage 
                              src={`${user?.profilePicture}${user.profilePicture.includes('?') ? '&' : '?'}v=${user.profilePicture.length}`} 
                              alt={user?.companyName || "User"}
                              key={user?.profilePicture}
                            />
                          ) : null}
                          <AvatarFallback className="text-white font-semibold" style={{ backgroundColor: '#3882a5' }}>
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-semibold text-gray-900">
                            {user?.companyName || user?.name || "User"}
                          </p>
                          <p className="w-[180px] truncate text-sm text-gray-600">{user?.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {/* Show notifications and profile only if user has active subscription (not on subscription-plan page) */}
                      {isActuallyAuthenticated && !isSubscriptionPage ? (
                        <>
                          <DropdownMenuItem asChild className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <Link href={routes.privateroute.NOTIFICATIONS} className="flex items-center" prefetch={true}>
                              <Bell className="mr-3 h-4 w-4" />
                              Notifications
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Profile option - Only show if not on subscription page */}
                          <DropdownMenuItem asChild className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <Link href={routes.privateroute.PROFILE} className="flex items-center" prefetch={true}>
                              <UserCircle className="mr-3 h-4 w-4" />
                              Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      ) : null}
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        disabled={isLoggingOut}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        {isLoggingOut ? "Logging out..." : "Log out"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 2. Logout Button - Only show on subscription-plan page */}
                {isSubscriptionPage && isAuthenticated && token && (
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Show Sign In / Start Trial if: No token OR (token exists but payment not successful AND not logged in) */}
                {!isAuthenticated || !token ? (
                  <>
                    <Button variant="ghost" asChild className={`hidden sm:flex px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${linkHoverBgClass} ${linkText}`}>
                      <Link href={routes.publicroute.LOGIN} prefetch={true}>Sign in</Link>
                    </Button>
                    <Link href={routes.publicroute.REGISTER} className={`hidden sm:flex px-6 py-2 text-[14px] font-semibold rounded-lg transition-all duration-300 ${ctaBtn}`} prefetch={true}>
                      Start 3 Day Trial
                    </Link>
                  </>
                ) : hasActiveSubscription ? (
                  /* Show "My Account" only if: Token exists AND payment successful */
                  <Link 
                    href={canAccessDashboard ? routes.privateroute.DASHBOARD : routes.publicroute.SUBSCRIPTION_PLAN} 
                    className={`hidden sm:flex px-6 py-2 text-[14px] font-semibold rounded-lg transition-all duration-300 ${ctaBtn}`} 
                    prefetch={true}
                  >
                    My Account
                  </Link>
                ) : (
                  /* Show Upgrade button if logged in but no subscription, but hide on subscription-plan page */
                  <>
                    {/* 1. Upgrade button (first) */}
                    {showUpgradeButton && !isSubscriptionPage && (
                      <Link 
                        href={routes.publicroute.SUBSCRIPTION_PLAN}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
                        prefetch={true}
                      >
                        Upgrade
                      </Link>
                    )}
                  </>
                )}
              </>
            )}

            {/* 3. Three-row menu icon (third) - Only show on mobile for PUBLIC pages (not authenticated users) */}
            {!isActuallyAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
                  shouldShowWhiteNavbar 
                    ? 'hover:bg-gray-100/80 text-gray-900' 
                    : 'hover:bg-white/10 text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Upgrade Modal (opened from navbar Upgrade button) */}
        <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={handleCloseUpgradeModal} />

         {isMobileMenuOpen && !isActuallyAuthenticated && (
           <div className="lg:hidden border-t border-gray-200/30 bg-white/90 backdrop-blur-md shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {/* Show public menu links when: forcePublic is true OR not authenticated OR no subscription */}
              {(forcePublic || !isAuthenticated || !token || !hasActiveSubscription) && (
                <>
                  <Link
                    href={routes.publicroute.HOME}
                    className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-100/80 hover:scale-105"
                    style={{ color: '#161718' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href={routes.publicroute.FEATURES}
                    className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-100/80 hover:scale-105"
                    style={{ color: '#161718' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href={routes.publicroute.PRICING}
                    className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-100/80 hover:scale-105"
                    style={{ color: '#161718' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href={routes.publicroute.CONTACT}
                    className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-100/80 hover:scale-105"
                    style={{ color: '#161718' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    href={routes.publicroute.HELP}
                    className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-100/80 hover:scale-105"
                    style={{ color: '#161718' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Help
                  </Link>
                  <div className="pt-4 border-t border-gray-200/50">
                    {/* Show Sign In / Start Trial if: No token */}
                    {!isAuthenticated || !token ? (
                      <>
                        <Link
                          href={routes.publicroute.LOGIN}
                          className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-gray-100/80"
                          style={{ color: '#161718' }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign in
                        </Link>
                        <Link
                          href={routes.publicroute.REGISTER}
                          className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${ctaBtn}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Start 3 Day Trial
                        </Link>
                      </>
                    ) : hasActiveSubscription ? (
                      /* Show "My Account" only if: Token exists AND payment successful */
                      <Link
                        href={canAccessDashboard ? routes.privateroute.DASHBOARD : routes.publicroute.SUBSCRIPTION_PLAN}
                        className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${ctaBtn}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                    ) : (
                      /* Show Upgrade button if logged in but no subscription, but hide on subscription-plan page */
                      <>
                        {showUpgradeButton && !isSubscriptionPage && (
                          <Link
                            href={routes.publicroute.SUBSCRIPTION_PLAN}
                            className="block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Upgrade
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
