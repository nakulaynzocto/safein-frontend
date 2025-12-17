"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { routes } from "@/utils/routes"
import { useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/slices/authSlice"
import { useLogoutMutation } from "@/store/api/authApi"
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
    href: routes.privateroute.NOTIFICATIONS,
    icon: CheckCircle,
  },
  {
    name: "Notification",
    href: routes.privateroute.SETTINGS,
    icon: Bell,
  },
  {
    name: "Subscription",
    href: routes.privateroute.ACTIVE_PLAN,
    icon: Package,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [collapsed, setCollapsed] = useState(false)
  const isSettingsActive = pathname === routes.privateroute.SETTINGS || 
                          pathname === routes.privateroute.PROFILE || 
                          pathname === routes.privateroute.NOTIFICATIONS ||
                          pathname === routes.privateroute.ACTIVE_PLAN ||
                          pathname?.startsWith('/settings/')
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive)
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()

  const isActive = (href: string) => pathname === href

  useEffect(() => {
    if (isSettingsActive && !settingsOpen) {
      setSettingsOpen(true)
    }
  }, [pathname, isSettingsActive, settingsOpen])

  const handleLogout = async () => {
    try {
      dispatch(logout())
      logoutMutation().unwrap().catch(() => {})
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        sessionStorage.clear()
      }
      setTimeout(() => {
        router.replace(routes.publicroute.LOGIN)
      }, 300)
    } catch (error) {
      dispatch(logout())
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      setTimeout(() => {
        router.replace(routes.publicroute.LOGIN)
      }, 300)
    }
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col sidebar-hostinger transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "sidebar-collapsed" : "sidebar-expanded",
        className,
      )}
    >

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-2 overflow-y-auto mt-8">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href!}
            prefetch={true}
            className={cn(
              "sidebar-item text-base",
              isActive(item.href!) && "active"
            )}
          >
            <item.icon className="sidebar-item-icon" />
            {!collapsed && <span className="sidebar-item-text font-medium tracking-wide">{item.name}</span>}
          </Link>
        ))}

        {/* Settings with submenu */}
        <div className="space-y-1">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "sidebar-item text-base w-full flex items-center justify-between",
              isSettingsActive && "active"
            )}
          >
            <div className="flex items-center">
              <Settings className="sidebar-item-icon" />
              {!collapsed && <span className="sidebar-item-text font-medium tracking-wide">Settings</span>}
            </div>
            {!collapsed && (
              settingsOpen ? (
                <ChevronDown className="h-4 w-4 sidebar-item-text" />
              ) : (
                <ChevronRight className="h-4 w-4 sidebar-item-text" />
              )
            )}
          </button>

          {/* Settings submenu */}
          {!collapsed && settingsOpen && (
            <div className="ml-6 space-y-1 pl-2 border-l-2 border-gray-200">
              {settingsSubmenu.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "sidebar-item text-sm flex items-center gap-2 py-2 px-3 rounded-md",
                    isActive(item.href) && "active"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="sidebar-item-text font-medium">{item.name}</span>
                </Link>
              ))}
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
    </div>
  )
}
