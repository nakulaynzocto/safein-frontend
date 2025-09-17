"use client"

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { TrashTable } from "@/components/trash/trash-table"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { routes } from "@/utils/routes"

export default function AppointmentTrashPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <PageHeader 
          title="Appointment Trash" 
          description="Manage deleted appointments"
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.privateroute.APPOINTMENTLIST} prefetch={true}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore All
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Trash
            </Button>
          </div>
        </PageHeader>
        
        <div className="space-y-6">
          <TrashTable type="appointment" />
        </div>
      </div>
    </ProtectedLayout>
  )
}

