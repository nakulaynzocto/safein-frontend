"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CalendarPlus, UserPlus, Users } from "lucide-react"

interface QuickAction {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const quickActions: QuickAction[] = [
  {
    href: "/appointment/create",
    icon: CalendarPlus,
    label: "Create Appointment",
  },
  {
    href: "/appointment/list",
    icon: Calendar,
    label: "View All Appointments",
  },
  {
    href: "/employee/create",
    icon: UserPlus,
    label: "Add Employee",
  },
  {
    href: "/employee/list",
    icon: Users,
    label: "Manage Employees",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              className="h-20 flex-col bg-transparent"
              variant="outline"
              asChild
            >
              <Link href={action.href} prefetch={true}>
                <action.icon className="h-6 w-6 mb-2" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
