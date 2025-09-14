import { ProtectedLayout } from "@/components/layout/protected-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardOverview />
    </ProtectedLayout>
  )
}
