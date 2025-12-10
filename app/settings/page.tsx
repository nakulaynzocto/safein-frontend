"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { SettingsPageContent } from "@/components/settings/SettingsPageContent"

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <SettingsPageContent />
    </ProtectedLayout>
  )
}


