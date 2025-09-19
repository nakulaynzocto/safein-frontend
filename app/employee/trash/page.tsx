"use client"

import { ProtectedLayout } from "@/components/layout/protectedLayout"
import { EmployeeTrashTable } from "@/components/employee/employeeTrashTable"
import { PageHeader } from "@/components/common/pageHeader"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { routes } from "@/utils/routes"

export default function EmployeeTrashPage() {
  return (
    <ProtectedLayout>
      <div className="container mx-auto space-y-8">
        <PageHeader 
          title="Employee Trash" 
          description="Manage deleted employees - restore or permanently delete"
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={routes.privateroute.EMPLOYEELIST} prefetch={true}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Employees
              </Link>
            </Button>
          </div>
        </PageHeader>
        
        <div className="space-y-6">
          <EmployeeTrashTable />
        </div>
      </div>
    </ProtectedLayout>
  )
}

