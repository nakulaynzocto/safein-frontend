import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { EmployeeForm } from "@/components/employee/employeeForm"
import { PageHeader } from "@/components/common/pageHeader"

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
