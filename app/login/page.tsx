import { LoginForm } from "@/components/auth/login-form"
import { PublicLayout } from "@/components/layout/public-layout"

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <LoginForm />
      </div>
    </PublicLayout>
  )
}
