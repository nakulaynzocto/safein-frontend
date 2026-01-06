"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { routes } from "@/utils/routes"
import { useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import { useLogoutMutation } from "@/store/api/authApi"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserPlus,
  Settings,
  UserCircle,
  CheckCircle,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
  Package,
  Menu,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: "Dashboard",
    href: routes.privateroute.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: "Employees",
    href: routes.privateroute.EMPLOYEELIST,
    icon: Users,
  },
  {
    name: "Visitors",
    href: routes.privateroute.VISITORLIST,
    icon: UserPlus,
  },
  {
    name: "Appointments",
    href: routes.privateroute.APPOINTMENTLIST,
    icon: Calendar,
  },
]

const settingsSubmenu = [
  {
    name: "Profile",
    href: routes.privateroute.PROFILE,
    icon: UserCircle,
  },
  {
    name: "Appointment Status",
    href: routes.privateroute.SETTINGS_STATUS,
    icon: CheckCircle,
  },
  {
    name: "Notification",
    href: routes.privateroute.NOTIFICATIONS,
    icon: Bell,
  },
  {
    name: "Appointment Links",
    href: routes.privateroute.APPOINTMENT_LINKS,
    icon: Calendar,
  },
  {
    name: "Subscription",
    href: routes.privateroute.ACTIVE_PLAN,
    icon: Package,
  },
]

export const SidebarContent = ({
  onLinkClick,
  isMobile = false
}: {
  onLinkClick?: () => void
  isMobile?: boolean
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const isSettingsActive = pathname === routes.privateroute.SETTINGS ||
    pathname === routes.privateroute.PROFILE ||
    pathname === routes.privateroute.NOTIFICATIONS ||
    pathname === routes.privateroute.SETTINGS_STATUS ||
    pathname === routes.privateroute.ACTIVE_PLAN ||
    pathname === routes.privateroute.APPOINTMENT_LINKS ||
    pathname?.startsWith('/settings/') ||
    pathname?.startsWith('/appointment-links')
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive)
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()

  const isActive = (href: string) => {
    if (pathname === href) return true

    if (href === routes.privateroute.EMPLOYEELIST) {
      return pathname === routes.privateroute.EMPLOYEELIST ||
        pathname === routes.privateroute.EMPLOYEECREATE ||
        (pathname?.startsWith('/employee/') && pathname !== routes.privateroute.EMPLOYEELIST)
    }

    if (href === routes.privateroute.APPOINTMENTLIST) {
      return pathname === routes.privateroute.APPOINTMENTLIST ||
        pathname === routes.privateroute.APPOINTMENTCREATE ||
        (pathname?.startsWith('/appointment/') && pathname !== routes.privateroute.APPOINTMENTLIST)
    }

    if (href === routes.privateroute.VISITORLIST) {
      return pathname === routes.privateroute.VISITORLIST ||
        pathname === routes.privateroute.VISITORREGISTRATION ||
        (pathname?.startsWith('/visitor/') && pathname !== routes.privateroute.VISITORLIST)
    }

    return false
  }

  useEffect(() => {
    if (isSettingsActive && !settingsOpen) {
      setSettingsOpen(true)
    }
  }, [pathname, isSettingsActive, settingsOpen])

  const handleLogout = async () => {
    try {
      dispatch(logout())
      logoutMutation().unwrap().catch(() => { })
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        sessionStorage.clear()
      }
      onLinkClick?.()
      setTimeout(() => {
        router.replace(routes.publicroute.LOGIN)
      }, 300)
    } catch (error) {
      dispatch(logout())
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      onLinkClick?.()
      setTimeout(() => {
        router.replace(routes.publicroute.LOGIN)
      }, 300)
    }
  }

  if (isMobile) {
    return (
      <div className="flex-1 overflow-y-auto">
        <SheetHeader className="p-4 border-b bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <Image
              src="/aynzo-logo.png"
              alt="Aynzo Logo"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-2 p-2 overflow-y-auto mt-2">
          {navigation.map((item) => {
            if (!item.href) return null
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                )}
                onClick={onLinkClick}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}

          <div className="space-y-1 mt-2">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                "flex items-center justify-between w-full rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                isSettingsActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 shrink-0" />
                <span className="truncate">Settings</span>
              </div>
              {settingsOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>

            {settingsOpen && (
              <div className="ml-6 space-y-1 pl-2 border-l-2 border-gray-200">
                {settingsSubmenu.map((item) => {
                  if (!item.href) return null
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                      )}
                      onClick={onLinkClick}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 py-2 px-3 rounded-md w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">© 2024 Aynzo. All rights reserved.</p>
        </div>
      </div >
    )
  }

  return (<nav className="flex-1 space-y-2 p-2 overflow-y-auto mt-8">
    {navigation.map((item) => {
      if (!item.href) return null
      return (
        <Link
          key={item.name}
          href={item.href}
          prefetch={true}
          className={cn(
            "sidebar-item text-base border-0 rounded-lg",
            isActive(item.href) && "active bg-primary/10 text-primary"
          )}
        >
          <item.icon className="sidebar-item-icon" />
          <span className="sidebar-item-text font-medium tracking-wide">{item.name}</span>
        </Link>
      )
    })}

    <div className="space-y-1">
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        className={cn(
          "sidebar-item text-base w-full flex items-center justify-between border-0 rounded-lg",
          isSettingsActive && "active bg-primary/10 text-primary"
        )}
      >
        <div className="flex items-center">
          <Settings className="sidebar-item-icon" />
          <span className="sidebar-item-text font-medium tracking-wide">Settings</span>
        </div>
        {settingsOpen ? (
          <ChevronDown className="h-4 w-4 sidebar-item-text" />
        ) : (
          <ChevronRight className="h-4 w-4 sidebar-item-text" />
        )}
      </button>

      {settingsOpen && (
        <div className="ml-6 space-y-1 pl-2 border-l-2 border-gray-200">
          {settingsSubmenu.map((item) => {
            if (!item.href) return null
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={cn(
                  "sidebar-item text-sm flex items-center gap-2 py-2 px-3 rounded-md border-0",
                  isActive(item.href) && "active bg-primary/10 text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="sidebar-item-text font-medium">{item.name}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="sidebar-item text-sm flex items-center gap-2 py-2 px-3 rounded-md w-full text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      )}
    </div>
  </nav>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex h-full flex-col sidebar-hostinger transition-all duration-300 ease-in-out overflow-hidden",
          collapsed ? "sidebar-collapsed" : "sidebar-expanded",
          className,
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Now controlled from Navbar */}
    </>
  )
}

