import { ProtectedLayout } from "@/components/layout/protected-layout"
import { EmployeeForm } from "@/components/employee/employee-form"
import { PageHeader } from "@/components/common/page-header"

export default function CreateEmployeePage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex justify-center">
          <EmployeeForm />
        </div>
      </div>
    </ProtectedLayout>
  )
}
