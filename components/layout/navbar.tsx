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
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout, setUser } from "@/store/slices/authSlice"
import { useLogoutMutation, useGetProfileQuery } from "@/store/api/authApi"
import { routes } from "@/utils/routes"
import { useAuthSubscription } from "@/hooks/useAuthSubscription"
import { NotificationBell } from "@/components/common/NotificationBell"
import { useNavbarScrollStyle } from "@/hooks/useScrollStyle"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SidebarContent } from "@/components/layout/sidebar"
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
import { cn } from "@/lib/utils"

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
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
    hasAnySubscription,
    isTrialingSubscription,
    expiryWarning,
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
  // Show private navbar UI if: authenticated AND not forcePublic
  // If user is logged in, show private navbar even if subscription is expired (dashboard access)
  // IMPORTANT: Use isMounted to prevent hydration mismatch - server renders as not authenticated
  const isPublicVariant = forcePublic === true
  const isActuallyAuthenticated = isMounted && !isPublicVariant && shouldShowPrivateNavbar

  // For hiding Sign In button: check if user is simply logged in (has token)
  const isLoggedIn = isMounted && !isPublicVariant && isAuthenticated && token
  const isLoggedInPublic = isMounted && isAuthenticated && token

  // Show profile dropdown if:
  // 1. Token exists AND payment successful (hasActiveSubscription) - show dropdown with "My Account"
  // 2. OR user is logged in but no subscription (show profile dropdown with upgrade option)
  // Otherwise show public navbar (Sign In / Start Trial)
  // Show profile dropdown if authenticated (only after mount to prevent hydration issues)
  const shouldShowProfileDropdown = isMounted && isAuthenticated && token

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

  const handleOpenUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true)
  }, [])

  const handleCloseUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false)
  }, [])

  return (
    <nav
      className={`${shouldShowWhiteNavbar
        ? 'bg-white/90 border-b border-gray-200/30 shadow-lg backdrop-blur-md'
        : 'bg-hero-gradient border-transparent shadow-none backdrop-blur-0'
        } sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={canAccessDashboard ? routes.privateroute.DASHBOARD : routes.publicroute.HOME} className="flex-shrink-0" prefetch={true}>
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-white">
                <Image
                  src="/aynzo-logo.png"
                  alt="Aynzo Logo"
                  width={48}
                  height={48}
                  priority
                  className="h-full w-full object-contain p-1"
                  onError={(e) => {
                    // Fallback if logo fails to load
                    const target = e.currentTarget as HTMLImageElement
                    target.src = "/aynzo-logo.svg"
                  }}
                />
              </div>
            </Link>
            {/* Visitor Management System Text - Show for all authenticated users */}
            {isActuallyAuthenticated && (
              <div className={`hidden lg:flex items-center`}>
                <div className={`text-base font-bold tracking-tight transition-all duration-300 ${shouldShowWhiteNavbar
                  ? 'text-[#3882a5]'
                  : 'text-white drop-shadow-lg'
                  }`}>
                  Visitor Management System
                </div>
              </div>
            )}
          </div>

          {/* Center: Navigation Links */}
          {/* Expiry warning - Only show on private pages (not public pages) */}
          {expiryWarning?.show && !isSubscriptionPage && !forcePublic && isActuallyAuthenticated && (
            <div className="absolute top-20 left-0 w-full bg-amber-500/90 text-white text-xs sm:text-sm py-1 px-4 text-center z-40 backdrop-blur-sm shadow-md">
              <span className="font-medium">⚠️ Your plan expires in {expiryWarning.days} {expiryWarning.days === 1 ? 'day' : 'days'}. </span>
              <Link href={routes.publicroute.PRICING} className="underline hover:text-amber-100 ml-2 font-bold">
                Renew Now
              </Link>
            </div>
          )}
          <div className="hidden lg:flex items-center justify-center flex-1">
            {!isActuallyAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  href={routes.publicroute.HOME}
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${pathname === routes.publicroute.HOME
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
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${pathname === routes.publicroute.FEATURES
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
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${pathname === routes.publicroute.PRICING
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
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${pathname === routes.publicroute.CONTACT
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
                  className={`relative inline-flex items-center rounded-lg px-3 py-2 text-[14px] font-medium border-b-2 ${pathname === routes.publicroute.HELP
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
            {/* Authenticated users - Show company info, notifications, and sidebar toggle */}
            {isActuallyAuthenticated && !isSubscriptionPage && (
              <div className="flex items-center gap-3">
                {/* Company Name with Logo */}
                {user?.companyName && (
                  <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${shouldShowWhiteNavbar
                    ? 'bg-gray-50 text-gray-900'
                    : 'bg-white/10 text-white'
                    }`}>
                    {user?.profilePicture && user.profilePicture.trim() !== "" ? (
                      <div className="h-10 w-10 overflow-hidden flex items-center justify-center bg-white flex-shrink-0">
                        <Image
                          src={`${user.profilePicture}${user.profilePicture.includes('?') ? '&' : '?'}v=${user.profilePicture.length}`}
                          alt={user?.companyName || "Company Logo"}
                          width={40}
                          height={40}
                          className="h-full w-full object-contain p-1"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.src = "/aynzo-logo.png"
                            target.className = "h-full w-full object-contain p-1"
                          }}
                        />
                      </div>
                    ) : (
                      <Building2 className={`h-5 w-5 flex-shrink-0 ${shouldShowWhiteNavbar ? 'text-gray-600' : 'text-white'}`} />
                    )}
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {user.companyName}
                    </span>
                  </div>
                )}
                {/* Notification Bell */}
                <NotificationBell
                  className={shouldShowWhiteNavbar ? 'hover:bg-gray-100/80' : 'hover:bg-white/10'}
                  iconClassName={shouldShowWhiteNavbar ? 'text-gray-700' : 'text-white'}
                />
                {/* Sidebar Toggle Button - Mobile Only */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className={cn(
                    "md:hidden size-9",
                    shouldShowWhiteNavbar
                      ? 'hover:bg-gray-100/80 text-gray-700'
                      : 'hover:bg-white/10 text-white'
                  )}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>
            )}

            {/* Show appropriate button based on subscription status */}
            {isMounted && isAuthenticated && token && !isSubscriptionPage && (
              <>
                {/* Private navbar: Show Upgrade ONLY for trial users or expired subscription */}
                {isActuallyAuthenticated && (isTrialingSubscription || !hasActiveSubscription) && (
                  <button
                    type="button"
                    onClick={handleOpenUpgradeModal}
                    className="hidden sm:flex px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
                  >
                    Upgrade
                  </button>
                )}
                {/* Public navbar ONLY: Show My Account for logged-in users */}
                {forcePublic && hasAnySubscription && (
                  <Link
                    href={routes.privateroute.DASHBOARD}
                    className={`hidden sm:flex px-6 py-2 text-[14px] font-semibold rounded-lg transition-all duration-300 ${ctaBtn}`}
                    prefetch={true}
                  >
                    My Account
                  </Link>
                )}
              </>
            )}

            {/* Logout button - Only on subscription page */}
            {isMounted && isSubscriptionPage && isAuthenticated && token && (
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-3 sm:px-4 py-2 text-xs sm:text-[14px] font-semibold rounded-lg transition-all duration-300 bg-[#3882a5] text-white hover:bg-[#2d6a87]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            )}

            {/* Sign In / Start Trial - Show ONLY when not authenticated */}
            {isMounted && (!isAuthenticated || !token) && (
              <>
                <Button variant="ghost" asChild className={`hidden sm:flex px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${linkHoverBgClass} ${linkText}`}>
                  <Link href={routes.publicroute.LOGIN} prefetch={true}>Sign in</Link>
                </Button>
                <Link href={routes.publicroute.REGISTER} className={`hidden sm:flex px-6 py-2 text-[14px] font-semibold rounded-lg transition-all duration-300 ${ctaBtn}`} prefetch={true}>
                  Start 3 Day Trial
                </Link>
              </>
            )}

            {/* Mobile menu toggle - Only show on public pages */}
            {!isActuallyAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${shouldShowWhiteNavbar
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
                    ) : isMounted && isAuthenticated && token && !isSubscriptionPage ? (
                      /* Show My Account or Upgrade based on subscription status */
                      hasAnySubscription ? (
                        <Link
                          href={routes.privateroute.DASHBOARD}
                          className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${ctaBtn}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Account
                        </Link>
                      ) : (
                        <Link
                          href={routes.publicroute.PRICING}
                          className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${ctaBtn}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Upgrade
                        </Link>
                      )
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Sheet */}
      {shouldShowPrivateNavbar && (
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SidebarContent isMobile onLinkClick={() => setIsMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </nav>
  )
}