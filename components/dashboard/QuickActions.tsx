"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CalendarPlus, UserPlus, Users } from "lucide-react"
import { routes } from "@/utils/routes"
import { NewEmployeeModal } from "@/components/employee/NewEmployeeModal"
import { NewAppointmentModal } from "@/components/appointment/NewAppointmentModal"
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
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {hasReachedAppointmentLimit ? (
            <>
              <Button
                className="h-20 flex-col bg-transparent"
                variant="outline"
                onClick={() => setShowUpgradeModal(true)}
              >
                <CalendarPlus className="h-6 w-6 mb-2" />
                Upgrade to Create More
              </Button>
            </>
          ) : (
            <NewAppointmentModal
              triggerButton={
                <Button
                  className="h-20 flex-col bg-transparent"
                  variant="outline"
                  asChild
                >
                  <div>
                    <CalendarPlus className="h-6 w-6 mb-2" />
                    Create Appointment
                  </div>
                </Button>
              }
            />
          )}

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
          
          {hasReachedEmployeeLimit ? (
            <>
              <Button
                className="h-20 flex-col bg-transparent"
                variant="outline"
                onClick={() => setShowUpgradeModal(true)}
              >
                <UserPlus className="h-6 w-6 mb-2" />
                Upgrade to Add More
              </Button>
            </>
          ) : (
            <NewEmployeeModal
              trigger={
                <Button
                  className="h-20 flex-col bg-transparent"
                  variant="outline"
                  asChild
                >
                  <div>
                    <UserPlus className="h-6 w-6 mb-2" />
                    Add Employee
                  </div>
                </Button>
              }
            />
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
