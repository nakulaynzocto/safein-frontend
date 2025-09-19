"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { DashboardOverview } from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardOverview />
    </ProtectedLayout>
  )
}
