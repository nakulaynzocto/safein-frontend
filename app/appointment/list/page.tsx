import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { AppointmentList } from "@/components/appointment/appointmentList"

export default function AppointmentListPage() {
  return (
    <ProtectedLayout>
      <AppointmentList />
    </ProtectedLayout>
  )
}
