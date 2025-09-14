"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, 
  LayoutDashboard,
  Users, 
  Calendar, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  UserPlus,
  CalendarPlus,
  Trash2,
  LogOut
} from "lucide-react"

interface MobileSidebarProps {
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

export function MobileSidebar({ className }: MobileSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(["Employees", "Appointments"])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((item) => item !== itemName) : [...prev, itemName],
    )
  }

  const isActive = (href: string | undefined) => href ? pathname === href : false

  const isParentActive = (children: any[]) => {
    return children.some((child) => pathname === child.href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col bg-white">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Image
                src="/aynzo-logo.svg"
                alt="Aynzo Logo"
                width={32}
                height={32}
                className="h-15 w-15"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedItems.includes(item.name)
              const isItemActive = isActive(item.href) || (hasChildren && isParentActive(item.children))

              return (
                <div key={item.name}>
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isItemActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {hasChildren ? (
                        <span>{item.name}</span>
                      ) : (
                        <Link 
                          href={item.href || "#"} 
                          className="flex-1"
                          onClick={() => setOpen(false)}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleExpanded(item.name)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Submenu */}
                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-primary text-white font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            onClick={() => setOpen(false)}
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => setOpen(false)}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
