"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { routes } from "@/utils/routes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, 
  LayoutDashboard,
  Users, 
  Calendar, 
  UserPlus,
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

export function MobileSidebar({ className }: MobileSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("md:hidden", className)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-brand text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
