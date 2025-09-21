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
  Settings,
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
    icon: Users,
    children: [
      {
        name: "All Employees",
        href: routes.privateroute.EMPLOYEELIST,
        icon: Users,
      },
      {
        name: "Add Employee",
        href: routes.privateroute.EMPLOYEECREATE,
        icon: UserPlus,
      },
      {
        name: "Trash",
        href: routes.privateroute.EMPLOYEETRASH,
        icon: Trash2,
      },
    ],
  },
  {
    name: "Visitor Registration",
    icon: UserCheck,
    children: [
      {
        name: "All Visitors",
        href: routes.privateroute.VISITORLIST,
        icon: Users,
      },
      {
        name: "Register Visitor",
        href: routes.privateroute.VISITORREGISTRATION,
        icon: UserPlus,
      },
    ],
  },
  {
    name: "Appointments",
    icon: Calendar,
    children: [
      {
        name: "All Appointments",
        href: routes.privateroute.APPOINTMENTLIST,
        icon: Calendar,
      },
      {
        name: "Create Appointment",
        href: routes.privateroute.APPOINTMENTCREATE,
        icon: CalendarPlus,
      },
      {
        name: "Trash",
        href: routes.privateroute.APPOINTMENTTRASH,
        icon: Trash2,
      },
    ],
  },
  {
    name: "Settings",
    href: routes.privateroute.SETTINGS,
    icon: Settings,
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

  const toggleExpanded = (itemName: string, children?: any[]) => {
    if (collapsed) return // Prevent expansion when collapsed

    const newExpanded = expandedItem === itemName ? null : itemName
    setExpandedItem(newExpanded)

    if (children && children.length > 0 && newExpanded === itemName) {
      const activeChild = children.find((child) => child.href === pathname)
      if (!activeChild) {
        router.push(children[0].href)
      }
    }
  }

  const isActive = (href: string) => pathname === href

  const isParentActive = (children: any[]) => {
    return children.some((child) => pathname === child.href)
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col sidebar-hostinger transition-all duration-300 overflow-hidden",
        collapsed ? "sidebar-collapsed" : "sidebar-expanded",
        className,
      )}
    >

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          if (item.children) {
            const isExpanded = expandedItem === item.name
            const hasActiveChild = isParentActive(item.children)

            return (
              <div key={item.name}>
                <div
                  onClick={() => toggleExpanded(item.name, item.children)}
                  className={cn(
                    "sidebar-item",
                    hasActiveChild && "active"
                  )}
                >
                  <item.icon className="sidebar-item-icon" />
                  {!collapsed && (
                    <>
                      <span className="sidebar-item-text">{item.name}</span>
                      <ChevronRight className={cn("sidebar-item-arrow", isExpanded && "expanded")} />
                    </>
                  )}
                </div>

                {!collapsed && isExpanded && (
                  <div className="sidebar-submenu">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        prefetch={true}
                        className={cn(
                          "sidebar-submenu-item",
                          isActive(child.href) && "active"
                        )}
                      >
                        <child.icon className="sidebar-submenu-item-icon" />
                        {child.name}
                      </Link>
                    ))}
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
                "sidebar-item",
                isActive(item.href!) && "active"
              )}
            >
              <item.icon className="sidebar-item-icon" />
              {!collapsed && <span className="sidebar-item-text">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}