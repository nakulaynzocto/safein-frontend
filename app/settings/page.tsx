import { ProtectedLayout } from "@/components/layout/protected-layout"
import { SettingsForm } from "@/components/settings/settings-form"
import { PageHeader } from "@/components/common/page-header"

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex justify-center">
          <SettingsForm />
        </div>
      </div>
    </ProtectedLayout>
  )
}

