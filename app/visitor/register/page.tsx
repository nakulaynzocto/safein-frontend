"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { VisitorRegister } from "@/components/visitor/visitorRegister"
import { CreateVisitorRequest } from "@/store/api/visitorApi"

export default function VisitorRegistrationPage() {
  const handleVisitorComplete = (visitorData: CreateVisitorRequest) => {
    // You can add additional logic here, such as redirecting to a success page
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <VisitorRegister 
          onComplete={handleVisitorComplete}
          standalone={true}
        />
      </div>
    </ProtectedLayout>
  )
}