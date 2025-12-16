"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/pageHeader"
import { CalendarPlus } from "lucide-react"
import { NewAppointmentModal } from "@/components/appointment/NewAppointmentModal"
import { UpgradePlanModal } from "@/components/common/upgradePlanModal"
import { useGetTrialLimitsStatusQuery } from "@/store/api/userSubscriptionApi"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { data: trialStatus } = useGetTrialLimitsStatusQuery()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const hasReachedAppointmentLimit =
    trialStatus?.data?.isTrial && trialStatus.data.limits.appointments.reached

  return (
    <PageHeader title={`Hi, ${userName || "User"}!`}>
      <div className="flex gap-2 w-full sm:w-auto">
        {hasReachedAppointmentLimit ? (
          <>
            <Button onClick={() => setShowUpgradeModal(true)} className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap">
              <CalendarPlus className="mr-1 sm:mr-2 h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Upgrade to Create More</span>
              <span className="sm:hidden">Upgrade</span>
            </Button>
            <UpgradePlanModal
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
            />
          </>
        ) : (
          <NewAppointmentModal
            triggerButton={
              <Button className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap">
                <CalendarPlus className="mr-1.5 h-4 w-4 shrink-0" />
                New Appointment
              </Button>
            }
          />
        )}
      </div>
    </PageHeader>
  )
}


