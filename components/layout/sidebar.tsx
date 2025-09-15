"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Employees",
    icon: Users,
    children: [
      {
        name: "All Employees",
        href: "/employee/list",
        icon: Users,
      },
      {
        name: "Add Employee",
        href: "/employee/create",
        icon: UserPlus,
      },
      {
        name: "Trash",
        href: "/employee/trash",
        icon: Trash2,
      },
    ],
  },
  {
    name: "Appointments",
    icon: Calendar,
    children: [
      {
        name: "All Appointments",
        href: "/appointment/list",
        icon: Calendar,
      },
      {
        name: "Create Appointment",
        href: "/appointment/create",
        icon: CalendarPlus,
      },
      {
        name: "Trash",
        href: "/appointment/trash",
        icon: Trash2,
      },
    ],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(["Employees", "Appointments"])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  const isActive = (href: string) => pathname === href

  const isParentActive = (children: any[]) => {
    return children.some((child) => pathname === child.href)
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && <span className="text-lg font-semibold text-sidebar-foreground">Menu</span>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          if (item.children) {
            const isExpanded = expandedItems.includes(item.name)
            const hasActiveChild = isParentActive(item.children)

            return (
              <div key={item.name}>
                <Button
                  variant="ghost"
                  onClick={() => !collapsed && toggleExpanded(item.name)}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                    </>
                  )}
                </Button>

                {!collapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Button
                        key={child.href}
                        variant="ghost"
                        asChild
                        className={cn(
                          "w-full justify-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive(child.href) && "bg-sidebar-primary text-sidebar-primary-foreground",
                        )}
                      >
                        <Link href={child.href}>
                          <child.icon className="mr-2 h-3 w-3" />
                          {child.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(item.href!) && "bg-sidebar-primary text-sidebar-primary-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <Link href={item.href!}>
                <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                {!collapsed && item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
