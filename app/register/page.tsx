"use client"

import { RegisterForm } from "@/components/auth/registerForm"
import { PublicLayout } from "@/components/layout/publicLayout"

export default function RegisterPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 overflow-hidden">
        <RegisterForm />
      </div>
    </PublicLayout>
  )
}
