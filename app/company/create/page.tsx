"use client"

import { AuthWrapper } from "@/components/layout/auth-wrapper"
import { CompanyForm } from "@/components/company/company-form"

export default function CreateCompanyPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background py-8">
        <CompanyForm />
      </div>
    </AuthWrapper>
  )
}
