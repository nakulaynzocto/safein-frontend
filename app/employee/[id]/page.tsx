"use client"

import { useParams } from "next/navigation"
import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { NewEmployeeModal } from "@/components/employee/EmployeeForm"

export default function EmployeeEditPage() {
  const params = useParams()
  const employeeId = params.id as string
  
  if (!employeeId) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto max-w-4xl py-3 sm:py-4">
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-foreground">Employee Not Found</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Please select an employee to edit.</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }
  
  return (
    <ProtectedLayout>
      <div className="container mx-auto max-w-4xl py-3 sm:py-4">
        <div className="mb-3">
          <h1 className="text-lg font-semibold text-foreground leading-tight">Edit Employee</h1>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Update employee details and information
          </p>
        </div>
        <div className="w-full">
          <NewEmployeeModal 
            employeeId={employeeId}
            layout="page"
          />
        </div>
      </div>
    </ProtectedLayout>
  )
}

