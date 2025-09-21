"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { VisitorList } from "@/components/visitor/visitorList"
import { PageHeader } from "@/components/common/pageHeader"

export default function VisitorListPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <VisitorList />
      </div>
    </ProtectedLayout>
  )
}
