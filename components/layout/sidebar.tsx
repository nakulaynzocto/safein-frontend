"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { routes } from "@/utils/routes"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  UserCheck,
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Automatically expand the parent category based on current pathname
  useEffect(() => {
    if (collapsed) return // Don't auto-expand if collapsed

    for (const item of navigation) {
      if (item.children) {
        const activeChild = item.children.find((child) => child.href === pathname)
        if (activeChild) {
          setExpandedItem(item.name)
          return
        }
      }
    }
    setExpandedItem(null)
  }, [pathname, collapsed])

  const toggleExpanded = (itemName: string) => {
    if (collapsed) return // Prevent expansion when collapsed

    setExpandedItem(expandedItem === itemName ? null : itemName)
  }

  const isActive = (href: string) => pathname === href

  const isParentActive = (children: any[]) => {
    return children.some((child) => pathname === child.href)
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
        {navigation.map((item) => {
          if (item.children) {
            const isExpanded = expandedItem === item.name
            const hasActiveChild = isParentActive(item.children)

            return (
              <div key={item.name} className="transition-all duration-300 ease-in-out">
                <div
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    "sidebar-item text-base", // Increased text size
                    hasActiveChild && "active"
                  )}
                >
                  <item.icon className="sidebar-item-icon" />
                  {!collapsed && (
                    <>
                      <span className="sidebar-item-text font-medium tracking-wide">{item.name}</span>
                      <ChevronRight className={cn(
                        "sidebar-item-arrow transition-transform duration-300 ease-in-out",
                        isExpanded && "expanded"
                      )} />
                    </>
                  )}
                </div>

                {!collapsed && (
                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="sidebar-submenu">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          prefetch={true}
                          className={cn(
                            "sidebar-submenu-item text-sm", // Slightly larger submenu text
                            isActive(child.href) && "active"
                          )}
                        >
                          <child.icon className="sidebar-submenu-item-icon" />
                          <span className="font-medium">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          }

          return (
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
          )
        })}
      </nav>
    </div>
  )
}