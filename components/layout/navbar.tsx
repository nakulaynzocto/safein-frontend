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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout, initializeAuth } from "@/store/slices/authSlice"
import { useLogoutMutation } from "@/store/api/authApi"
import { routes } from "@/utils/routes"
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
import { MobileSidebar } from "./mobileSidebar"
import { useState, useEffect } from "react"

export function Navbar() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Initialize authentication on component mount
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Check if user is actually authenticated (fallback check)
  const isActuallyAuthenticated = isAuthenticated || (typeof window !== "undefined" && localStorage.getItem("token"))

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await logoutMutation().unwrap()

      // Clear local state and redirect to login page
      dispatch(logout())
      router.push(routes.publicroute.LOGIN)
    } catch (error) {
      // Even if API call fails, still clear local state and redirect to login page
      dispatch(logout())
      router.push(routes.publicroute.LOGIN)
    }
  }

  const handleAvatarClick = () => {
    router.push(routes.privateroute.PROFILE)
  }

  const getUserInitials = (name?: string, companyName?: string) => {
    if (companyName) {
      return companyName.substring(0, 2).toUpperCase()
    }
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return "U"
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/30 shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link href={isActuallyAuthenticated ? routes.privateroute.DASHBOARD : routes.publicroute.HOME} className="flex items-center space-x-3 group" prefetch={true}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl" style={{ backgroundColor: '#3882a5' }}>
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SafeIn</h1>
                <p className="text-xs font-medium" style={{ color: '#555879' }}>Security Management</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {!isActuallyAuthenticated && (
              <>
                <Button variant="ghost" asChild className="relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 rounded-lg group">
                  <Link href={routes.publicroute.FEATURES} prefetch={true}>
                    <span className="relative z-10">Features</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 rounded-lg group">
                  <Link href={routes.publicroute.PRICING} prefetch={true}>
                    <span className="relative z-10">Pricing</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 rounded-lg group">
                  <Link href={routes.publicroute.CONTACT} prefetch={true}>
                    <span className="relative z-10">Contact</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 rounded-lg group">
                  <Link href={routes.publicroute.HELP} prefetch={true}>
                    <span className="relative z-10">Help</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {isActuallyAuthenticated ? (
              <>
                {/* Help Button */}
                <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 rounded-lg">
                  <HelpCircle className="h-4 w-4" />
                  Help
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
                        <AvatarFallback className="text-white font-semibold shadow-lg" style={{ backgroundColor: '#3882a5' }}>
                          {user ? getUserInitials(user.name, user.companyName) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 shadow-xl border-gray-200/50" align="end" forceMount>
                    <div className="flex items-center justify-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-white font-semibold" style={{ backgroundColor: '#3882a5' }}>
                          {user ? getUserInitials(user.name, user.companyName) : "U"}
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
                <Button variant="ghost" asChild className="hidden sm:flex px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 rounded-lg">
                  <Link href={routes.publicroute.LOGIN} prefetch={true}>Login</Link>
                </Button>
                <Button asChild className="px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" style={{ backgroundColor: '#3882a5' }}>
                  <Link href={routes.publicroute.REGISTER} prefetch={true}>Start Free Trial</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:bg-gray-100/80"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

         {/* Mobile Navigation Menu */}
         {isMobileMenuOpen && (
           <div className="lg:hidden border-t border-gray-200/30 bg-white/90 backdrop-blur-md shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {!isActuallyAuthenticated && (
                <>
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
                      Login
                    </Link>
                    <Link
                      href={routes.publicroute.REGISTER}
                      className="block px-4 py-3 rounded-lg text-base font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg"
                      style={{ backgroundColor: '#3882a5' }}
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
