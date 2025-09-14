import { ProtectedLayout } from "@/components/layout/protected-layout"
import { AppointmentList } from "@/components/appointment/appointment-list"

export default function AppointmentListPage() {
  return (
    <ProtectedLayout>
      <AppointmentList />
    </ProtectedLayout>
  )
}
