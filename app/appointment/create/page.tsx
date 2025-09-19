import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { AppointmentForm } from "@/components/appointment/appointmentForm"
import { PageHeader } from "@/components/common/pageHeader"

export default function CreateAppointmentPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex justify-center">
          <AppointmentForm />
        </div>
      </div>
    </ProtectedLayout>
  )
}
