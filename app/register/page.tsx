import { RegisterForm } from "@/components/auth/register-form"
import { PublicLayout } from "@/components/layout/public-layout"

export default function RegisterPage() {
  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <RegisterForm />
      </div>
    </PublicLayout>
  )
}
