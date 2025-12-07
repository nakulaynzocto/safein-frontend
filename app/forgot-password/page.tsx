"use client"

import { ForgotPasswordForm } from "@/components/auth/forgotPasswordForm"
import { PublicLayout } from "@/components/layout/publicLayout"

export default function ForgotPasswordPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 overflow-hidden">
        <ForgotPasswordForm />
      </div>
    </PublicLayout>
  )
}







