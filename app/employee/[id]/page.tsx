"use client"

import { useParams } from "next/navigation"
import { EmployeeForm } from "@/components/employee/employeeForm"
import { ProtectedLayout } from "@/components/layout/protectedLayout"

export default function EmployeeEditPage() {
  const params = useParams()
  const employeeId = params.id as string
  
  if (!employeeId) {
    return (
      <ProtectedLayout>
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground">Employee Not Found</h2>
            <p className="text-muted-foreground">Please select an employee to edit.</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }
  
  return (
    <ProtectedLayout>
      <EmployeeForm employeeId={employeeId} />
    </ProtectedLayout>
  )
}

