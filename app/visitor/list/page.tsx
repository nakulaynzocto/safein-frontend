"use client"

import { Suspense, lazy } from "react"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { PageSkeleton } from "@/components/common/tableSkeleton"

const VisitorList = lazy(() => 
  import("@/components/visitor/visitorList").then(module => ({ default: module.VisitorList }))
)

export default function VisitorListPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <Suspense fallback={<PageSkeleton />}>
          <VisitorList />
        </Suspense>
      </div>
    </ProtectedLayout>
  )
}
