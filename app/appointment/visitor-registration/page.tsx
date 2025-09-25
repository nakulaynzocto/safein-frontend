"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { SimpleVisitorRegistration } from "@/components/visitor/simpleVisitorRegistration"

export default function VisitorRegistrationPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <SimpleVisitorRegistration />
      </div>
    </ProtectedLayout>
  )
}
