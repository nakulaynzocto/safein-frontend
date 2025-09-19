"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { VisitorRegistrationFlow } from "@/components/appointment/visitorRegistrationFlow"

export default function VisitorRegistrationPage() {
  return (
    <ProtectedLayout>
      <VisitorRegistrationFlow />
    </ProtectedLayout>
  )
}
