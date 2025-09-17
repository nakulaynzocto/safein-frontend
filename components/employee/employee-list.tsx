"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from "@/store/api/employeeApi"
import { showSuccess, showError } from "@/utils/toaster"
import { UserPlus, Edit, Trash2 } from "lucide-react"
import { routes } from "@/utils/routes"

export function EmployeeList() {
  const router = useRouter()
  const { data: employees = [], isLoading, error } = useGetEmployeesQuery()
  const [deleteEmployee] = useDeleteEmployeeMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!selectedEmployee) return

    try {
      await deleteEmployee(selectedEmployee).unwrap()
      showSuccess("Employee deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedEmployee(null)
    } catch (error: any) {
      showError(error?.data?.message || error?.message || "Failed to delete employee")
    }
  }

  const openDeleteDialog = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    setDeleteDialogOpen(true)
  }

  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "phone",
      header: "Phone",
      sortable: true,
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (employee: any) => (
        <span className="capitalize">{employee.department.replace(/([A-Z])/g, " $1").trim()}</span>
      ),
    },
    {
      key: "position",
      header: "Position",
      sortable: true,
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (employee: any) => <StatusBadge status={employee.isActive ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (employee: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => openDeleteDialog(employee.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  const emptyData = {
    title: "No employees found",
    primaryActionLabel: "Add employee",
    description: "You don't have any employees in your organization. Add your first employee to get started.",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage your organization's employees">
        <Button asChild>
          <Link href={routes.privateroute.EMPLOYEECREATE} prefetch={true}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </PageHeader>

      <DataTable 
        data={employees} 
        columns={columns} 
        isLoading={isLoading} 
        emptyData={emptyData}
        enableSorting={true}
        onPrimaryAction={() => router.push(routes.privateroute.EMPLOYEECREATE)}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
