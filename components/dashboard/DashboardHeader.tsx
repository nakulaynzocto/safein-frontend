"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { CalendarPlus } from "lucide-react"
import { routes } from "@/utils/routes"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <PageHeader title={`Hi, ${userName || "User"}!`}>
      <div className="flex gap-2">
        <Button asChild>
          <Link href={routes.privateroute.APPOINTMENTCREATE} prefetch={true}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>
    </PageHeader>
  )
}
