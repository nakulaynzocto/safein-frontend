"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CalendarPlus, UserPlus, Users } from "lucide-react"
import { routes } from "@/utils/routes"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useGetTrialLimitsStatusQuery } from "@/store/api/userSubscriptionApi"

interface QuickAction {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const quickActions: QuickAction[] = [
  {
    href: routes.privateroute.APPOINTMENTLIST,
    icon: Calendar,
    label: "View All Appointments",
  },
  {
    href: routes.privateroute.EMPLOYEELIST,
    icon: Users,
    label: "Manage Employees",
  },
]

export function QuickActions() {
  const { data: trialStatus } = useGetTrialLimitsStatusQuery()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const hasReachedEmployeeLimit = trialStatus?.data?.isTrial && trialStatus.data.limits.employees.reached
  const hasReachedAppointmentLimit = trialStatus?.data?.isTrial && trialStatus.data.limits.appointments.reached

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {hasReachedAppointmentLimit ? (
            <>
              <Button
                className="h-16 sm:h-20 flex-col bg-transparent text-xs sm:text-sm p-2"
                variant="outline"
                onClick={() => setShowUpgradeModal(true)}
              >
                <CalendarPlus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-center line-clamp-2">Upgrade to Create More</span>
              </Button>
            </>
          ) : (
            <Button
              className="h-16 sm:h-20 flex-col bg-transparent text-xs sm:text-sm p-2"
              variant="outline"
              asChild
            >
              <Link href={routes.privateroute.APPOINTMENTCREATE} prefetch>
                <CalendarPlus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-center line-clamp-2">Create Appointment</span>
              </Link>
            </Button>
          )}

          {quickActions.map((action) => (
            <Button
              key={action.href}
              className="h-16 sm:h-20 flex-col bg-transparent text-xs sm:text-sm p-2"
              variant="outline"
              asChild
            >
              <Link href={action.href} prefetch={true}>
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-center line-clamp-2">{action.label}</span>
              </Link>
            </Button>
          ))}
          
          {hasReachedEmployeeLimit ? (
            <>
              <Button
                className="h-16 sm:h-20 flex-col bg-transparent text-xs sm:text-sm p-2"
                variant="outline"
                onClick={() => setShowUpgradeModal(true)}
              >
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-center line-clamp-2">Upgrade to Add More</span>
              </Button>
            </>
          ) : (
            <Button
              className="h-16 sm:h-20 flex-col bg-transparent text-xs sm:text-sm p-2"
              variant="outline"
              asChild
            >
              <Link href={routes.privateroute.EMPLOYEECREATE} prefetch>
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-center line-clamp-2">Add Employee</span>
              </Link>
            </Button>
          )}

          <UpgradePlanModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
