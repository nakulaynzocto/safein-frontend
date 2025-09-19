"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { AppointmentTrashTable } from "@/components/appointment/appointmentTrashTable"
import { PageHeader } from "@/components/common/pageHeader"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { routes } from "@/utils/routes"

export default function AppointmentTrashPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <PageHeader 
          title="Appointment Trash" 
          description="Manage deleted appointments - restore or permanently delete"
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.privateroute.APPOINTMENTLIST} prefetch={true}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Link>
            </Button>
          </div>
        </PageHeader>
        
        <div className="space-y-6">
          <AppointmentTrashTable />
        </div>
      </div>
    </ProtectedLayout>
  )
}