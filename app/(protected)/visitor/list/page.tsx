"use client"

import { Suspense, lazy } from "react"

import { PageSkeleton } from "@/components/common/pageSkeleton"

const VisitorList = lazy(() =>
  import("@/components/visitor/visitorList").then(module => ({ default: module.VisitorList }))
)

export default function VisitorListPage() {
  return (
    <div className="container mx-auto space-y-8">
      <Suspense fallback={<PageSkeleton />}>
        <VisitorList />
      </Suspense>
    </div>
  )
}
