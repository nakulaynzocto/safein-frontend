import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { AppointmentBookingFlow } from "@/components/appointment/appointmentBookingFlow"
import { PageHeader } from "@/components/common/pageHeader"

export default function CreateAppointmentPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <AppointmentBookingFlow />
      </div>
    </ProtectedLayout>
  )
}
