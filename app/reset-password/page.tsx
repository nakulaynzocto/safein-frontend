"use client"

import { ResetPasswordForm } from "@/components/auth/resetPasswordForm"
import { PublicLayout } from "@/components/layout/publicLayout"

export default function ResetPasswordPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 overflow-hidden">
        <ResetPasswordForm />
      </div>
    </PublicLayout>
  )
}







