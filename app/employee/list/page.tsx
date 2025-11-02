"use client"

import { Suspense, lazy } from "react"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { PageSkeleton } from "@/components/common/tableSkeleton"

const EmployeeList = lazy(() => 
  import("@/components/employee/employeeList").then(module => ({ default: module.EmployeeList }))
)

export default function EmployeeListPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<PageSkeleton />}>
        <EmployeeList />
      </Suspense>
    </ProtectedLayout>
  )
}
