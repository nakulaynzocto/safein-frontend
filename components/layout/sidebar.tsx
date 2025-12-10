"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { routes } from "@/utils/routes"
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserPlus,
  Settings,
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
  {
    name: "Settings",
    href: routes.privateroute.SETTINGS,
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => pathname === href

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
              "sidebar-item text-base", // Increased text size
              isActive(item.href!) && "active"
            )}
          >
            <item.icon className="sidebar-item-icon" />
            {!collapsed && <span className="sidebar-item-text font-medium tracking-wide">{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}
