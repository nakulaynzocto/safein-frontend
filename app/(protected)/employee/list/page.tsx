"use client"

import { Suspense, lazy } from "react"

import { PageSkeleton } from "@/components/common/pageSkeleton"

const EmployeeList = lazy(() =>
  import("@/components/employee/employeeList").then(module => ({ default: module.EmployeeList }))
)

export default function EmployeeListPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EmployeeList />
    </Suspense>
  )
}
