"use client"

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { ProfilePageContent } from "@/components/profile"

export default function ProfilePage() {
  return (
    <ProtectedLayout>
      <ProfilePageContent />
    </ProtectedLayout>
  )
}