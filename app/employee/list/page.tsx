import { ProtectedLayout } from "@/components/layout/protected-layout"
import { EmployeeList } from "@/components/employee/employee-list"

export default function EmployeeListPage() {
  return (
    <ProtectedLayout>
      <EmployeeList />
    </ProtectedLayout>
  )
}
