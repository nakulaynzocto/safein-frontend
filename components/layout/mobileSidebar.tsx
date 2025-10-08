"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { routes } from "@/utils/routes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, 
  LayoutDashboard,
  Users, 
  Calendar, 
  Settings, 
  ChevronRight,
  UserPlus,
  CalendarPlus,
  Trash2,
  LogOut,
  UserCheck
} from "lucide-react"

interface MobileSidebarProps {
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

export function MobileSidebar({ className }: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Automatically expand the parent category based on current pathname
  useEffect(() => {
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
  }, [pathname])

  const toggleExpanded = (itemName: string, children?: any[]) => {
    const newExpanded = expandedItem === itemName ? null : itemName
    setExpandedItem(newExpanded)

    if (children && children.length > 0 && newExpanded === itemName) {
      const activeChild = children.find((child) => child.href === pathname)
      if (!activeChild) {
        router.push(children[0].href)
        setOpen(false) // Close mobile sidebar after navigation
      }
    }
  }

  const isActive = (href: string) => pathname === href

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
      <SheetContent side="left" className="w-72 p-0 sidebar-hostinger">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col bg-white">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            {/* <div className="flex items-center gap-3">
              <Image
                src="/aynzo-logo.svg"
                alt="Aynzo Logo"
                width={32}
                height={32}
                className="h-15 w-15"
              />
            </div> */}
          </div>

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
                      <span className="sidebar-item-text">{item.name}</span>
                      <ChevronRight className={cn("sidebar-item-arrow", isExpanded && "expanded")} />
                    </div>

                    {isExpanded && (
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
                            onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="sidebar-item-icon" />
                  <span className="sidebar-item-text">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <Button 
              className="btn-hostinger btn-hostinger-secondary w-full justify-start gap-3"
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
