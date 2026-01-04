"use client"

import { useParams } from "next/navigation"
import { NewVisitorModal } from "@/components/visitor/VisitorForm"


export default function VisitorEditPage() {
  const params = useParams()
  const visitorId = params.id as string

  if (!visitorId) {
    return (
      <div className="container mx-auto max-w-4xl py-3 sm:py-4">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-foreground">Visitor Not Found</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Please select a visitor to edit.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-full py-3 sm:py-4">
      <div className="mb-3">
        <h1 className="text-lg font-semibold text-foreground leading-tight">Edit Visitor</h1>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Update visitor information and details
        </p>
      </div>
      <div className="w-full">
        <NewVisitorModal
          visitorId={visitorId}
          layout="page"
        />
      </div>
    </div>
  )
}
