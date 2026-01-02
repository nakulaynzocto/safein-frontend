"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { VisitorRegister } from "@/components/visitor/visitorRegister"
import { CreateVisitorRequest } from "@/store/api/visitorApi"
import { useRouter } from "next/navigation"
import { routes } from "@/utils/routes"

// Page: VisitorRegister (non-modal page version)
export default function VisitorRegisterPage() {
  const router = useRouter()

  const handleVisitorComplete = (visitorData: CreateVisitorRequest) => {
    router.push(routes.privateroute.VISITORLIST)
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto max-w-full py-3 sm:py-4">
        <div className="mb-3">
          <h1 className="text-lg font-semibold text-foreground leading-tight">Register New Visitor</h1>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Enter visitor details, address, ID proof, and optional notes to register them in the system
          </p>
        </div>
        <div className="w-full">
          <VisitorRegister
            onComplete={handleVisitorComplete}
            standalone={true}
          />
        </div>
      </div>
    </ProtectedLayout>
  )
}