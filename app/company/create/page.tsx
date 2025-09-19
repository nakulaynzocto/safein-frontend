"use client"

import { AuthWrapper } from "@/components/layout/authWrapper"
import { CompanyForm } from "@/components/company/companyForm"

export default function CreateCompanyPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background py-8">
        <CompanyForm />
      </div>
    </AuthWrapper>
  )
}
