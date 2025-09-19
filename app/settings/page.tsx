"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { SettingsForm } from "@/components/settings"
import { PageHeader } from "@/components/common/pageHeader"

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Settings" 
          description="Manage your application settings and preferences"
        />
        <SettingsForm />
      </div>
    </ProtectedLayout>
  )
}

