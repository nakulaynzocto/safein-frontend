"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { routes } from "@/utils/routes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { 
  Menu, 
  LayoutDashboard,
  Users, 
  Calendar, 
  UserPlus,
  Settings,
  Bell,
  User,
} from "lucide-react"

interface MobileSidebarProps {
  className?: string
}

const mainNavigation = [
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

const secondaryNavigation = [
  {
    name: "Notifications",
    href: routes.privateroute.NOTIFICATIONS,
    icon: Bell,
  },
  {
    name: "Profile",
    href: routes.privateroute.PROFILE,
    icon: User,
  },
  {
    name: "Settings",
    href: routes.privateroute.SETTINGS,
    icon: Settings,
  },
]


export function MobileSidebar({ className }: MobileSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  const NavLink = ({ item }: { item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> } }) => (
    <Link
      href={item.href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
        isActive(item.href)
          ? "bg-brand text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
      )}
      onClick={() => setOpen(false)}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">{item.name}</span>
    </Link>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("md:hidden", className)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
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
        
        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <nav className="space-y-1 p-3">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</p>
            {mainNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          <Separator className="my-2" />

          {/* Secondary Navigation */}
          <nav className="space-y-1 p-3">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</p>
            {secondaryNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">© 2024 Aynzo. All rights reserved.</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
