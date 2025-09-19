"use client"

import { LoginForm } from "@/components/auth/loginForm"
import { PublicLayout } from "@/components/layout/publicLayout"

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 overflow-hidden">
        <LoginForm />
      </div>
    </PublicLayout>
  )
}
