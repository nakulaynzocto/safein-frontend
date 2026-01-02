"use client"

import { useParams } from "next/navigation"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { NewAppointmentModal } from "@/components/appointment/AppointmentForm"

export default function AppointmentEditPage() {
  const params = useParams()
  const appointmentId = params.id as string

  if (!appointmentId) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto max-w-4xl py-3 sm:py-4">
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-foreground">Appointment Not Found</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Please select an appointment to edit.</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto max-w-full py-3 sm:py-4">
        <div className="mb-3">
          <h1 className="text-lg font-semibold text-foreground leading-tight">Edit Appointment</h1>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Update appointment details and information
          </p>
        </div>
        <div className="w-full">
          <NewAppointmentModal
            appointmentId={appointmentId}
            layout="page"
          />
        </div>
      </div>
    </ProtectedLayout>
  )
}

