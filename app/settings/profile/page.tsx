"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { ProfilePageContent } from "@/components/profile"

export default function ProfilePage() {
  return (
    <ProtectedLayout>
      <ProfilePageContent />
    </ProtectedLayout>
  )
}


