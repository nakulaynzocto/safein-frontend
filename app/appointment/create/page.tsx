import { ProtectedLayout } from "@/components/layout/protected-layout"
import { AppointmentForm } from "@/components/appointment/appointment-form"
import { PageHeader } from "@/components/common/page-header"

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
