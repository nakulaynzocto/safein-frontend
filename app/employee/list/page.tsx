import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { EmployeeList } from "@/components/employee/employeeList"

export default function EmployeeListPage() {
  return (
    <ProtectedLayout>
      <EmployeeList />
    </ProtectedLayout>
  )
}
