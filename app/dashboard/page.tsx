"use client"

import { Suspense, lazy } from "react"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { DashboardSkeleton } from "@/components/common/tableSkeleton"

const DashboardOverview = lazy(() => 
  import("@/components/dashboard").then(module => ({ default: module.DashboardOverview }))
)

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </ProtectedLayout>
  )
}
