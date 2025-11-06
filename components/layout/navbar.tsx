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
import { logout, initializeAuth, setUser } from "@/store/slices/authSlice"
import { useLogoutMutation, useGetProfileQuery } from "@/store/api/authApi"
import { routes } from "@/utils/routes"
import { MobileSidebar } from "./mobileSidebar"
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
  BarChart3,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  Bell,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"

export function Navbar() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user: authUser, isAuthenticated } = useAppSelector((state) => state.auth)
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [clientAuthState, setClientAuthState] = useState(false)

  // Fetch latest user profile to get updated profilePicture
  const { data: profileUser } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  })

  // Use profileUser if available, otherwise fall back to authUser
  const user = profileUser || authUser

  // Mark as mounted after hydration to prevent SSR/client mismatch
  useEffect(() => {
    setIsMounted(true)
    // Check localStorage only on client
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      setClientAuthState(!!token)
    }
  }, [])

  // Update auth state when profile is fetched
  useEffect(() => {
    if (profileUser && profileUser.id) {
      dispatch(setUser(profileUser))
      // Also update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(profileUser))
      }
    }
  }, [profileUser, dispatch])

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (!isMounted) return
    
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMounted])

  // Only use localStorage check after mounting to prevent hydration mismatch
  // During SSR, only use Redux state
  const isActuallyAuthenticated = isMounted 
    ? (isAuthenticated || clientAuthState)
    : isAuthenticated

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      router.push(routes.publicroute.LOGIN)
    } catch (error) {
      dispatch(logout())
      router.push(routes.publicroute.LOGIN)
    }
  }, [logoutMutation, dispatch, router])

  const handleAvatarClick = useCallback(() => {
    router.push(routes.privateroute.PROFILE)
  }, [router])

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

  // During SSR, only check auth state. After mount, include scroll state to prevent hydration mismatch
  const shouldShowWhiteNavbar = isActuallyAuthenticated || (isMounted && isScrolled)
  const linkTextClass = shouldShowWhiteNavbar ? 'text-gray-900' : 'text-white'
  const linkHoverBgClass = shouldShowWhiteNavbar ? 'hover:bg-gray-100/80' : 'hover:bg-white/10'
  const ctaBtnClass = shouldShowWhiteNavbar ? 'text-white bg-brand' : 'text-brand-strong bg-white'
  const userInitials = user ? getUserInitials(user.name, user.companyName) : "U"

  return (
    <nav
      className={`${
        shouldShowWhiteNavbar
          ? 'bg-white/90 border-b border-gray-200/30 shadow-lg backdrop-blur-md'
          : 'bg-hero-gradient border-transparent shadow-none backdrop-blur-0'
      } sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href={isActuallyAuthenticated ? routes.privateroute.DASHBOARD : routes.publicroute.HOME} className="flex-shrink-0" prefetch={true}>
              <img 
                src="/aynzo-logo.png" 
                alt="Aynzo Logo" 
                className={`h-12 w-auto ${shouldShowWhiteNavbar ? '' : 'filter brightness-0 invert'}`}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {!isActuallyAuthenticated && (
              <>
                <Button variant="ghost" asChild className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${linkHoverBgClass} ${linkTextClass} rounded-lg group`}>
                  <Link href={routes.publicroute.HOME} prefetch={true}>
                    <span className="relative z-10">Home</span>
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-white/5'}`}></div>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${linkHoverBgClass} ${linkTextClass} rounded-lg group`}>
                  <Link href={routes.publicroute.FEATURES} prefetch={true}>
                    <span className="relative z-10">Features</span>
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-white/5'}`}></div>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${linkHoverBgClass} ${linkTextClass} rounded-lg group`}>
                  <Link href={routes.publicroute.PRICING} prefetch={true}>
                    <span className="relative z-10">Pricing</span>
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-white/5'}`}></div>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${linkHoverBgClass} ${linkTextClass} rounded-lg group`}>
                  <Link href={routes.publicroute.CONTACT} prefetch={true}>
                    <span className="relative z-10">Contact</span>
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-white/5'}`}></div>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${linkHoverBgClass} ${linkTextClass} rounded-lg group`}>
                  <Link href={routes.publicroute.HELP} prefetch={true}>
                    <span className="relative z-10">Help</span>
                    <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${shouldShowWhiteNavbar ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-white/5'}`}></div>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {isActuallyAuthenticated ? (
              <>
                {/* Mobile Menu Button - only for authenticated users */}
                <div className="md:hidden">
                  <MobileSidebar />
                </div>
                {/* Help Button */}
                <Button variant="ghost" size="sm" asChild className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 rounded-lg">
                  <Link href={routes.publicroute.HELP} prefetch={true}>
                    <HelpCircle className="h-4 w-4" />
                    Help
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      onClick={handleAvatarClick}
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-gray-200 hover:ring-blue-300 transition-all duration-200">
                        {user?.profilePicture && user.profilePicture.trim() !== "" && (
                          <AvatarImage src={user.profilePicture} alt={user.companyName || "User"} />
                        )}
                        <AvatarFallback className="text-white font-semibold shadow-lg" style={{ backgroundColor: '#3882a5' }}>
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 shadow-xl border-gray-200/50" align="end" forceMount>
                    <div className="flex items-center justify-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg mb-2">
                      <Avatar className="h-10 w-10">
                        {user?.profilePicture && user.profilePicture.trim() !== "" && (
                          <AvatarImage src={user.profilePicture} alt={user.companyName || "User"} />
                        )}
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
                    <DropdownMenuItem asChild className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Link href={routes.privateroute.DASHBOARD} className="flex items-center" prefetch={true}>
                        <BarChart3 className="mr-3 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Link href={routes.privateroute.NOTIFICATIONS} className="flex items-center" prefetch={true}>
                        <Bell className="mr-3 h-4 w-4" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Link href={routes.privateroute.PROFILE} className="flex items-center" prefetch={true}>
                        <UserCircle className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
              </>
            ) : (
              <>
                {/* Public Actions */}
                <Button variant="ghost" asChild className={`hidden sm:flex px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${linkHoverBgClass} ${linkTextClass}`}>
                  <Link href={routes.publicroute.LOGIN} prefetch={true}>Sign in</Link>
                </Button>
                <Button asChild className={`px-6 py-2 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${ctaBtnClass}`}>
                  <Link href={routes.publicroute.REGISTER} prefetch={true}>Start Free Trial</Link>
                </Button>
                
                {/* Mobile Menu Button - only for unauthenticated users */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:bg-gray-100/80"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>

         {/* Mobile Navigation Menu */}
         {isMobileMenuOpen && (
           <div className="lg:hidden border-t border-gray-200/30 bg-white/90 backdrop-blur-md shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {!isActuallyAuthenticated && (
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
                      className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 hover:scale-105 shadow-lg ${ctaBtnClass}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Start Free Trial
                    </Link>
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
