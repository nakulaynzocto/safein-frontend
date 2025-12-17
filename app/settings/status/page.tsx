"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { SettingsPageContent } from "@/components/settings/SettingsPageContent"

export default function SettingsStatusPage() {
  return (
    <ProtectedLayout>
      <SettingsPageContent />
    </ProtectedLayout>
  )
}

