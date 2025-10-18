"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/pageHeader"
import { CalendarPlus } from "lucide-react"
import { routes } from "@/utils/routes"
import { NewAppointmentModal } from "@/components/appointment/NewAppointmentModal"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <PageHeader title={`Hi, ${userName || "User"}!`}>
      <div className="flex gap-2">
        <NewAppointmentModal
          triggerButton={
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          }
        />
      </div>
    </PageHeader>
  )
}
