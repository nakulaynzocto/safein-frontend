"use client"

import { Suspense, lazy } from "react"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { PageSkeleton } from "@/components/common/tableSkeleton"

const AppointmentList = lazy(() => 
  import("@/components/appointment/appointmentList").then(module => ({ default: module.AppointmentList }))
)

export default function AppointmentListPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<PageSkeleton />}>
        <AppointmentList />
      </Suspense>
    </ProtectedLayout>
  )
}
